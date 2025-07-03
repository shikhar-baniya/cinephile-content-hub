# Series Season Tracking Migration Guide

This directory contains migration scripts to implement the new hybrid series-season tracking architecture for CineTracker.

## Migration Overview

The new architecture enables:
- **Granular tracking**: Individual seasons and episodes
- **Accurate analytics**: Proper watch dates for each season
- **Progress monitoring**: Episode-level completion tracking
- **Future scalability**: Support for advanced features like binge analysis

## Migration Scripts (Run in Order)

### 1. `001_series_season_tracking_schema.sql`
Creates the new database schema:
- `series_seasons` table for season-level tracking
- `series_episodes` table for episode-level tracking
- New columns in `movies` table for enhanced series data
- Automated triggers for status updates
- Row Level Security policies
- Performance indexes

### 2. `002_migrate_existing_series_data.sql`
Migrates existing series data:
- Converts current series entries to season-based format
- Preserves all existing watch dates and ratings
- Creates backup table for rollback safety
- Handles various season string formats ("Season 1", "S1", "1", etc.)
- Creates helpful database view `series_with_seasons`

### 3. `003_rollback_series_migration.sql` (Emergency Use Only)
Complete rollback script:
- Restores original data from backup
- Removes new tables and columns
- Reverts to pre-migration state
- **⚠️ WARNING: This deletes all new season/episode data!**

### 4. `004_test_migration.sql`
Comprehensive testing script:
- Creates sample data to verify migration
- Tests all triggers and automated functions
- Validates data integrity
- Performance testing with indexes
- Can be run safely without affecting real data

## How to Run the Migration

### Prerequisites
- Access to Supabase SQL Editor or PostgreSQL client
- Database backup (recommended)
- No active users modifying series data during migration

### Step-by-Step Process

1. **Backup Your Database** (Highly Recommended)
   ```sql
   -- Create full backup of movies table
   CREATE TABLE movies_full_backup AS SELECT * FROM public.movies;
   ```

2. **Run Schema Migration**
   ```sql
   -- Copy and paste contents of 001_series_season_tracking_schema.sql
   -- into Supabase SQL Editor and execute
   ```

3. **Run Data Migration**
   ```sql
   -- Copy and paste contents of 002_migrate_existing_series_data.sql
   -- into Supabase SQL Editor and execute
   ```

4. **Test the Migration**
   ```sql
   -- Copy and paste contents of 004_test_migration.sql
   -- into Supabase SQL Editor and execute
   -- Review all output to ensure everything works correctly
   ```

5. **Verify Migration Success**
   ```sql
   -- Check migration statistics
   SELECT 
       'Series migrated' as metric,
       COUNT(*) as count
   FROM public.movies 
   WHERE category = 'Series'
   
   UNION ALL
   
   SELECT 
       'Seasons created',
       COUNT(*)
   FROM public.series_seasons
   
   UNION ALL
   
   SELECT 
       'Episodes created',
       COUNT(*)
   FROM public.series_episodes;
   ```

## Post-Migration Steps

1. **Update Backend Code**
   - Implement new API endpoints for season/episode management
   - Update existing endpoints to work with new schema
   - Add TMDB integration for fetching episode data

2. **Update Frontend Code**
   - Modify series detail dialogs to show season/episode tracking
   - Update analytics to use season-based data
   - Implement new UI components for episode management

3. **Data Population**
   - Run background jobs to fetch episode data from TMDB
   - Populate missing episode counts and names
   - Update season information for existing series

## Rollback Process (If Needed)

If you need to rollback the migration:

1. **Stop all application traffic** to prevent data loss
2. **Run the rollback script**:
   ```sql
   -- Execute 003_rollback_series_migration.sql
   ```
3. **Verify rollback success**:
   ```sql
   -- Check that data is restored
   SELECT COUNT(*) FROM public.movies WHERE category = 'Series';
   ```
4. **Remove backup tables** (optional):
   ```sql
   DROP TABLE IF EXISTS movies_backup_pre_season_migration;
   ```

## Database Schema Changes

### New Tables

#### `series_seasons`
- Tracks individual seasons of TV series
- Links to main series entry in `movies` table
- Stores season-specific ratings, notes, and progress
- Automatically updates based on episode progress

#### `series_episodes`
- Tracks individual episodes within seasons
- Supports episode-level watch tracking
- Enables detailed viewing analytics

### Modified Tables

#### `movies` (for Series entries)
- `latest_season_watched`: Highest completed season number
- `total_seasons_available`: Total seasons available (from TMDB)
- `overall_rating`: Series-wide rating (separate from season ratings)
- `overall_notes`: Series-wide notes

### New Database View

#### `series_with_seasons`
Convenient view that aggregates series and season data:
- Series information with season statistics
- Episode completion counts
- Average ratings across seasons
- Latest completion dates

## Automated Features

### Triggers
- **Episode Watch Trigger**: Updates season progress when episodes are marked as watched
- **Season Completion Trigger**: Updates series status when seasons are completed
- **Timestamp Triggers**: Automatically updates `updated_at` fields

### Status Management
- Series status automatically reflects overall progress across seasons
- Season status updates based on episode completion
- Watch dates cascade from episodes → seasons → series

## Performance Considerations

### Indexes Created
- `series_seasons.series_id` - Fast season lookups
- `series_episodes.season_id` - Fast episode queries
- `series_seasons.watch_date` - Analytics performance
- Additional indexes on status and number fields

### Query Optimization
- Use the `series_with_seasons` view for aggregated data
- Batch episode updates when possible
- Consider pagination for series with many seasons/episodes

## Troubleshooting

### Common Issues

1. **Migration fails with foreign key errors**
   - Ensure no orphaned series records exist
   - Check that all referenced user IDs are valid

2. **Season numbers not parsed correctly**
   - Check the `extract_season_number` function in migration script
   - Manually update any incorrectly parsed seasons

3. **Triggers not firing**
   - Verify triggers are enabled: `SELECT * FROM pg_trigger WHERE tgname LIKE '%season%'`
   - Check for constraint violations that might prevent updates

4. **Performance issues**
   - Ensure all indexes are created: `SELECT * FROM pg_indexes WHERE tablename IN ('series_seasons', 'series_episodes')`
   - Consider VACUUM ANALYZE after large data migrations

### Support Queries

```sql
-- Check migration status
SELECT 
    (SELECT COUNT(*) FROM public.movies WHERE category = 'Series') as total_series,
    (SELECT COUNT(*) FROM public.series_seasons) as total_seasons,
    (SELECT COUNT(*) FROM public.series_episodes) as total_episodes,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'movies_backup_pre_season_migration') as backup_exists;

-- Find series without seasons (potential issues)
SELECT m.title, m.id 
FROM public.movies m
LEFT JOIN public.series_seasons ss ON m.id = ss.series_id
WHERE m.category = 'Series' AND ss.id IS NULL;

-- Check trigger status
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname IN ('update_season_on_episode_watch', 'update_series_on_season_change');
```

## Next Steps

After successful migration:
1. Implement backend API endpoints
2. Update frontend components
3. Integrate TMDB episode data fetching
4. Add advanced analytics features
5. Consider implementing social features and recommendations

---

**⚠️ Important Notes:**
- Always backup your database before running migrations
- Test migrations on a copy of production data first
- Monitor application performance after migration
- Keep backup tables until you're confident the migration is stable
