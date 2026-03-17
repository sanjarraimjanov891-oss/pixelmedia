<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Pixe1.media CRM

## Local Development

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Create a local env file from `.env.example` and set your key:
   `GEMINI_API_KEY=...`
3. Start the API server in one terminal:
   `npm run dev:server`
4. Start the Vite dev server in another terminal:
   `npm run dev`

The UI runs on Vite, and `/api/*` is proxied to the Express server.

## Production (Railway)

1. Set the `GEMINI_API_KEY` environment variable in Railway.
2. Railway will run:
   `npm install`
   `npm run build`
   `npm start`

The Express server serves the built app from `dist` and exposes `/api/ai`.
