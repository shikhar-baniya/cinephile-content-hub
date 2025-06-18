# Cinephile Content Hub - Backend API

This is the backend API for the Cinephile Content Hub application, built with Node.js, Express, and Supabase.

## Features

- User authentication (signup, signin, signout)
- Movie management (CRUD operations)
- Supabase integration for database operations
- JWT token-based authentication
- CORS enabled for frontend integration
- Rate limiting and security headers
- Serverless deployment ready

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# TMDB Configuration (optional)
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/user` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Movies
- `GET /api/movies` - Get all movies for authenticated user
- `POST /api/movies` - Add a new movie
- `PUT /api/movies/:id` - Update a movie
- `DELETE /api/movies/:id` - Delete a movie

### Health Check
- `GET /health` - Health check endpoint

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Start development server:
```bash
npm run dev
```

## Deployment to Netlify

The API is configured for serverless deployment on Netlify using Netlify Functions.

1. Build and deploy:
```bash
# Netlify will run: npm install
# The netlify.toml file handles the configuration
```

2. Set environment variables in Netlify dashboard:
   - Go to Site settings > Environment variables
   - Add all the environment variables from your .env file

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── movieController.js   # Movie management logic
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   └── movies.js           # Movie routes
│   └── index.js                # Main application file
├── netlify/
│   └── functions/
│       └── index.js            # Netlify Functions entry point
├── .env.example                # Environment variables template
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation
- JWT token authentication
- User-specific data access (RLS through Supabase)

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors return JSON responses with appropriate HTTP status codes.