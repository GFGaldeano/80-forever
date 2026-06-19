-- =========================================================
-- 001_public_schema_baseline.sql
-- 80 Forever - baseline para Supabase CLI local
-- =========================================================
--
-- Propósito:
--   Reconstruir las tablas base que existían antes de las migraciones
--   versionadas 005..018 incluidas en el repo.
--
-- Contexto:
--   El repo recibido tiene migraciones desde 005 en adelante, pero faltan
--   las migraciones iniciales 001..004. Sin esta baseline, `supabase db reset`
--   falla porque 005_contact_messages_expand_types.sql espera tablas previas.
--
-- Alcance:
--   - public.admin_users
--   - public.stream_config
--   - public.sponsors
--   - public.sponsor_assets
--   - public.v_active_sponsor_assets
--   - public.song_requests
--   - public.contact_messages
--   - funciones helper de admin/RLS
--   - constraints, índices, RLS, policies y triggers base
--
-- No incluye datos reales de producción.
-- No incluye secretos.
-- No modifica el stack visual ni la lógica de streaming.

create extension if not exists pgcrypto with schema extensions;

-- =========================================================
-- Helper functions
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Las funciones que dependen de public.admin_users se crean despues de la tabla admin_users.

-- =========================================================
-- Admin users
-- =========================================================

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'operator'
    check (role in ('super_admin', 'editor', 'operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_auth_user_id_key unique (auth_user_id),
  constraint admin_users_email_key unique (email)
);

create index if not exists idx_admin_users_is_active
  on public.admin_users (is_active);

create index if not exists idx_admin_users_role
  on public.admin_users (role);

alter table public.admin_users enable row level security;

-- Funciones que dependen de public.admin_users. Deben existir antes de policies que las invocan.
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.auth_user_id = auth.uid()
      and au.is_active = true
  );
$$;

comment on function public.is_active_admin()
is 'Devuelve true si el usuario autenticado actual existe en public.admin_users y está activo.';

create or replace function public.current_admin_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select au.id
  from public.admin_users au
  where au.auth_user_id = auth.uid()
    and au.is_active = true
  limit 1;
$$;

comment on function public.current_admin_user_id()
is 'Devuelve el id interno de public.admin_users para el usuario autenticado actual, o null si no es admin activo.';

drop policy if exists admin_users_select_admins on public.admin_users;
create policy admin_users_select_admins
on public.admin_users
for select
to authenticated
using (public.is_active_admin());

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();



-- =========================================================
-- Stream config
-- =========================================================

create table if not exists public.stream_config (
  id uuid primary key default gen_random_uuid(),
  provider text not null
    check (provider in ('youtube', 'facebook', 'external')),
  source_url text,
  embed_url text,
  status text not null default 'offline'
    check (status in ('live', 'offline', 'upcoming', 'replay')),
  title text not null,
  subtitle text,
  offline_message text,
  next_live_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.stream_config
is 'La policy pública solo permite leer el registro activo. Los admins activos pueden leer/insertar/actualizar.';

create index if not exists idx_stream_config_status
  on public.stream_config (status);

create index if not exists idx_stream_config_next_live_at
  on public.stream_config (next_live_at);

create unique index if not exists ux_stream_config_single_active
  on public.stream_config (is_active)
  where is_active = true;

alter table public.stream_config enable row level security;

drop policy if exists stream_config_public_select_active on public.stream_config;
create policy stream_config_public_select_active
on public.stream_config
for select
to anon, authenticated
using (is_active = true);

drop policy if exists stream_config_admin_select on public.stream_config;
create policy stream_config_admin_select
on public.stream_config
for select
to authenticated
using (public.is_active_admin());

drop policy if exists stream_config_admin_insert on public.stream_config;
create policy stream_config_admin_insert
on public.stream_config
for insert
to authenticated
with check (public.is_active_admin());

drop policy if exists stream_config_admin_update on public.stream_config;
create policy stream_config_admin_update
on public.stream_config
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop trigger if exists trg_stream_config_updated_at on public.stream_config;
create trigger trg_stream_config_updated_at
before update on public.stream_config
for each row
execute function public.set_updated_at();

insert into public.stream_config (
  provider,
  source_url,
  embed_url,
  status,
  title,
  subtitle,
  offline_message,
  is_active
)
select
  'youtube',
  null,
  null,
  'offline',
  '80''s Forever',
  'La música que no tiene tiempo',
  'La transmisión comenzará pronto.',
  true
where not exists (
  select 1
  from public.stream_config
  where is_active = true
);


-- =========================================================
-- Site settings
-- =========================================================
--
-- Esta tabla se crea en la baseline porque la migracion 018_public_translation_foundation.sql
-- referencia public.site_settings(id). En el historico remoto esta columna existia antes
-- de las traducciones, pero en el set parcial de migraciones del repo no estaba reconstruida
-- desde cero.

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_key text,
  site_name text,
  channel_name text,
  tagline text,
  slogan text,
  short_description text,
  default_offline_message text,
  primary_cta_label text,
  contact_email text,
  whatsapp_community_url text,
  primary_logo_url text,
  banner_logo_url text,
  default_social_image_url text,
  site_url text,
  default_seo_title text,
  default_seo_description text,
  youtube_channel_url text,
  global_notice text,
  institutional_text text,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_settings_site_key
  on public.site_settings (site_key);

alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_select on public.site_settings;
create policy site_settings_public_select
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists site_settings_admin_select on public.site_settings;
create policy site_settings_admin_select
on public.site_settings
for select
to authenticated
using (public.is_active_admin());

drop policy if exists site_settings_admin_insert on public.site_settings;
create policy site_settings_admin_insert
on public.site_settings
for insert
to authenticated
with check (public.is_active_admin());

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
on public.site_settings
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

-- =========================================================
-- Sponsors
-- =========================================================

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text,
  contact_name text,
  contact_phone text,
  contact_email text,
  notes text,
  is_visible boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sponsors_name
  on public.sponsors (name);

create index if not exists idx_sponsors_is_visible
  on public.sponsors (is_visible);

create index if not exists idx_sponsors_is_active
  on public.sponsors (is_active);

alter table public.sponsors enable row level security;

drop policy if exists sponsors_admin_select on public.sponsors;
create policy sponsors_admin_select
on public.sponsors
for select
to authenticated
using (public.is_active_admin());

drop policy if exists sponsors_admin_insert on public.sponsors;
create policy sponsors_admin_insert
on public.sponsors
for insert
to authenticated
with check (public.is_active_admin());

drop policy if exists sponsors_admin_update on public.sponsors;
create policy sponsors_admin_update
on public.sponsors
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop trigger if exists trg_sponsors_updated_at on public.sponsors;
create trigger trg_sponsors_updated_at
before update on public.sponsors
for each row
execute function public.set_updated_at();

create table if not exists public.sponsor_assets (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null
    references public.sponsors(id)
    on delete cascade,
  asset_type text not null
    check (asset_type in ('image', 'gif')),
  placement text not null default 'both'
    check (placement in ('top', 'bottom', 'both')),
  asset_url text not null,
  cloudinary_public_id text,
  file_name text,
  mime_type text,
  width integer
    check (width is null or width > 0),
  height integer
    check (height is null or height > 0),
  duration_seconds integer not null default 8
    check (duration_seconds >= 1 and duration_seconds <= 60),
  priority integer not null default 100
    check (priority >= 0),
  link_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_visible boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_sponsor_assets_date_range
    check (starts_at is null or ends_at is null or ends_at > starts_at)
);

comment on table public.sponsor_assets
is 'La policy pública expone únicamente assets visibles, activos, vigentes y con sponsor visible/activo.';

create index if not exists idx_sponsor_assets_sponsor_id
  on public.sponsor_assets (sponsor_id);

create index if not exists idx_sponsor_assets_placement
  on public.sponsor_assets (placement);

create index if not exists idx_sponsor_assets_priority
  on public.sponsor_assets (priority);

create index if not exists idx_sponsor_assets_visibility
  on public.sponsor_assets (is_visible, is_active);

create index if not exists idx_sponsor_assets_starts_at
  on public.sponsor_assets (starts_at);

create index if not exists idx_sponsor_assets_ends_at
  on public.sponsor_assets (ends_at);

alter table public.sponsor_assets enable row level security;

drop policy if exists sponsor_assets_public_select_active on public.sponsor_assets;
create policy sponsor_assets_public_select_active
on public.sponsor_assets
for select
to anon, authenticated
using (
  is_visible = true
  and is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  and exists (
    select 1
    from public.sponsors s
    where s.id = sponsor_assets.sponsor_id
      and s.is_visible = true
      and s.is_active = true
  )
);

drop policy if exists sponsor_assets_admin_select on public.sponsor_assets;
create policy sponsor_assets_admin_select
on public.sponsor_assets
for select
to authenticated
using (public.is_active_admin());

drop policy if exists sponsor_assets_admin_insert on public.sponsor_assets;
create policy sponsor_assets_admin_insert
on public.sponsor_assets
for insert
to authenticated
with check (public.is_active_admin());

drop policy if exists sponsor_assets_admin_update on public.sponsor_assets;
create policy sponsor_assets_admin_update
on public.sponsor_assets
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop trigger if exists trg_sponsor_assets_updated_at on public.sponsor_assets;
create trigger trg_sponsor_assets_updated_at
before update on public.sponsor_assets
for each row
execute function public.set_updated_at();

create or replace view public.v_active_sponsor_assets as
select
  sa.id,
  sa.sponsor_id,
  s.name as sponsor_name,
  s.slug as sponsor_slug,
  sa.asset_type,
  sa.placement,
  sa.asset_url,
  sa.cloudinary_public_id,
  sa.file_name,
  sa.mime_type,
  sa.width,
  sa.height,
  sa.duration_seconds,
  sa.priority,
  coalesce(sa.link_url, s.website_url) as resolved_link_url,
  sa.starts_at,
  sa.ends_at,
  sa.is_visible,
  sa.is_active,
  sa.created_at,
  sa.updated_at
from public.sponsor_assets sa
join public.sponsors s
  on s.id = sa.sponsor_id
where s.is_active = true
  and s.is_visible = true
  and sa.is_active = true
  and sa.is_visible = true
  and (sa.starts_at is null or sa.starts_at <= now())
  and (sa.ends_at is null or sa.ends_at >= now());

-- =========================================================
-- Song requests
-- =========================================================

create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  name_alias text not null,
  song_title text not null,
  artist_name text not null,
  message text,
  social_handle text,
  status text not null default 'new'
    check (status in ('new', 'read', 'highlighted', 'approved', 'archived')),
  admin_notes text,
  reviewed_by uuid references public.admin_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.song_requests
is 'El público solo puede insertar pedidos nuevos. La gestión completa queda reservada a admins activos.';

create index if not exists idx_song_requests_status
  on public.song_requests (status);

create index if not exists idx_song_requests_created_at
  on public.song_requests (created_at desc);

create index if not exists idx_song_requests_reviewed_by
  on public.song_requests (reviewed_by);

alter table public.song_requests enable row level security;

drop policy if exists song_requests_public_insert on public.song_requests;
create policy song_requests_public_insert
on public.song_requests
for insert
to anon, authenticated
with check (
  status = 'new'
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists song_requests_admin_select on public.song_requests;
create policy song_requests_admin_select
on public.song_requests
for select
to authenticated
using (public.is_active_admin());

drop policy if exists song_requests_admin_update on public.song_requests;
create policy song_requests_admin_update
on public.song_requests
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop trigger if exists trg_song_requests_updated_at on public.song_requests;
create trigger trg_song_requests_updated_at
before update on public.song_requests
for each row
execute function public.set_updated_at();

-- =========================================================
-- Contact messages
-- =========================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  email text,
  phone text,
  message text not null,
  message_type text not null default 'general'
    check (
      message_type in (
        'general',
        'commercial',
        'sponsor',
        'sumarme_al_proyecto',
        'alianza_prensa'
      )
    ),
  status text not null default 'new'
    check (status in ('new', 'read', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.contact_messages
is 'El público solo puede insertar mensajes nuevos. La lectura y gestión quedan reservadas a admins activos.';

create index if not exists idx_contact_messages_status
  on public.contact_messages (status);

create index if not exists idx_contact_messages_message_type
  on public.contact_messages (message_type);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists contact_messages_admin_select on public.contact_messages;
create policy contact_messages_admin_select
on public.contact_messages
for select
to authenticated
using (public.is_active_admin());

drop policy if exists contact_messages_admin_update on public.contact_messages;
create policy contact_messages_admin_update
on public.contact_messages
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop trigger if exists trg_contact_messages_updated_at on public.contact_messages;
create trigger trg_contact_messages_updated_at
before update on public.contact_messages
for each row
execute function public.set_updated_at();
