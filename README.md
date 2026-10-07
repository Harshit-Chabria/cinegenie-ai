# 🎬 CineGenie AI

> **AI-Powered Production Assistant** for photographers, videographers, filmmakers, social media creators, and production agencies.

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **7 AI Personas** | Director, Cinematographer, Editor, Producer, Social Media, Colorist, Client Manager |
| 📝 **Script Generator** | Full screenplay & narrative scripts with AI |
| 🎯 **Shot List Builder** | Camera, lens, lighting breakdowns per shot |
| 🎨 **Storyboard Creator** | Scene-by-scene visual descriptions |
| 📱 **Caption Generator** | Platform-optimised captions for IG, YT, TikTok, LinkedIn, FB |
| 💬 **AI Chat (SSE)** | Real-time streaming AI assistant with conversation history |
| 📁 **Project Management** | Full project lifecycle with status tracking |
| 👥 **Client CRM** | Client database with contacts and project linking |
| 📚 **Knowledge Base** | Upload PDFs/docs and query them via RAG |
| 📅 **Calendar** | Shoot scheduling and deadline tracking |
| 🔒 **Auth** | JWT auth with register/login/forgot-password |

---

## 🛠 Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy 2.0 + SQLite (dev) / PostgreSQL (prod)
- Pydantic v2
- **Ollama** (local LLM) + Llama 3.2:3b — runs entirely offline, no API key needed
- ChromaDB for RAG (optional)
- bcrypt + python-jose for auth

**Frontend**
- React 19 + Vite 8
- TailwindCSS 3 + glassmorphism design
- Framer Motion animations
- Zustand global state
- React Router v6
- Axios + JWT interceptors

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- [Ollama](https://ollama.com/download) installed and running locally (free, no API key)

### 1. Clone & configure

```bash
git clone https://github.com/Harshit-Chabria/cinegenie-ai.git
cd cinegenie-ai
```

Copy and edit the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Pull the local model (no API key needed):

```bash
ollama pull llama3.2:3b
```

### 2. Start the Backend

```bash
cd backend
py -3.12 -m pip install -r requirements.txt
py -3.12 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs: http://localhost:8000/api/docs

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 4. Docker (Full Stack)

```bash
docker-compose up --build
```

---

## 📁 Project Structure

```
CineGenie-AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Route handlers (auth, projects, ai, clients...)
│   │   ├── core/            # Config, DB, security, dependencies
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # AI service, RAG service
│   │   └── ai/prompts/      # 7 expert AI system prompts
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + interceptors
│   │   ├── contexts/        # Auth + Theme contexts
│   │   ├── pages/           # 15+ pages
│   │   ├── components/      # Layout + UI components
│   │   ├── store/           # Zustand global store
│   │   └── utils/           # Helper functions
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | change-me |
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./cinegenie.db` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434/v1` |
| `OLLAMA_MODEL` | Local model name | `llama3.2:3b` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## 📄 License

MIT

---

Built by [Harshit Chabria](https://github.com/Harshit-Chabria)
