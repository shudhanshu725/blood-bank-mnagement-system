# Blood Bank Management System

A full stack blood bank management project for donor records, blood inventory, and blood request handling.

## Table of Contents
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Full Stack Implementation Plan (7 Days)](#full-stack-implementation-plan-7-days)

## Project Structure

```text
blood-banking-system/
|-- client/
|   `-- index.html
|-- server/
|   |-- server.js
|   |-- package.json
|   |-- .env.example
|   `-- postman-colection.json
|-- QUICK_START.md
`-- README.md
```

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB + Mongoose

## Setup

### 1) Server setup

```bash
cd server
npm install
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bloodbank
```

Start server:

```bash
npm run dev
```

### 2) Client setup

Open frontend:

```bash
cd client
# open index.html in browser
# OR run a local static server
python -m http.server 8000
```

## Usage

1. Start backend from `server/`.
2. Open `client/index.html` in browser.
3. Register donor, create blood request, and monitor inventory.
4. If backend is unavailable, frontend falls back to LocalStorage mode.

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /donors`
- `GET /donors/:id`
- `POST /donors`
- `PUT /donors/:id`
- `DELETE /donors/:id`
- `GET /donors/search/:bloodType`
- `GET /requests`
- `POST /requests`
- `PUT /requests/:id`
- `GET /inventory`
- `GET /inventory/:bloodType`
- `PUT /inventory/:bloodType`
- `GET /stats`

## Full Stack Implementation Plan (7 Days)

### Day 1 - Foundation and Project Structure
- Split project into `client/` and `server/`
- Move frontend files to `client/`
- Move backend files to `server/`
- Ensure `.env` config is loaded from server
- Update docs and startup instructions

Deliverable:
- Clean frontend/backend separation with working local setup

### Day 2 - Authentication and Authorization
- Add user model and login/register APIs
- Add JWT auth middleware
- Add role-based access (`admin`, `staff`)

Deliverable:
- Protected APIs with role checks

### Day 3 - Validation and Error Handling
- Add Joi/Zod validation for write APIs
- Standardize error response format
- Add central error middleware

Deliverable:
- Predictable API responses and safe input handling

### Day 4 - Core Feature Completion
- Add missing UI CRUD actions (edit/delete donor)
- Add request status update flow
- Add pagination/filtering

Deliverable:
- Complete day-to-day blood bank workflow support

### Day 5 - Security and Performance
- Add `helmet`, rate limiting, strict CORS
- Add indexes (`bloodType`, `status`, `createdAt`)
- Add request/error logging

Deliverable:
- Safer and faster backend for real use

### Day 6 - Testing and Quality
- Add Jest + Supertest API tests
- Add frontend smoke test checklist
- Add lint/format checks

Deliverable:
- Reliable and test-backed codebase

### Day 7 - Deployment and DevOps
- Add Dockerfiles and `docker-compose.yml`
- Add CI pipeline (install, test, build)
- Add deployment guide

Deliverable:
- Deployment-ready full stack project
