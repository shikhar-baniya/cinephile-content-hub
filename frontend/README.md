# BingeBook Frontend

This is the frontend application for BingeBook, a movie tracking and discovery platform built with React, TypeScript, and Vite.

## Features

- Movie search and discovery
- Personal movie tracking
- User authentication
- Responsive design with Tailwind CSS
- Modern UI components with Radix UI

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Zustand** - State management

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
cp .env.example .env.local
```

3. Update the environment variables in `.env.local`:
   - `VITE_API_BASE_URL` - Your backend API URL
   - `VITE_TMDB_API_KEY` - Your TMDB API key
   - Other configuration variables as needed

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

This frontend is configured to deploy on Netlify. See the main project README for detailed deployment instructions.

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_TMDB_API_KEY` - The Movie Database API key
- `VITE_TMDB_BASE_URL` - TMDB API base URL
- `VITE_TMDB_IMAGE_BASE_URL` - TMDB image base URL
- `VITE_SUPABASE_URL` - Supabase project URL (if using)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (if using)