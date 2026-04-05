# MediVault (Production-ready Monorepo)

This repository contains the **MediVault** full-stack application described in `docs/`:

- **Frontend**: React + Vite + Tailwind
- **Backend**: Flask REST API (modular, secure)
- **Database**: PostgreSQL (Docker Compose) or SQLite for quick local runs

## Quick start (Docker Compose)

1) Create env files:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`

2) Start everything:

```bash
docker compose -f infra/docker-compose.yml up --build
```

3) Backend API: `http://127.0.0.1:5000/api/health`  
4) Frontend: `http://127.0.0.1:8080`

## Local development (no Docker)

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python -m src.app
```

### Frontend

```bash
npm install
npm run dev
```

## Project layout

- `frontend/`: React app
- `backend/`: Flask API (new modular code in `backend/src/`)
- `infra/`: Docker Compose and deployment assets
