import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {GoogleGenAI} from '@google/genai';

const app = express();
app.use(express.json({limit: '1mb'}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({apiKey}) : null;

const systemInstruction = 'РЎРёР· Pixe1.media Р°С‚С‚СѓСѓ РІРёРґРµРѕ СЃС‚СѓРґРёСЏРЅС‹РЅ Р±Р°С€РєР°СЂСѓСѓ СЃРёСЃС‚РµРјР°СЃС‹РЅРґР°РіС‹ AI Р¶Р°СЂРґР°РјС‡С‹СЃС‹Р·. РЎРёР·РґРёРЅ РјР°РєСЃР°С‚С‹ТЈС‹Р· - РєРѕР»РґРѕРЅСѓСѓС‡СѓРіР° СЃРёСЃС‚РµРјР°РЅС‹ РєРѕР»РґРѕРЅСѓСѓРіР° Р¶Р°СЂРґР°Рј Р±РµСЂТЇТЇ Р¶Р°РЅР° Р°Р»Р°СЂРґС‹РЅ СЃСѓСЂРѕРѕР»РѕСЂСѓРЅР° РєС‹СЂРіС‹Р· С‚РёР»РёРЅРґРµ Р¶РѕРѕРї Р±РµСЂТЇТЇ. РЎРёР· СЃС‹Р»С‹Рє, РєРµСЃРёРїРєУ©Р№ Р¶Р°РЅР° Р¶Р°СЂРґР°Рј Р±РµСЂТЇТЇРіУ© РґР°СЏСЂ Р±РѕР»СѓС€СѓТЈСѓР· РєРµСЂРµРє.';

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
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
