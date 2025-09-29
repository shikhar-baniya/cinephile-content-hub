---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
BingeBook is a modern movie tracking and discovery platform with separate frontend and backend components. The application allows users to track movies and TV series they've watched, are currently watching, or want to watch in the future.

## Repository Structure
The repository is organized as a monorepo containing both frontend and backend applications:

### Main Repository Components
- **Frontend**: React-based web application built with TypeScript, Vite, and TailwindCSS
- **Backend**: Node.js Express API server with Supabase integration
- **Database**: SQL migrations for Supabase database setup
- **Supabase**: Configuration for Supabase integration

## Projects

### Frontend (React Application)
**Configuration File**: `frontend/package.json`

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.5.3
**Build System**: Vite 5.4.19
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- React 18.3.1
- React Router DOM 6.26.2
- TanStack React Query 5.56.2
- Radix UI Components
- Tailwind CSS 3.4.11
- Zod 3.23.8
- Zustand 4.5.2

#### Build & Installation
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
```

#### Testing
**Framework**: Vitest 1.3.1
**Test Location**: `frontend/src/tests`
**Configuration**: `frontend/vitest.config.ts`
**Run Command**:
```bash
npm test
npm run test:coverage  # With coverage
```

### Backend (Express API)
**Configuration File**: `backend/package.json`

#### Language & Runtime
**Language**: JavaScript (ES Modules)
**Version**: Node.js >=18.0.0
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- Express 4.18.2
- Supabase JS 2.50.0
- CORS 2.8.5
- Compression 1.7.4
- Dotenv 16.3.1

#### Build & Installation
```bash
cd backend
npm install
npm run dev  # Development server
npm run build  # Production build
npm start  # Start production server
```

#### Deployment
**Platform**: Vercel
**Configuration**: `backend/vercel.json`
**Entry Point**: `backend/api/index.js`

### Database (Supabase)
**Configuration File**: `supabase/config.toml`

#### Key Resources
**Main Files**:
- `database/migrations/*.sql`: SQL migration files
- `supabase/migrations/*.sql`: Supabase migration files

#### Usage & Operations
**Integration Points**:
- Frontend connects to Supabase directly for authentication
- Backend uses Supabase service role for privileged operations
- Environment variables required for both frontend and backend

## Environment Setup
**Frontend (.env)**:
- VITE_API_BASE_URL
- VITE_TMDB_API_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

**Backend (.env)**:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NODE_ENV
- PORT
- FRONTEND_URL