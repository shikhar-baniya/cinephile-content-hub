# Deployment Guide - Cinephile Content Hub

This guide will help you deploy the frontend to Vercel and the backend to Netlify.

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **TMDB Account**: Get API key from [themoviedb.org](https://www.themoviedb.org/settings/api)
3. **GitHub Account**: For code repository
4. **Vercel Account**: For frontend deployment
5. **Netlify Account**: For backend deployment

## Step 1: Setup Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor and run this migration:

```sql
-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  category TEXT CHECK (category IN ('Movie', 'Series', 'Short-Film')) NOT NULL,
  release_year INTEGER NOT NULL,
  platform TEXT NOT NULL,
  rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
  status TEXT CHECK (status IN ('watched', 'watching', 'want-to-watch')) NOT NULL,
  poster TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title, release_year)
);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own movies
CREATE POLICY "Users can only see their own movies" ON movies
FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Get your Supabase URL and anon key from Settings > API

## Step 2: Prepare Your Repository

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/cinephile-content-hub.git
git push -u origin main
```

2. **Update your code to use API version**:
   - Replace imports in `src/pages/Index.tsx` to use API version
   - Replace imports in components to use API version

## Step 3: Deploy Backend to Netlify

### Option A: Deploy via GitHub (Recommended)

1. **Connect Repository to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - Base directory: `backend`
     - Build command: `npm install`
     - Publish directory: `dist`

2. **Set Environment Variables**:
   - Go to Site settings > Environment variables
   - Add these variables:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     TMDB_API_KEY=your_tmdb_api_key
     TMDB_BASE_URL=https://api.themoviedb.org/3
     TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
     NODE_ENV=production
     ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
     ```

3. **Deploy**:
   - Click "Deploy site"
   - Your API will be available at: `https://your-site-name.netlify.app/.netlify/functions/index/api`

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Deploy from backend directory**:
```bash
cd backend
netlify login
netlify init
netlify deploy --prod
```

## Step 4: Deploy Frontend to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Connect Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework preset: Vite
   - Root directory: `./` (leave empty)

2. **Set Environment Variables**:
   - In project settings > Environment Variables, add:
     ```
     VITE_API_BASE_URL=https://your-netlify-app.netlify.app/.netlify/functions/index/api
     VITE_TMDB_API_KEY=your_tmdb_api_key
     VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
     VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
     ```

3. **Deploy**:
   - Click "Deploy"
   - Your app will be available at: `https://your-app-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy from root directory**:
```bash
vercel login
vercel --prod
```

## Step 5: Update CORS Settings

1. **Update Backend Environment**:
   - Go to Netlify dashboard > Site settings > Environment variables
   - Update `ALLOWED_ORIGINS` to include your Vercel URL:
     ```
     ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
     ```

2. **Redeploy Backend**:
   - Go to Netlify dashboard > Deploys
   - Click "Trigger deploy" > "Deploy site"

## Step 6: Testing

1. **Test API Endpoints**:
```bash
# Health check
curl https://your-netlify-app.netlify.app/.netlify/functions/index/health

# Test CORS
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://your-netlify-app.netlify.app/.netlify/functions/index/api/movies
```

2. **Test Frontend**:
   - Visit your Vercel URL
   - Try signing up/signing in
   - Add a movie
   - Check analytics

## Step 7: Domain Configuration (Optional)

### Custom Domain for Frontend (Vercel)
1. Go to Project settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain for Backend (Netlify)
1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS records

## Environment Variables Summary

### Backend (Netlify)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-netlify-app.netlify.app/.netlify/functions/index/api
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `ALLOWED_ORIGINS` includes your Vercel URL
   - Redeploy backend after environment changes

2. **Authentication Issues**:
   - Check Supabase URL and keys
   - Verify JWT tokens are being sent correctly

3. **Build Failures**:
   - Check build logs in Netlify/Vercel dashboard
   - Verify all environment variables are set

4. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check RLS policies are correct

### Monitoring

1. **Netlify Functions Logs**:
   - Go to Functions tab in Netlify dashboard
   - View function logs for debugging

2. **Vercel Analytics**:
   - Enable analytics in Vercel dashboard
   - Monitor performance and errors

3. **Supabase Logs**:
   - Check database logs in Supabase dashboard
   - Monitor API usage

## Maintenance

1. **Regular Updates**:
   - Keep dependencies updated
   - Monitor security advisories

2. **Backup**:
   - Export Supabase data regularly
   - Keep environment variables documented

3. **Monitoring**:
   - Set up uptime monitoring
   - Monitor error rates and performance

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Verify environment variables
4. Test API endpoints directly