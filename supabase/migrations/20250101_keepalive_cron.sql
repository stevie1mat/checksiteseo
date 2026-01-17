-- Migration: Enable pg_cron and pg_net extensions for scheduled jobs
-- This allows us to ping the backend every 12 minutes to prevent Render from sleeping

-- Note: Extensions may need to be enabled in Supabase Dashboard first:
-- Go to: Database → Extensions → Enable "pg_cron" and "pg_net"

-- Enable required extensions (if not already enabled)
-- These might already be enabled in your Supabase project
DO $$
BEGIN
  -- Try to enable pg_cron (may fail if not available or already enabled)
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension may already be enabled or not available: %', SQLERRM;
  END;

  -- Try to enable pg_net (may fail if not available or already enabled)
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_net;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_net extension may already be enabled or not available: %', SQLERRM;
  END;
END $$;

-- Function to ping the backend health endpoint
-- This function will be called by the cron job
CREATE OR REPLACE FUNCTION ping_backend_health()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backend_url TEXT;
  response_id BIGINT;
BEGIN
  -- Get backend URL from environment variable or use default
  -- You can set this in Supabase Dashboard -> Settings -> Database -> Custom Config
  -- Or use a hardcoded URL (replace with your actual Render backend URL)
  backend_url := COALESCE(
    current_setting('app.backend_url', true),
    'https://checksiteseo.onrender.com'
  );

  -- Make HTTP GET request to health endpoint
  -- Using pg_net extension to make the HTTP call
  SELECT net.http_get(
    url := backend_url || '/health',
    headers := jsonb_build_object(
      'User-Agent', 'Supabase-Cron-KeepAlive/1.0'
    ),
    timeout_milliseconds := 5000
  ) INTO response_id;

  -- Log the ping (optional - you can check this in Supabase logs)
  RAISE NOTICE 'Pinged backend at % (request_id: %)', backend_url, response_id;
END;
$$;

-- Schedule the cron job to run every 12 minutes
-- Cron syntax: */12 * * * * means "every 12 minutes"
-- To run every 10 minutes, use: */10 * * * *
-- To run every 5 minutes, use: */5 * * * *
SELECT cron.schedule(
  'ping-backend-keepalive',
  '*/12 * * * *',  -- Every 12 minutes
  $$SELECT ping_backend_health();$$
);

-- Verify the job was created
SELECT * FROM cron.job WHERE jobname = 'ping-backend-keepalive';

-- Instructions:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. To update the backend URL, you can either:
--    a. Set it in Supabase Dashboard -> Settings -> Database -> Custom Config as 'app.backend_url'
--    b. Or modify the hardcoded URL in the function above
-- 3. To view cron job status: SELECT * FROM cron.job;
-- 4. To view cron job history: SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'ping-backend-keepalive');
-- 5. To unschedule: SELECT cron.unschedule('ping-backend-keepalive');
