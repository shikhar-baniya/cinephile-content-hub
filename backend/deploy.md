# Vercel Deployment Troubleshooting Guide

## Issues Fixed:

### 1. Timeout Configuration
- Increased `maxDuration` from 10 to 30 seconds in `vercel.json`
- Added function-specific timeout configuration
- Increased internal timeout from 8 to 25 seconds

### 2. Database Connection Optimization
- Added environment variable validation
- Improved error handling for Supabase client initialization
- Added connection pooling settings

### 3. Authentication Middleware Optimization
- Added in-memory caching for user tokens (5-minute TTL)
- Added timeout protection for auth requests
- Improved error messages with timing information

### 4. Enhanced Health Check
- Added environment variable validation
- Detailed system information in health response
- Better error reporting

## Required Environment Variables in Vercel:

Make sure these are set in your Vercel project settings:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (optional)
NODE_ENV=production
```

## Deployment Steps:

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all required variables listed above

2. **Deploy the Updated Code:**
   ```bash
   git add .
   git commit -m "Fix timeout issues and optimize performance"
   git push origin main
   ```

3. **Test the Deployment:**
   - Test the root endpoint: `https://bingebook-api.vercel.app/`
   - Test the health check: `https://bingebook-api.vercel.app/health`
   - Check the logs in Vercel dashboard for any errors

## Testing Endpoints:

### Health Check
```bash
curl https://bingebook-api.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": {
    "nodeVersion": "v18.x.x",
    "platform": "linux",
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true
  }
}
```

### Root Endpoint
```bash
curl https://bingebook-api.vercel.app/
```

Expected response:
```json
{
  "message": "BingeBook API is running",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "movies": "/api/movies",
    "auth": "/api/auth"
  }
}
```

## Common Issues and Solutions:

### 1. Still Getting Timeouts
- Check Vercel function logs for specific error messages
- Verify all environment variables are set correctly
- Consider upgrading to Vercel Pro for longer function timeouts

### 2. Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project status
- Ensure your Supabase project allows connections from Vercel

### 3. CORS Issues
- The API now includes comprehensive CORS headers
- If still having issues, check the specific origin making requests

### 4. Authentication Issues
- Check if tokens are being passed correctly
- Verify Supabase auth configuration
- Check the enhanced error messages for specific auth failure reasons

## Performance Optimizations Applied:

1. **Caching**: User authentication results are cached for 5 minutes
2. **Timeouts**: Added proper timeout handling at multiple levels
3. **Error Handling**: Enhanced error messages with timing information
4. **Connection Pooling**: Optimized Supabase client configuration
5. **Compression**: Enabled response compression
6. **CORS Optimization**: Cached CORS preflight responses for 24 hours

## Monitoring:

After deployment, monitor:
- Function execution time in Vercel dashboard
- Error rates and types
- Cold start frequency
- Database query performance

If issues persist, check the Vercel function logs for detailed error information.