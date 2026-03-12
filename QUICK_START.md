# Quick Start - Blood Bank Management System

## Option 1: Client only

```bash
cd client
# Open index.html directly in browser
# or run:
python -m http.server 8000
```

## Option 2: Full stack

### 1) Start server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Server URL: `http://localhost:5000`

### 2) Open client

Open `client/index.html` in browser.

## API quick test

```bash
curl http://localhost:5000/api/stats
```

Postman file: `server/postman-colection.json`

## Troubleshooting

- MongoDB must be running.
- If port is busy, change `PORT` in `server/.env`.
- Hard refresh browser if frontend looks stale (`Ctrl+F5`).
