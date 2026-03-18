import 'dotenv/config';
import Database from 'better-sqlite3';
import express from 'express';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import {fileURLToPath} from 'url';
import {GoogleGenAI} from '@google/genai';

const {Pool} = pg;

const app = express();
app.use(express.json({limit: '1mb'}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');

let dbMode = 'disconnected';
let dbConnected = false;
let dbError = null;
let pgPool = null;
let sqliteDb = null;
let sqlite = null;

function normalizeEnvValue(value) {
  if (!value) return '';
  let normalized = String(value).trim();
  if (!normalized) return '';

  if (/^[A-Z0-9_]+=/.test(normalized) && normalized.includes('://')) {
    normalized = normalized.slice(normalized.indexOf('=') + 1).trim();
  }

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function resolveDatabaseUrl() {
  const keys = [
    'DATABASE_URL',
    'DATABASE_PRIVATE_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING',
    'RAILWAY_DATABASE_URL',
  ];

  for (const key of keys) {
    const value = normalizeEnvValue(process.env[key]);
    if (value) return value;
  }

  const host = normalizeEnvValue(process.env.PGHOST);
  const user = normalizeEnvValue(process.env.PGUSER);
  const database = normalizeEnvValue(process.env.PGDATABASE);
  if (!host || !user || !database) return '';

  const password = normalizeEnvValue(process.env.PGPASSWORD);
  const port = normalizeEnvValue(process.env.PGPORT) || '5432';
  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  return `postgresql://${auth}@${host}:${port}/${database}`;
}

function getSslAttempts(connectionString) {
  let host = '';
  let sslMode = '';

  try {
    const parsed = new URL(connectionString);
    host = parsed.hostname.toLowerCase();
    sslMode = (parsed.searchParams.get('sslmode') || '').toLowerCase();
  } catch {
    // Keep defaults and attempt both variants.
  }

  const envSslMode = normalizeEnvValue(process.env.PGSSLMODE).toLowerCase();
  const effectiveSslMode = sslMode || envSslMode;
  const isInternal = host.includes('.internal');

  if (effectiveSslMode === 'disable') return [false];
  if (effectiveSslMode === 'require' || effectiveSslMode === 'verify-ca' || effectiveSslMode === 'verify-full') return [true];
  if (process.env.NODE_ENV === 'production' && !isInternal) return [true, false];
  return [false, true];
}

async function initPostgres(connectionString) {
  const attempts = getSslAttempts(connectionString);

  for (const useSsl of attempts) {
    const candidate = new Pool({
      connectionString,
      ssl: useSsl ? {rejectUnauthorized: false} : false,
    });

    try {
      await candidate.query('SELECT 1');
      await candidate.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          "customerName" TEXT NOT NULL,
          date TEXT NOT NULL,
          details TEXT NOT NULL,
          phone TEXT NOT NULL,
          deposit TEXT NOT NULL,
          status TEXT NOT NULL,
          type TEXT NOT NULL,
          operator TEXT NOT NULL,
          "deletedAt" BIGINT
        );

        CREATE TABLE IF NOT EXISTS school_orders (
          id SERIAL PRIMARY KEY,
          "schoolName" TEXT NOT NULL,
          "className" TEXT NOT NULL,
          "vignetteType" TEXT NOT NULL,
          price TEXT NOT NULL,
          "monitorPhone" TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          "deletedAt" BIGINT
        );
      `);

      pgPool = candidate;
      dbMode = 'postgres';
      dbConnected = true;
      dbError = null;
      console.log(`Database connected (PostgreSQL, ${useSsl ? 'SSL' : 'no SSL'})`);
      return true;
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
      console.error(`PostgreSQL connection failed (${useSsl ? 'SSL' : 'no SSL'}):`, error);
      await candidate.end().catch(() => undefined);
    }
  }

  return false;
}

function initSqlite() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, {recursive: true});
  }

  const dbPath = process.env.DB_PATH || path.join(dataDir, 'app.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      date TEXT NOT NULL,
      details TEXT NOT NULL,
      phone TEXT NOT NULL,
      deposit TEXT NOT NULL,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      operator TEXT NOT NULL,
      deletedAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS school_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schoolName TEXT NOT NULL,
      className TEXT NOT NULL,
      vignetteType TEXT NOT NULL,
      price TEXT NOT NULL,
      monitorPhone TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      deletedAt INTEGER
    );
  `);

  sqlite = {
    orderSelectAll: sqliteDb.prepare('SELECT * FROM orders ORDER BY id DESC'),
    orderSelectById: sqliteDb.prepare('SELECT * FROM orders WHERE id = ?'),
    orderInsert: sqliteDb.prepare(`
      INSERT INTO orders (customerName, date, details, phone, deposit, status, type, operator, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `),
    orderSoftDelete: sqliteDb.prepare('UPDATE orders SET deletedAt = ? WHERE id = ?'),
    orderRestore: sqliteDb.prepare('UPDATE orders SET deletedAt = NULL WHERE id = ?'),
    schoolSelectAll: sqliteDb.prepare('SELECT * FROM school_orders ORDER BY id DESC'),
    schoolSelectById: sqliteDb.prepare('SELECT * FROM school_orders WHERE id = ?'),
    schoolInsert: sqliteDb.prepare(`
      INSERT INTO school_orders (schoolName, className, vignetteType, price, monitorPhone, date, status, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `),
    schoolSoftDelete: sqliteDb.prepare('UPDATE school_orders SET deletedAt = ? WHERE id = ?'),
    schoolRestore: sqliteDb.prepare('UPDATE school_orders SET deletedAt = NULL WHERE id = ?'),
  };

  dbMode = 'sqlite';
  dbConnected = true;
  dbError = null;
  console.log(`Database connected (SQLite: ${dbPath})`);
}

async function initDatabase() {
  const dbUrl = resolveDatabaseUrl();
  if (dbUrl) {
    const connected = await initPostgres(dbUrl);
    if (connected) return;
    console.warn('Falling back to SQLite because PostgreSQL connection failed.');
  } else {
    console.warn('DATABASE_URL is not set. Falling back to SQLite.');
  }

  initSqlite();
}

function hasMissingStringFields(payload, requiredFields) {
  return requiredFields.some((field) => typeof payload[field] !== 'string' || payload[field].trim() === '');
}

async function fetchOrders() {
  if (dbMode === 'postgres') {
    const result = await pgPool.query('SELECT * FROM orders ORDER BY id DESC');
    return result.rows;
  }
  return sqlite.orderSelectAll.all();
}

async function createOrder(payload) {
  if (dbMode === 'postgres') {
    const result = await pgPool.query(
      'INSERT INTO orders ("customerName", date, details, phone, deposit, status, type, operator, "deletedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL) RETURNING *',
      [payload.customerName, payload.date, payload.details, payload.phone, payload.deposit, payload.status, payload.type, payload.operator],
    );
    return result.rows[0];
  }

  const result = sqlite.orderInsert.run(
    payload.customerName,
    payload.date,
    payload.details,
    payload.phone,
    payload.deposit,
    payload.status,
    payload.type,
    payload.operator,
  );
  return sqlite.orderSelectById.get(result.lastInsertRowid);
}

async function softDeleteOrder(id) {
  if (dbMode === 'postgres') {
    const result = await pgPool.query('UPDATE orders SET "deletedAt" = $1 WHERE id = $2 RETURNING *', [Date.now(), id]);
    return result.rows[0] || null;
  }

  const result = sqlite.orderSoftDelete.run(Date.now(), id);
  if (result.changes === 0) return null;
  return sqlite.orderSelectById.get(id);
}

async function restoreOrder(id) {
  if (dbMode === 'postgres') {
    const result = await pgPool.query('UPDATE orders SET "deletedAt" = NULL WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  const result = sqlite.orderRestore.run(id);
  if (result.changes === 0) return null;
  return sqlite.orderSelectById.get(id);
}

async function fetchSchoolOrders() {
  if (dbMode === 'postgres') {
    const result = await pgPool.query('SELECT * FROM school_orders ORDER BY id DESC');
    return result.rows;
  }
  return sqlite.schoolSelectAll.all();
}

async function createSchoolOrder(payload) {
  if (dbMode === 'postgres') {
    const result = await pgPool.query(
      'INSERT INTO school_orders ("schoolName", "className", "vignetteType", price, "monitorPhone", date, status, "deletedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NULL) RETURNING *',
      [payload.schoolName, payload.className, payload.vignetteType, payload.price, payload.monitorPhone, payload.date, payload.status],
    );
    return result.rows[0];
  }

  const result = sqlite.schoolInsert.run(
    payload.schoolName,
    payload.className,
    payload.vignetteType,
    payload.price,
    payload.monitorPhone,
    payload.date,
    payload.status,
  );
  return sqlite.schoolSelectById.get(result.lastInsertRowid);
}

async function softDeleteSchoolOrder(id) {
  if (dbMode === 'postgres') {
    const result = await pgPool.query('UPDATE school_orders SET "deletedAt" = $1 WHERE id = $2 RETURNING *', [Date.now(), id]);
    return result.rows[0] || null;
  }

  const result = sqlite.schoolSoftDelete.run(Date.now(), id);
  if (result.changes === 0) return null;
  return sqlite.schoolSelectById.get(id);
}

async function restoreSchoolOrder(id) {
  if (dbMode === 'postgres') {
    const result = await pgPool.query('UPDATE school_orders SET "deletedAt" = NULL WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  const result = sqlite.schoolRestore.run(id);
  if (result.changes === 0) return null;
  return sqlite.schoolSelectById.get(id);
}

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({apiKey}) : null;
const systemInstruction = 'You are the AI assistant for Pixe1.media CRM. Reply helpfully in Kyrgyz language.';

app.get('/api/health', (_req, res) => {
  res.json({status: 'ok', dbConnected, dbMode, dbError});
});

app.get('/api/orders', async (_req, res) => {
  try {
    return res.json(await fetchOrders());
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({error: 'Failed to load orders'});
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const payload = req.body ?? {};
    const required = ['customerName', 'date', 'details', 'phone', 'deposit', 'status', 'type', 'operator'];
    if (hasMissingStringFields(payload, required)) {
      return res.status(400).json({error: 'Invalid order payload'});
    }

    const normalized = Object.fromEntries(required.map((key) => [key, payload[key].trim()]));
    const created = await createOrder(normalized);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({error: 'Failed to create order'});
  }
});

app.patch('/api/orders/:id/delete', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({error: 'Invalid order id'});
    }

    const updated = await softDeleteOrder(id);
    if (!updated) {
      return res.status(404).json({error: 'Order not found'});
    }

    return res.json(updated);
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({error: 'Failed to delete order'});
  }
});

app.patch('/api/orders/:id/restore', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({error: 'Invalid order id'});
    }

    const updated = await restoreOrder(id);
    if (!updated) {
      return res.status(404).json({error: 'Order not found'});
    }

    return res.json(updated);
  } catch (error) {
    console.error('Restore order error:', error);
    return res.status(500).json({error: 'Failed to restore order'});
  }
});

app.get('/api/school-orders', async (_req, res) => {
  try {
    return res.json(await fetchSchoolOrders());
  } catch (error) {
    console.error('Fetch school orders error:', error);
    return res.status(500).json({error: 'Failed to load school orders'});
  }
});

app.post('/api/school-orders', async (req, res) => {
  try {
    const payload = req.body ?? {};
    const required = ['schoolName', 'className', 'vignetteType', 'price', 'monitorPhone', 'date', 'status'];
    if (hasMissingStringFields(payload, required)) {
      return res.status(400).json({error: 'Invalid school order payload'});
    }

    const normalized = Object.fromEntries(required.map((key) => [key, payload[key].trim()]));
    const created = await createSchoolOrder(normalized);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Create school order error:', error);
    return res.status(500).json({error: 'Failed to create school order'});
  }
});

app.patch('/api/school-orders/:id/delete', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({error: 'Invalid school order id'});
    }

    const updated = await softDeleteSchoolOrder(id);
    if (!updated) {
      return res.status(404).json({error: 'School order not found'});
    }

    return res.json(updated);
  } catch (error) {
    console.error('Delete school order error:', error);
    return res.status(500).json({error: 'Failed to delete school order'});
  }
});

app.patch('/api/school-orders/:id/restore', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({error: 'Invalid school order id'});
    }

    const updated = await restoreSchoolOrder(id);
    if (!updated) {
      return res.status(404).json({error: 'School order not found'});
    }

    return res.json(updated);
  } catch (error) {
    console.error('Restore school order error:', error);
    return res.status(500).json({error: 'Failed to restore school order'});
  }
});

app.post('/api/ai', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({error: 'GEMINI_API_KEY is not set'});
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
    if (!messages || messages.length === 0) {
      return res.status(400).json({error: 'messages must be a non-empty array'});
    }

    const contents = messages.map((m) => ({
      role: m?.role === 'user' ? 'user' : 'model',
      parts: [{text: String(m?.text ?? '')}],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({text: response.text ?? ''});
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({error: 'AI request failed'});
  }
});

const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(indexPath));
} else {
  app.get('/', (_req, res) => {
    res
      .status(200)
      .type('text/plain')
      .send('UI dev server is on http://localhost:3000. Build the app to serve it from this port.');
  });
}

process.on('SIGTERM', async () => {
  if (pgPool) {
    await pgPool.end().catch(() => undefined);
  }
  if (sqliteDb) {
    sqliteDb.close();
  }
  process.exit(0);
});

await initDatabase();

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
