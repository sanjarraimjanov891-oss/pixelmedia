import 'dotenv/config';
import Database from 'better-sqlite3';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {GoogleGenAI} from '@google/genai';

const app = express();
app.use(express.json({limit: '1mb'}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {recursive: true});
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'app.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
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

const orderSelectAllStmt = db.prepare('SELECT * FROM orders ORDER BY id DESC');
const orderSelectByIdStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
const orderInsertStmt = db.prepare(`
  INSERT INTO orders (customerName, date, details, phone, deposit, status, type, operator, deletedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
`);
const orderSoftDeleteStmt = db.prepare('UPDATE orders SET deletedAt = ? WHERE id = ?');
const orderRestoreStmt = db.prepare('UPDATE orders SET deletedAt = NULL WHERE id = ?');

const schoolSelectAllStmt = db.prepare('SELECT * FROM school_orders ORDER BY id DESC');
const schoolSelectByIdStmt = db.prepare('SELECT * FROM school_orders WHERE id = ?');
const schoolInsertStmt = db.prepare(`
  INSERT INTO school_orders (schoolName, className, vignetteType, price, monitorPhone, date, status, deletedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
`);
const schoolSoftDeleteStmt = db.prepare('UPDATE school_orders SET deletedAt = ? WHERE id = ?');
const schoolRestoreStmt = db.prepare('UPDATE school_orders SET deletedAt = NULL WHERE id = ?');

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({apiKey}) : null;

const systemInstruction = 'You are the AI assistant for Pixe1.media CRM. Reply helpfully in Kyrgyz language.';

app.get('/api/orders', (_req, res) => {
  return res.json(orderSelectAllStmt.all());
});

app.post('/api/orders', (req, res) => {
  const payload = req.body ?? {};
  const required = ['customerName', 'date', 'details', 'phone', 'deposit', 'status', 'type', 'operator'];
  const hasMissing = required.some((field) => typeof payload[field] !== 'string' || payload[field].trim() === '');
  if (hasMissing) {
    return res.status(400).json({error: 'Invalid order payload'});
  }

  const result = orderInsertStmt.run(
    payload.customerName.trim(),
    payload.date.trim(),
    payload.details.trim(),
    payload.phone.trim(),
    payload.deposit.trim(),
    payload.status.trim(),
    payload.type.trim(),
    payload.operator.trim(),
  );

  const created = orderSelectByIdStmt.get(result.lastInsertRowid);
  return res.status(201).json(created);
});

app.patch('/api/orders/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({error: 'Invalid order id'});
  }

  const result = orderSoftDeleteStmt.run(Date.now(), id);
  if (result.changes === 0) {
    return res.status(404).json({error: 'Order not found'});
  }

  return res.json(orderSelectByIdStmt.get(id));
});

app.patch('/api/orders/:id/restore', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({error: 'Invalid order id'});
  }

  const result = orderRestoreStmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({error: 'Order not found'});
  }

  return res.json(orderSelectByIdStmt.get(id));
});

app.get('/api/school-orders', (_req, res) => {
  return res.json(schoolSelectAllStmt.all());
});

app.post('/api/school-orders', (req, res) => {
  const payload = req.body ?? {};
  const required = ['schoolName', 'className', 'vignetteType', 'price', 'monitorPhone', 'date', 'status'];
  const hasMissing = required.some((field) => typeof payload[field] !== 'string' || payload[field].trim() === '');
  if (hasMissing) {
    return res.status(400).json({error: 'Invalid school order payload'});
  }

  const result = schoolInsertStmt.run(
    payload.schoolName.trim(),
    payload.className.trim(),
    payload.vignetteType.trim(),
    payload.price.trim(),
    payload.monitorPhone.trim(),
    payload.date.trim(),
    payload.status.trim(),
  );

  const created = schoolSelectByIdStmt.get(result.lastInsertRowid);
  return res.status(201).json(created);
});

app.patch('/api/school-orders/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({error: 'Invalid school order id'});
  }

  const result = schoolSoftDeleteStmt.run(Date.now(), id);
  if (result.changes === 0) {
    return res.status(404).json({error: 'School order not found'});
  }

  return res.json(schoolSelectByIdStmt.get(id));
});

app.patch('/api/school-orders/:id/restore', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({error: 'Invalid school order id'});
  }

  const result = schoolRestoreStmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({error: 'School order not found'});
  }

  return res.json(schoolSelectByIdStmt.get(id));
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

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
