-- Add INSERT policy for site_history
-- This allows authenticated users to add history records for sites they own

create policy "Users can insert history of own sites"
  on public.site_history for insert
  with check (
    exists (
      select 1 from public.sites
      where id = site_id
      and user_id = auth.uid()
    )
  );
