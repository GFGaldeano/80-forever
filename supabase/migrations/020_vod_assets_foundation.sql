-- =========================================================
-- 020_vod_assets_foundation.sql
-- 80 Forever - VOD / emisiones pasadas foundation
-- =========================================================
--
-- Objetivo:
--   Crear la base de datos inicial para videos on-demand derivados de
--   transmisiones pasadas o contenidos historicos.
--
-- Decisiones:
--   - Los archivos pesados NO se guardan en Supabase.
--   - Supabase guarda metadata, URLs, estado y relacion con transmisiones.
--   - El contenido puede apuntar a MP4, HLS VOD o ambos.
--   - La publicacion publica requiere status='published' e is_visible=true.

-- =========================================================
-- 1) Tabla principal VOD
-- =========================================================

create table if not exists public.vod_assets (
  id uuid primary key default gen_random_uuid(),

  transmission_id uuid
    references public.transmissions(id)
    on delete set null,

  media_kind text not null default 'emission'
    check (media_kind in ('emission', 'clip', 'promo', 'other')),

  status text not null default 'draft'
    check (status in ('draft', 'processing', 'ready', 'published', 'archived')),

  title text not null,
  slug text not null unique,
  description text,

  video_url text,
  hls_url text,
  poster_url text,
  thumbnail_url text,

  storage_provider text not null default 'local'
    check (storage_provider in ('local', 'self_hosted', 'cloudinary', 'external')),
  storage_path text,

  duration_seconds integer
    check (duration_seconds is null or duration_seconds >= 0),
  file_size_bytes bigint
    check (file_size_bytes is null or file_size_bytes >= 0),
  mime_type text,

  recorded_at timestamptz,
  published_at timestamptz,
  is_visible boolean not null default false,

  metadata jsonb not null default '{}'::jsonb,

  created_by uuid
    references public.admin_users(id)
    on delete set null,
  updated_by uuid
    references public.admin_users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vod_assets_published_media_url_check
    check (
      status <> 'published'
      or hls_url is not null
      or video_url is not null
    )
);

comment on table public.vod_assets
is 'Metadata de videos on-demand / emisiones pasadas. Los archivos viven en servidor de medios o storage externo; Supabase guarda URLs y estado.';

comment on column public.vod_assets.transmission_id
is 'Relacion opcional con una transmision historica de 80 Forever.';

comment on column public.vod_assets.hls_url
is 'URL publica HLS VOD, por ejemplo https://vod.80forever.com.ar/vod/slug/index.m3u8.';

comment on column public.vod_assets.video_url
is 'URL publica MP4 alternativa o principal cuando no se usa HLS VOD.';

create index if not exists idx_vod_assets_transmission_id
  on public.vod_assets (transmission_id);

create index if not exists idx_vod_assets_status
  on public.vod_assets (status);

create index if not exists idx_vod_assets_is_visible
  on public.vod_assets (is_visible);

create index if not exists idx_vod_assets_published_at_desc
  on public.vod_assets (published_at desc);

create index if not exists idx_vod_assets_recorded_at_desc
  on public.vod_assets (recorded_at desc);

create index if not exists idx_vod_assets_media_kind
  on public.vod_assets (media_kind);

create index if not exists idx_vod_assets_metadata_gin
  on public.vod_assets using gin (metadata);

-- =========================================================
-- 2) Traducciones VOD
-- =========================================================

create table if not exists public.vod_asset_translations (
  id uuid primary key default gen_random_uuid(),

  vod_asset_id uuid not null
    references public.vod_assets(id)
    on delete cascade,

  locale text not null
    check (locale in ('es', 'en')),

  slug text,
  title text not null,
  description text,

  updated_by uuid
    references public.admin_users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_vod_asset_translations unique (vod_asset_id, locale),
  constraint uq_vod_asset_translations_locale_slug unique (locale, slug)
);

comment on table public.vod_asset_translations
is 'Traducciones publicas de videos on-demand / emisiones pasadas.';

create index if not exists idx_vod_asset_translations_vod_asset_id
  on public.vod_asset_translations (vod_asset_id);

create index if not exists idx_vod_asset_translations_locale
  on public.vod_asset_translations (locale);

-- =========================================================
-- 3) Updated at triggers
-- =========================================================

drop trigger if exists trg_vod_assets_updated_at on public.vod_assets;
create trigger trg_vod_assets_updated_at
before update on public.vod_assets
for each row
execute function public.set_updated_at();

drop trigger if exists trg_vod_asset_translations_updated_at on public.vod_asset_translations;
create trigger trg_vod_asset_translations_updated_at
before update on public.vod_asset_translations
for each row
execute function public.set_updated_at();

-- =========================================================
-- 4) RLS
-- =========================================================

alter table public.vod_assets enable row level security;
alter table public.vod_asset_translations enable row level security;

-- Publico: solo assets publicados y visibles.
drop policy if exists "Public can read published vod assets" on public.vod_assets;
create policy "Public can read published vod assets"
on public.vod_assets
for select
to anon, authenticated
using (status = 'published' and is_visible = true);

-- Admins: gestion completa.
drop policy if exists "Admins can manage vod assets" on public.vod_assets;
create policy "Admins can manage vod assets"
on public.vod_assets
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- Publico: traducciones solo si el asset padre esta publicado y visible.
drop policy if exists "Public can read published vod asset translations" on public.vod_asset_translations;
create policy "Public can read published vod asset translations"
on public.vod_asset_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.vod_assets va
    where va.id = vod_asset_translations.vod_asset_id
      and va.status = 'published'
      and va.is_visible = true
  )
);

-- Admins: gestion completa de traducciones.
drop policy if exists "Admins can manage vod asset translations" on public.vod_asset_translations;
create policy "Admins can manage vod asset translations"
on public.vod_asset_translations
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- =========================================================
-- 5) Vista publica base
-- =========================================================

create or replace view public.v_public_vod_assets as
select
  va.id,
  va.transmission_id,
  va.media_kind,
  va.status,
  va.title,
  va.slug,
  va.description,
  va.video_url,
  va.hls_url,
  va.poster_url,
  va.thumbnail_url,
  va.duration_seconds,
  va.recorded_at,
  va.published_at,
  va.created_at,
  va.updated_at
from public.vod_assets va
where va.status = 'published'
  and va.is_visible = true;

comment on view public.v_public_vod_assets
is 'Vista base de videos on-demand publicados y visibles.';
