# MoneyMitra - SaaS for India

Production-ready, offline-first payment reminder system for small businesses.

## Tech Stack
- **Frontend**: Flutter (Riverpod, Isar, Voice)
- **Backend**: Node.js (Express, TypeScript, BullMQ)
- **Database**: MongoDB (Atlas) + Redis (Queues)
- **AI**: Custom Intent Router + LLM Fallback

## 🚀 Quick Start

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev`

### Mobile App
1. `cd mobile_app`
2. `flutter pub get`
3. `flutter run`

## 🐳 Deployment via Docker
Run the entire stack with one command:
```bash
docker-compose up --build -d
```

## 📂 Project Structure
- `/backend`: API, Jobs, Event Bus
- `/mobile_app`: Flutter Code
- `/infra`: Ops config

## 🔑 Environment Variables
Copy `.env.example` to `.env` in backend and fill:
- `MONGO_URI`
- `REDIS_URL`
- `WHATSAPP_TOKEN`
- `FIREBASE_CREDENTIALS`
