-- THE M PRNT V2 / Supabase secure CMS. Run once in the Supabase SQL Editor.
-- After inviting/creating the user in Authentication, authorize exactly that user ID:
-- INSERT INTO public.portfolio_admins(user_id) VALUES ('YOUR-ADMIN-AUTH-USER-UUID');
-- Do NOT paste a service-role key into js/config.js. Only public publishable/anon keys belong there.

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon,authenticated;
grant select on public.portfolio_admins to authenticated;
drop policy if exists "Admin can inspect own membership" on public.portfolio_admins;
create policy "Admin can inspect own membership" on public.portfolio_admins
 for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_portfolio_admin(candidate uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.portfolio_admins where user_id = candidate) $$;
revoke all on function public.is_portfolio_admin(uuid) from public;
grant execute on function public.is_portfolio_admin(uuid) to anon,authenticated;

create table if not exists public.portfolio_projects (
 id text primary key,
 data jsonb not null default '{}'::jsonb,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 sort_order int not null default 1000,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists portfolio_projects_status_order on public.portfolio_projects(status,sort_order);
alter table public.portfolio_projects enable row level security;
grant select on public.portfolio_projects to anon,authenticated;
grant insert,update,delete on public.portfolio_projects to authenticated;
drop policy if exists "Public reads published projects" on public.portfolio_projects;
create policy "Public reads published projects" on public.portfolio_projects for select to anon,authenticated
 using (status='published' or public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Admin inserts projects" on public.portfolio_projects;
create policy "Admin inserts projects" on public.portfolio_projects for insert to authenticated
 with check (public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Admin updates projects" on public.portfolio_projects;
create policy "Admin updates projects" on public.portfolio_projects for update to authenticated
 using (public.is_portfolio_admin((select auth.uid()))) with check (public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Admin deletes projects" on public.portfolio_projects;
create policy "Admin deletes projects" on public.portfolio_projects for delete to authenticated
 using (public.is_portfolio_admin((select auth.uid())));

create table if not exists public.portfolio_settings (
 key text primary key,
 value jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.portfolio_settings enable row level security;
grant select on public.portfolio_settings to anon,authenticated;
grant insert,update,delete on public.portfolio_settings to authenticated;
drop policy if exists "Public reads site settings" on public.portfolio_settings;
create policy "Public reads site settings" on public.portfolio_settings for select to anon,authenticated using (true);
drop policy if exists "Admin inserts site settings" on public.portfolio_settings;
create policy "Admin inserts site settings" on public.portfolio_settings for insert to authenticated with check(public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Admin updates site settings" on public.portfolio_settings;
create policy "Admin updates site settings" on public.portfolio_settings for update to authenticated using(public.is_portfolio_admin((select auth.uid()))) with check(public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Admin deletes site settings" on public.portfolio_settings;
create policy "Admin deletes site settings" on public.portfolio_settings for delete to authenticated using(public.is_portfolio_admin((select auth.uid())));

create table if not exists public.portfolio_revisions (
 id bigint generated always as identity primary key,
 project_id text not null,
 previous_data jsonb not null,
 previous_status text not null,
 previous_order int not null,
 created_by uuid default auth.uid(),
 created_at timestamptz not null default now()
);
create index if not exists portfolio_revisions_project on public.portfolio_revisions(project_id,created_at desc);
alter table public.portfolio_revisions enable row level security;
grant select,insert on public.portfolio_revisions to authenticated;
drop policy if exists "Admin reads revisions" on public.portfolio_revisions;
create policy "Admin reads revisions" on public.portfolio_revisions for select to authenticated using(public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Admin saves revisions" on public.portfolio_revisions;
create policy "Admin saves revisions" on public.portfolio_revisions for insert to authenticated with check(public.is_portfolio_admin((select auth.uid())) and created_by=(select auth.uid()));

-- Media URLs are public once uploaded. Don't upload confidential/unreleased material to this public bucket.
insert into storage.buckets(id,name,public,file_size_limit)
 values ('portfolio-media','portfolio-media',true,47185920)
 on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit;
drop policy if exists "Anyone reads portfolio media" on storage.objects;
create policy "Anyone reads portfolio media" on storage.objects for select to anon,authenticated using(bucket_id='portfolio-media');
drop policy if exists "Only portfolio admins upload media" on storage.objects;
create policy "Only portfolio admins upload media" on storage.objects for insert to authenticated
 with check(bucket_id='portfolio-media' and public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Only portfolio admins replace media" on storage.objects;
create policy "Only portfolio admins replace media" on storage.objects for update to authenticated
 using(bucket_id='portfolio-media' and public.is_portfolio_admin((select auth.uid())))
 with check(bucket_id='portfolio-media' and public.is_portfolio_admin((select auth.uid())));
drop policy if exists "Only portfolio admins delete media" on storage.objects;
create policy "Only portfolio admins delete media" on storage.objects for delete to authenticated
 using(bucket_id='portfolio-media' and public.is_portfolio_admin((select auth.uid())));

-- Optional: audit for publishing and a status-aware backup are in the dashboard.
-- Retain the SQL seed file separately as initial migration, and periodically download backup JSON.
