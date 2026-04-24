create table if not exists public.transmissions (
  id uuid primary key default gen_random_uuid(),
  episode_code text,
  title text,
  slug text,
  description text,
  youtube_url text,
  youtube_video_id text,
  youtube_watch_url text,
  youtube_embed_url text,
  youtube_thumbnail_url text,
  status text not null default 'draft',
  is_visible boolean not null default false,
  scheduled_at timestamptz,
  aired_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transmissions
  add column if not exists episode_code text,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists youtube_url text,
  add column if not exists youtube_video_id text,
  add column if not exists youtube_watch_url text,
  add column if not exists youtube_embed_url text,
  add column if not exists youtube_thumbnail_url text,
  add column if not exists status text not null default 'draft',
  add column if not exists is_visible boolean not null default false,
  add column if not exists scheduled_at timestamptz,
  add column if not exists aired_at timestamptz,
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transmissions_slug_key'
  ) then
    alter table public.transmissions
      add constraint transmissions_slug_key unique (slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transmissions_episode_code_key'
  ) then
    alter table public.transmissions
      add constraint transmissions_episode_code_key unique (episode_code);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transmissions_status_check'
  ) then
    alter table public.transmissions
      add constraint transmissions_status_check
      check (status in ('draft', 'scheduled', 'aired', 'archived'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transmissions_created_by_fkey'
  ) then
    alter table public.transmissions
      add constraint transmissions_created_by_fkey
      foreign key (created_by)
      references public.admin_users(id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transmissions_updated_by_fkey'
  ) then
    alter table public.transmissions
      add constraint transmissions_updated_by_fkey
      foreign key (updated_by)
      references public.admin_users(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_transmissions_status
  on public.transmissions (status);

create index if not exists idx_transmissions_aired_at_desc
  on public.transmissions (aired_at desc);

create index if not exists idx_transmissions_scheduled_at_desc
  on public.transmissions (scheduled_at desc);

create index if not exists idx_transmissions_is_visible
  on public.transmissions (is_visible);

alter table public.transmissions enable row level security;

drop policy if exists "Public can read visible transmissions" on public.transmissions;
create policy "Public can read visible transmissions"
on public.transmissions
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "Admins can manage transmissions" on public.transmissions;
create policy "Admins can manage transmissions"
on public.transmissions
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