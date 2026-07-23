# Faraja — MVP Project Brief & Architecture

> Paste this file into Cursor (e.g. as `PROJECT.md` or `.cursor/rules/faraja.md`) so it has full context on the architecture, stack, and conventions before generating code.

## Quick start

```bash
# 1) Database + API (Postgres runs only in Docker)
docker compose up --build

# 2) Frontend (separate terminal)
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

- App: http://localhost:5173  
- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### CI (GitHub Actions)

Pushes and pull requests to `main` run lint, tests, frontend build, and Docker Compose validation (`.github/workflows/ci.yml`).  
To **block merges of failing code**, enable branch protection on `main` and require the CI checks — see `.github/BRANCH_PROTECTION.md`.

## What Faraja Is

A comfort/check-in web app. Users log a mood (happy / neutral / sad), optionally add a voice note or text, and receive an AI-selected comforting response. Includes PIN-based auth and a history of past check-ins. Designed with elderly/low-friction users in mind.

## Architecture Decision: Modular Monolith

**Not microservices for the MVP.** One codebase, one backend, one deployment — but internally organized by domain (auth, check-in, AI response, history) so it can be split into services later without a rewrite.

Why:
- Single PostgreSQL connection → atomic, consistent data (important for user check-in history)
- 1–2 devs can ship fast; no service discovery, API gateway, or message queue overhead
- Cheap to host (~$5–10/month backend + managed Postgres, $0 frontend on free tiers)
- 6–9 week MVP timeline is realistic; microservices would blow this up

Only revisit microservices if the user base grows to 10k+ users — and even then, it's a "surgical cut" along the existing module boundaries, not a rewrite.

## Tech Stack

- **Backend:** Python + FastAPI (chosen for async support, auto-generated docs, speed of iteration)
- **Frontend:** React (Vite) + Tailwind
- **Database:** PostgreSQL from day one (via SQLAlchemy + Alembic for migrations)
- **Auth:** Simple 4-digit PIN, hashed with bcrypt — no external auth provider for MVP
- **AI/response layer:** Local JSON library of 50+ comfort responses (categorized by mood, some Swahili phrases) — no external API calls in MVP, keeps it simple and free
- **Hosting:** Vercel (frontend, free tier) + Railway or Render (backend, Python/uvicorn)

## Repository Structure

```
faraja-web-mvp/
│
├── frontend/                      # React (Vite) + Tailwind
│   ├── public/                    # Logo assets, favicon
│   ├── src/
│   │   ├── components/            # UI components (Button, Card, MoodPicker)
│   │   ├── pages/                 # Landing, Dashboard, Log, Settings
│   │   ├── hooks/                 # useAuth, useCheckin, useVoice
│   │   ├── utils/                 # Color tokens, date formatters
│   │   └── api/                   # Client-side fetch wrappers to backend
│   └── package.json
│
├── backend/                        # Python (FastAPI)
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point, CORS, middleware
│   │   ├── api/                    # Route definitions
│   │   │   ├── auth.py             # POST /auth/login, POST /auth/register
│   │   │   ├── checkin.py          # POST /checkin, GET /checkin/today
│   │   │   ├── responses.py        # GET /responses (admin)
│   │   │   └── history.py          # GET /history/{user_id}
│   │   ├── core/
│   │   │   ├── config.py           # Env variables, settings
│   │   │   ├── security.py         # PIN hashing (bcrypt), session handling
│   │   │   └── database.py         # PostgreSQL connection setup (SQLAlchemy engine/session)
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── checkin.py
│   │   │   └── family.py           # (MVP+) family notifications
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── checkin.py
│   │   │   └── history.py
│   │   ├── services/                # Business logic
│   │   │   ├── ai_service.py       # Selects comfort response from JSON
│   │   │   ├── checkin_service.py
│   │   │   └── auth_service.py
│   │   └── utils/
│   │       └── json_loader.py      # Loads comfort_responses.json
│   ├── data/
│   │   └── comfort_responses.json  # 50+ responses by mood
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_checkin.py
│   │   └── test_ai.py
│   ├── requirements.txt            # fastapi, uvicorn, sqlalchemy, alembic, psycopg[binary], bcrypt, pydantic, python-dotenv
│   ├── Dockerfile
│   ├── .env                        # DATABASE_URL points at Postgres
│   └── alembic/                    # DB migrations — required from the start
│
├── docker-compose.yml               # backend + postgres service (+ optional redis)
└── README.md
```

## Local Dev Database

Run Postgres locally via `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: faraja
      POSTGRES_PASSWORD: faraja
      POSTGRES_DB: faraja
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

`.env`:

```
DATABASE_URL=postgresql+psycopg://faraja:faraja@localhost:5432/faraja
```

`app/core/database.py` should create the SQLAlchemy engine from `DATABASE_URL`, with a `SessionLocal` and `Base` shared across all models. Use Alembic (`alembic init alembic`) from the first migration onward — don't rely on `Base.metadata.create_all()` past initial scaffolding, since Postgres schema changes need real migrations.

## Database Schema (SQLAlchemy models)

```python
# app/models/user.py
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)   # UUID
    pin_hash = Column(String, nullable=False)            # bcrypt hashed 4-digit PIN
    created_at = Column(DateTime, server_default=func.now())
    family_email = Column(String, nullable=True)          # MVP+
```

```python
# app/models/checkin.py
class Checkin(Base):
    __tablename__ = "checkins"
    id = Column(String, primary_key=True)                 # UUID
    user_id = Column(String, ForeignKey("users.id"))
    mood = Column(String)                                  # 'happy' | 'neutral' | 'sad'
    text_notes = Column(String, nullable=True)
    voice_note_url = Column(String, nullable=True)         # MVP+
    ai_response = Column(String)
    created_at = Column(DateTime, server_default=func.now())
```

```python
# app/models/family.py  (MVP+)
class FamilyMember(Base):
    __tablename__ = "family_members"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    email = Column(String)
    notification_preferences = Column(String, nullable=True)
```

## AI Response Service

```python
# app/services/ai_service.py
import json, random
from pathlib import Path

class AIService:
    def __init__(self):
        self.responses = self._load_responses()

    def _load_responses(self):
        path = Path(__file__).parent.parent / "data" / "comfort_responses.json"
        with open(path, "r") as f:
            return json.load(f)  # {"happy": [...], "neutral": [...], "sad": [...]}

    def get_response(self, mood: str) -> str:
        mood = mood.lower()
        if mood not in self.responses:
            mood = "neutral"
        return random.choice(self.responses[mood])
```

`comfort_responses.json` shape (mix in Swahili phrases):

```json
{
  "happy": ["...", "..."],
  "neutral": ["...", "..."],
  "sad": ["...", "..."]
}
```

## API Endpoints

Protected routes require `Authorization: Bearer <session_token>` from login.

| Endpoint | Method | Request Body | Response |
|---|---|---|---|
| `/auth/register` | POST | `{"pin": "1234"}` | `{"user_id": "uuid", "message": "Welcome!"}` |
| `/auth/login` | POST | `{"pin": "1234"}` | `{"user_id": "uuid", "session_token": "..."}` |
| `/checkin` | POST | `{"mood": "happy", "text": "..."}` | `{"checkin_id": "uuid", "ai_response": "..."}` |
| `/checkin/today` | GET | — | `{"has_checkin": true, "mood": "...", "ai_response": "..."}` |
| `/history` | GET | — | `[{"date": "...", "mood": "...", "response": "..."}, ...]` |

Module communication inside the monolith is via simple synchronous REST calls between frontend and backend; internally, the AI response module is called as a direct function call, not an API — no message queues or event buses in the MVP.

## Deployment

```
[User's Browser]
      ↓ HTTPS
[Vercel] — serves static React frontend
      ↓
[Railway / Render] — single Python (uvicorn) container running FastAPI
      ↓
[Managed PostgreSQL] — Railway/Render/Supabase/Neon Postgres instance
```

Production run command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Run `alembic upgrade head` as a release step before the app starts, so schema migrations apply automatically on deploy.

Estimated cost: ~$5–10/month backend hosting + a few dollars for managed Postgres (Railway/Render include a free/low-cost Postgres tier to start), $0 frontend (Vercel free tier).

## Build Timeline (reference only)

| Week | Task |
|---|---|
| 3 | FastAPI skeleton: `main.py`, CORS, `.env` |
| 4 | `models/`, `schemas/`, `core/database.py` |
| 5 | `auth.py` + `auth_service.py` (PIN login, bcrypt) |
| 6 | `checkin.py` + `ai_service.py` + `checkin_service.py` |
| 7 | `history.py` + endpoint testing (Swagger/Postman) |
| 8 | Connect React frontend to FastAPI backend |
| 9 | QA, accessibility pass, MVP launch |

## Conventions for Cursor to Follow

- Keep route handlers thin — business logic lives in `services/`, not in `api/`.
- All request/response validation goes through Pydantic schemas in `schemas/`, never raw dicts.
- Do not introduce message queues, service discovery, or an API gateway — this is intentionally a single-deploy monolith.
- Do not call external AI APIs (e.g. OpenAI) in the MVP — `ai_service.py` reads only from the local JSON file.
- PINs are always hashed with bcrypt before storage; never store or log a raw PIN.
- New DB fields go through SQLAlchemy models + (eventually) Alembic migrations, not raw SQL.
