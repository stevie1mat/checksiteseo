# Supabase Cron Job - Backend KeepAlive

This migration sets up a cron job in Supabase that pings your Render backend every 12 minutes to prevent it from sleeping.

## Setup Instructions

### 1. Run the Migration

Run the migration file `20250101_keepalive_cron.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `20250101_keepalive_cron.sql`
3. Click "Run"

### 2. Configure Backend URL

The cron job will use your Render backend URL. You can configure it in two ways:

**Option A: Set in Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → Settings → Database
2. Under "Custom Config", add:
   ```
   app.backend_url = 'https://checksiteseo.onrender.com'
   ```

**Option B: Edit the Migration**
- Edit the `ping_backend_health()` function in the migration file
- Replace `'https://checksiteseo.onrender.com'` with your actual backend URL
- Re-run the migration

### 3. Verify It's Working

Check if the cron job was created:
```sql
SELECT * FROM cron.job WHERE jobname = 'ping-backend-keepalive';
```

View recent job runs:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'ping-backend-keepalive')
ORDER BY start_time DESC 
LIMIT 10;
```

### 4. Monitor Backend Logs

Check your Render backend logs to see the ping requests coming in every 12 minutes.

## Managing the Cron Job

**View all cron jobs:**
```sql
SELECT * FROM cron.job;
```

**View job history:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'ping-backend-keepalive')
ORDER BY start_time DESC;
```

**Unschedule the job (if needed):**
```sql
SELECT cron.unschedule('ping-backend-keepalive');
```

**Reschedule with different interval (e.g., every 10 minutes):**
```sql
-- First unschedule
SELECT cron.unschedule('ping-backend-keepalive');

-- Then reschedule
SELECT cron.schedule(
  'ping-backend-keepalive',
  '*/10 * * * *',  -- Every 10 minutes
  $$SELECT ping_backend_health();$$
);
```

## Cron Syntax

The cron syntax `*/12 * * * *` means:
- `*/12` - Every 12 minutes
- `*` - Every hour
- `*` - Every day of month
- `*` - Every month
- `*` - Every day of week

Other examples:
- `*/5 * * * *` - Every 5 minutes
- `*/10 * * * *` - Every 10 minutes
- `0 * * * *` - Every hour (at minute 0)
- `0 */6 * * *` - Every 6 hours

## Troubleshooting

**If the job isn't running:**
1. Check if extensions are enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
   ```

2. Check for errors in job run details:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'ping-backend-keepalive')
   AND status = 'failed'
   ORDER BY start_time DESC;
   ```

3. Verify the backend URL is accessible:
   ```sql
   SELECT ping_backend_health();
   ```

## Benefits Over Client-Side Pinger

- ✅ Works 24/7 regardless of user activity
- ✅ No dependency on users being on the site
- ✅ Server-side, more reliable
- ✅ Can be monitored in Supabase dashboard
- ✅ No client-side code needed (though you can keep the client-side one as backup)
