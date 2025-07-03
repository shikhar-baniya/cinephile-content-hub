# Backend API Endpoints Test Guide

This guide provides examples for testing the new series/season/episode tracking endpoints.

## Prerequisites

1. Make sure the migration scripts have been run:
   - `001_series_season_tracking_schema.sql`
   - `002_migrate_existing_series_data.sql`

2. Ensure you have a valid authentication token

3. Set TMDB_API_KEY in your environment variables

## Base URL
```
https://your-backend-url.vercel.app
```

## Authentication
All authenticated endpoints require:
```
Authorization: Bearer <your-jwt-token>
```

## Test Endpoints

### 1. Health Check
```bash
curl https://your-backend-url.vercel.app/health
```

### 2. Create a Test Series (Movie endpoint)
```bash
curl -X POST https://your-backend-url.vercel.app/api/movies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking Bad",
    "category": "Series",
    "genre": "Drama, Crime",
    "releaseYear": 2008,
    "platform": "Netflix",
    "status": "want-to-watch",
    "tmdbId": 1396
  }'
```

### 3. Get Series Seasons
```bash
curl https://your-backend-url.vercel.app/api/series/{series-id}/seasons \
  -H "Authorization: Bearer <token>"
```

### 4. Create a Season
```bash
curl -X POST https://your-backend-url.vercel.app/api/series/{series-id}/seasons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "seasonNumber": 1,
    "seasonName": "Season 1",
    "episodeCount": 7,
    "status": "not-started"
  }'
```

### 5. Get Season Episodes
```bash
curl https://your-backend-url.vercel.app/api/series/seasons/{season-id}/episodes \
  -H "Authorization: Bearer <token>"
```

### 6. Create an Episode
```bash
curl -X POST https://your-backend-url.vercel.app/api/series/seasons/{season-id}/episodes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "episodeNumber": 1,
    "episodeName": "Pilot",
    "watched": false
  }'
```

### 7. Toggle Episode Watched
```bash
curl -X PUT https://your-backend-url.vercel.app/api/series/episodes/{episode-id}/watched \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "watched": true,
    "watchDate": "2024-01-15",
    "rating": 8.5
  }'
```

### 8. Bulk Update Episodes
```bash
curl -X PUT https://your-backend-url.vercel.app/api/series/seasons/{season-id}/episodes/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "episodeNumbers": [1, 2, 3],
    "watched": true,
    "watchDate": "2024-01-15"
  }'
```

### 9. Get Series Overview
```bash
curl https://your-backend-url.vercel.app/api/series/{series-id}/overview \
  -H "Authorization: Bearer <token>"
```

### 10. Get Episode Stats
```bash
curl https://your-backend-url.vercel.app/api/series/seasons/{season-id}/episodes/stats \
  -H "Authorization: Bearer <token>"
```

## TMDB Integration Tests

### 1. Search TV Shows
```bash
curl "https://your-backend-url.vercel.app/api/tmdb/tv/search?query=breaking%20bad"
```

### 2. Get TV Show Details
```bash
curl https://your-backend-url.vercel.app/api/tmdb/tv/1396
```

### 3. Get Season Details
```bash
curl https://your-backend-url.vercel.app/api/tmdb/tv/1396/season/1
```

### 4. Auto-Create Series from TMDB
```bash
curl -X POST https://your-backend-url.vercel.app/api/tmdb/series/auto-create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmdbId": 1396
  }'
```

### 5. Populate Existing Series with TMDB Data
```bash
curl -X PUT https://your-backend-url.vercel.app/api/tmdb/series/{series-id}/populate \
  -H "Authorization: Bearer <token>"
```

## Expected Responses

### Series Overview Response
```json
{
  "seriesId": "uuid",
  "title": "Breaking Bad",
  "genre": "Drama, Crime",
  "releaseYear": 2008,
  "platform": "Netflix",
  "seriesStatus": "watching",
  "totalSeasonsTracked": 5,
  "completedSeasons": 2,
  "watchingSeasons": 1,
  "wantToWatchSeasons": 2,
  "totalEpisodesWatched": 20,
  "totalEpisodesAvailable": 62,
  "latestSeasonCompletionDate": "2024-01-15",
  "averageSeasonRating": 9.2
}
```

### Episode Stats Response
```json
{
  "seasonId": "uuid",
  "seriesTitle": "Breaking Bad",
  "seasonNumber": 1,
  "totalEpisodes": 7,
  "watchedEpisodes": 5,
  "unwatchedEpisodes": 2,
  "watchedPercentage": 71,
  "averageRating": 8.8,
  "firstWatchDate": "2024-01-10",
  "lastWatchDate": "2024-01-15",
  "isCompleted": false,
  "nextEpisodeToWatch": 6
}
```

## Testing Workflow

1. **Create a series** using the movies endpoint
2. **Auto-populate with TMDB** to get seasons and episodes
3. **Mark episodes as watched** to test progress tracking
4. **Check series overview** to verify aggregated data
5. **Test bulk operations** for efficient episode management

## Common Issues

1. **401 Unauthorized**: Check your JWT token
2. **404 Series not found**: Verify series ID and ownership
3. **TMDB errors**: Check TMDB_API_KEY environment variable
4. **Foreign key errors**: Ensure proper parent-child relationships

## Database Verification

After testing, you can verify the data in your database:

```sql
-- Check series and seasons
SELECT 
  m.title,
  m.status as series_status,
  ss.season_number,
  ss.status as season_status,
  ss.episodes_watched,
  ss.episode_count
FROM movies m
JOIN series_seasons ss ON m.id = ss.series_id
WHERE m.category = 'Series'
ORDER BY m.title, ss.season_number;

-- Check episode progress
SELECT 
  m.title,
  ss.season_number,
  se.episode_number,
  se.episode_name,
  se.watched,
  se.watch_date
FROM movies m
JOIN series_seasons ss ON m.id = ss.series_id
JOIN series_episodes se ON ss.id = se.season_id
WHERE m.category = 'Series'
ORDER BY m.title, ss.season_number, se.episode_number;
```
