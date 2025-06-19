# BingeBook Backend API

This is the backend API for BingeBook, a movie tracking and discovery platform built with Node.js and Express.

## Features

- RESTful API endpoints
- Movie data management
- User authentication
- CORS enabled for frontend integration
- Optimized for serverless deployment

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **Serverless HTTP** - Vercel deployment adapter

## API Endpoints

### Health Check
- `GET /health` - API health status

### Movies
- `GET /api/movies` - Get movies list
- `POST /api/movies` - Add new movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file and configure it:
```bash
cp .env.example .env
```

3. Update the environment variables in `.env`:
   - Database connection details
   - API keys
   - Other configuration variables

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production

Start the production server:
```bash
npm start
```

## Deployment

This backend is configured to deploy on Vercel. See the main project README for detailed deployment instructions.

## Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-netlify-app.netlify.app
```

## Project Structure

```
backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/
│   ├── index.js          # Express app setup
│   ├── routes/           # API route handlers
│   ├── controllers/      # Business logic
│   ├── middleware/       # Custom middleware
│   └── config/           # Configuration files
├── package.json
├── vercel.json           # Vercel deployment config
└── README.md
```