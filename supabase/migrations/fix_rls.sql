-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state (prevent "policy already exists" errors)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can insert own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can update own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can delete own sites" ON public.sites;

DROP POLICY IF EXISTS "Users can view pages of own sites" ON public.pages;
DROP POLICY IF EXISTS "Users can insert pages to own sites" ON public.pages;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Sites Policies
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

-- Pages Policies
create policy "Users can view pages of own sites"
  on public.pages for select
  using ( exists ( select 1 from public.sites where id = public.pages.site_id and user_id = auth.uid() ) );

create policy "Users can insert pages to own sites"
  on public.pages for insert
  with check ( exists ( select 1 from public.sites where id = public.pages.site_id and user_id = auth.uid() ) );
