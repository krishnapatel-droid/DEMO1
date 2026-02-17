# Deployment Guide

## Quick Start (Development)

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm run start
```

## Deployment Options

### Option 1: Render.com (Recommended - Free)

1. **Backend (API)**:
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Start command: `npm run start`
   - Environment variables:
     - `PORT`: 3001

2. **Frontend**:
   - Create a new Static Site on Render
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Environment variables:
     - `VITE_API_URL`: Your backend URL (e.g., https://your-backend.onrender.com/api)

### Option 2: Vercel

1. **Frontend** (with API proxy):
   - Install Vercel CLI: `npm i -g vercel`
   - Add `vercel.json` to frontend folder:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-backend-url.com/api/$1" }
     ]
   }
   ```
   - Deploy: `cd frontend && vercel`

### Option 3: Railway

1. Create a new Railway project
2. Add MySQL database (or use the existing SQLite with persistent storage)
3. Deploy backend and frontend as separate services
4. Set environment variables for API URL

### Option 4: Fly.io

1. Install Fly CLI
2. Create Dockerfile for backend
3. Deploy with `fly deploy`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-api-url.com/api
```

### Backend (production)
```
PORT=3001
NODE_ENV=production
```

## Database

- Currently using SQLite (sql.js) - file-based, stored as `data.db`
- For production, consider migrating to:
  - PostgreSQL (recommended)
  - MySQL
  - MongoDB

## Project Structure

```
crud-app/
├── backend/          # Express API server
│   ├── src/
│   │   ├── db/          # Database schema & migrations
│   │   ├── middleware/  # Error handling
│   │   ├── repositories/# Data access layer
│   │   ├── routes/      # API endpoints
│   │   └── schemas/     # Validation schemas
│   └── dist/            # Compiled JavaScript
├── frontend/        # React + Vite app
│   ├── src/
│   │   ├── api.ts       # API client
│   │   ├── App.tsx      # Main component
│   │   └── App.css      # Styles
│   └── dist/            # Production build
└── package.json     # Root scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | List items (supports q, sortBy, sortDir, page, pageSize) |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create new item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/health | Health check |
