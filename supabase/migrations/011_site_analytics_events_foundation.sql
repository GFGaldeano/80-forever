create table if not exists public.site_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text not null,
  page_title text,
  referrer text,
  visitor_id text not null,
  session_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.site_analytics_events
  add column if not exists event_name text,
  add column if not exists page_path text,
  add column if not exists page_title text,
  add column if not exists referrer text,
  add column if not exists visitor_id text,
  add column if not exists session_id text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists occurred_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_site_analytics_events_occurred_at
  on public.site_analytics_events (occurred_at desc);

create index if not exists idx_site_analytics_events_event_name_occurred_at
  on public.site_analytics_events (event_name, occurred_at desc);

create index if not exists idx_site_analytics_events_page_path_occurred_at
  on public.site_analytics_events (page_path, occurred_at desc);

alter table public.site_analytics_events enable row level security;

drop policy if exists "Public can insert analytics events" on public.site_analytics_events;
create policy "Public can insert analytics events"
on public.site_analytics_events
for insert
to anon, authenticated
with check (
  event_name in (
    'page_view',
    'cta_click',
    'sponsor_click',
    'form_submit',
    'stream_interaction'
  )
);

drop policy if exists "Admins can read analytics events" on public.site_analytics_events;
create policy "Admins can read analytics events"
on public.site_analytics_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  )
);

drop policy if exists "Admins can manage analytics events" on public.site_analytics_events;
create policy "Admins can manage analytics events"
on public.site_analytics_events
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.admin_users a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  )
);