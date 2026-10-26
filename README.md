# Museum Guide

A responsive museum guide demo built with HTML, CSS, TypeScript, Node.js and Express. It uses in-memory sample data (no database required).

## Requirements
- Node.js LTS
- Visual Studio Code

## Install
Open a terminal in this folder and run:

```powershell
npm install
npm run build
npm start
```

Open http://localhost:3000

## Useful API routes
- `GET /api/health` — health check
- `GET /api/exhibits` — all sample exhibits
- `GET /api/exhibits?search=bronze` — search exhibits
- `GET /api/exhibits?category=Sculpture` — filter by category
- `GET /api/exhibits/1` — one exhibit
- `GET /api/exhibits/999` — example 404 response

## Notes
- `public/app.ts` is compiled into `public/app.js` during `npm run build`. Do not edit `app.js` directly; edit `app.ts` instead.
- Exhibit images are loaded from Unsplash, so internet access is required for those images. The application itself runs locally.
- Sample data is stored in `src/server.ts` and resets whenever the server is restarted.
