# BingeBook - Movie Tracking Platform

A modern movie tracking and discovery platform with separate frontend and backend deployments.

## Project Structure

```
cinephile-content-hub/
├── frontend/             # React frontend (Deploy to Netlify)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── netlify.toml
│   └── README.md
├── backend/              # Node.js API (Deploy to Vercel)
│   ├── api/
│   ├── src/
│   ├── package.json
│   ├── vercel.json
│   └── README.md
└── README.md            # This file
```

## Quick Start

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

## Deployment Guide

### Frontend Deployment (Netlify)

#### Step 1: Prepare Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   VITE_API_BASE_URL=https://your-backend-vercel-app.vercel.app/api
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

#### Step 2: Deploy to Netlify

**Option A: Netlify CLI (Recommended)**
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy from frontend directory:
   ```bash
   cd frontend
   netlify deploy --prod
   ```

**Option B: Git Integration**
1. Push your code to GitHub/GitLab
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Add environment variables in Netlify dashboard
7. Deploy

#### Step 3: Configure Domain (Optional)
1. In Netlify dashboard, go to Site settings > Domain management
2. Add custom domain or use provided netlify.app subdomain

### Backend Deployment (Vercel)

#### Step 1: Prepare Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-netlify-app.netlify.app
   ```

#### Step 2: Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from backend directory:
   ```bash
   cd backend
   vercel --prod
   ```

**Option B: Git Integration**
1. Push your code to GitHub/GitLab
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Set project settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: Leave empty
6. Add environment variables in Vercel dashboard
7. Deploy

#### Step 3: Update Frontend API URL
After backend deployment, update the frontend environment variable:
```env
VITE_API_BASE_URL=https://your-backend-vercel-app.vercel.app/api
```

Then redeploy the frontend.

## Environment Variables Setup

### Frontend (.env.local)
```env
VITE_API_BASE_URL=https://your-backend-vercel-app.vercel.app/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-netlify-app.netlify.app
```

## Post-Deployment Checklist

1. ✅ Frontend deployed to Netlify
2. ✅ Backend deployed to Vercel
3. ✅ Environment variables configured
4. ✅ API endpoints accessible
5. ✅ CORS configured properly
6. ✅ Frontend can communicate with backend
7. ✅ Database connections working
8. ✅ Authentication flow working

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured with frontend URL
2. **API Not Found**: Check API base URL in frontend environment
3. **Build Failures**: Verify all dependencies are installed
4. **Environment Variables**: Ensure all required variables are set

### Useful Commands

```bash
# Test frontend build locally
cd frontend && npm run build && npm run preview

# Test backend locally
cd backend && npm run dev

# Check deployment logs
netlify logs  # For frontend
vercel logs   # For backend
```

## Support

For deployment issues:
- Netlify: [Netlify Docs](https://docs.netlify.com/)
- Vercel: [Vercel Docs](https://vercel.com/docs)

## License

MIT License