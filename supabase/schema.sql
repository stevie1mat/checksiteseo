-- Drop existing objects to allow clean re-run
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop Tables (Cascade will handle dependent policies, but dropping policies explicitly is cleaner)
drop table if exists public.pages cascade;
drop table if exists public.sites cascade;
drop table if exists public.profiles cascade;

-- Create a table for public user profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for sites
create table public.sites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  name text,
  status text default 'pending', -- pending, analyzing, completed, error
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for pages
create table public.pages (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.sites not null,
  url text not null,
  aeo_score integer,
  checklist jsonb,
  status text default 'pending',
  last_scanned_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.pages enable row level security;

-- Policies for Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Policies for Sites
create policy "Users can view own sites"
  on public.sites for select
  using ( auth.uid() = user_id );

create policy "Users can insert own sites"
  on public.sites for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own sites"
  on public.sites for update
  using ( auth.uid() = user_id );

create policy "Users can delete own sites"
  on public.sites for delete
  using ( auth.uid() = user_id );

-- Policies for Pages
create policy "Users can view pages of own sites"
  on public.pages for select
  using ( exists ( select 1 from public.sites where id = public.pages.site_id and user_id = auth.uid() ) );

create policy "Users can insert pages to own sites"
  on public.pages for insert
  with check ( exists ( select 1 from public.sites where id = public.pages.site_id and user_id = auth.uid() ) );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
