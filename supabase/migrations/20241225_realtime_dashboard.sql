-- Create site_history table for trend tracking
create table if not exists public.site_history (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.sites not null,
  aeo_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for site_history
alter table public.site_history enable row level security;

-- Policy for viewing history (if not exists)
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can view history of own sites') then
        create policy "Users can view history of own sites"
          on public.site_history for select
          using ( exists ( select 1 from public.sites where id = public.site_history.site_id and user_id = auth.uid() ) );
    end if;
end
$$;

-- Add new columns to sites table
alter table public.sites 
add column if not exists aeo_score integer default 0,
add column if not exists health_status jsonb default '{"robots": "neutral", "schema": "neutral", "content": "neutral"}'::jsonb,
add column if not exists competitors jsonb default '{"yourShare": 0, "top_competitors": []}'::jsonb,
add column if not exists last_scanned_at timestamp with time zone;
