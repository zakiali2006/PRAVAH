# Local Development Setup Guide

A complete guide to cloning and running the PRAVAH / UdyogSetu project locally on your laptop.

## Required Software
1. **Git**: For version control.
2. **Docker Desktop**: Required to run the PostgreSQL database with the pgvector extension.
3. **Python 3.12+**: For the FastAPI backend.
4. **Node.js 20+**: For the React/Vite frontend.

---

## 1. Get the Code & Environment Config

```bash
# Clone the repository
git clone <repository-url>
cd PRAVAH

# Setup backend environment variables
cd backend
cp .env.example .env
```
*(The default values in `.env` are pre-configured to work out-of-the-box with the local Docker database.)*

## 2. Start the Database (Docker)

PRAVAH uses PostgreSQL with the pgvector extension. We manage this exclusively through Docker.

```bash
# From the project root (where docker-compose.yml lives)
docker compose up -d postgres
```
This will start a PostgreSQL database accessible on `localhost:5432`.

## 3. Start the Backend (FastAPI)

We recommend running the backend locally (not in Docker) so you have access to breakpoints, live-reloading, and your IDE's language servers.

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations to create the database schema
alembic upgrade head

# Seed the database with demo accounts and data
python -m app.seed.seed

# Start the dev server
uvicorn app.main:app --reload --port 8000
```
- API Docs (Swagger): http://localhost:8000/docs
- Healthcheck: http://localhost:8000/api/health

## 4. Start the Frontend (React + Vite)

```bash
cd frontend

# Install node modules (use ci for strict lockfile adherence)
npm ci

# Start the dev server
npm run dev
```
- The frontend will be available at: http://localhost:5173

## 5. Demo Credentials

After seeding the database, you can log in with:
- **Email**: `demo@gmail.com`
- **Password**: `demo123`
