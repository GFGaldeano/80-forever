-- =========================================================
-- 016_public_translation_foundation.sql
-- Ajustada al schema real del backup 80's Forever
-- =========================================================

-- =========================================================
-- 1) Tablas de traducción
-- =========================================================

create table if not exists public.site_settings_translations (
  id uuid primary key default gen_random_uuid(),
  site_settings_id uuid not null
    references public.site_settings(id)
    on delete cascade,
  locale text not null
    check (locale in ('es', 'en')),
  site_name text,
  channel_name text,
  tagline text,
  slogan text,
  short_description text,
  default_offline_message text,
  primary_cta_label text,
  default_seo_title text,
  default_seo_description text,
  global_notice text,
  institutional_text text,
  updated_by uuid
    references public.admin_users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_site_settings_translations unique (site_settings_id, locale)
);

create table if not exists public.stream_config_translations (
  id uuid primary key default gen_random_uuid(),
  stream_config_id uuid not null
    references public.stream_config(id)
    on delete cascade,
  locale text not null
    check (locale in ('es', 'en')),
  title text,
  subtitle text,
  offline_message text,
  updated_by uuid
    references public.admin_users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_stream_config_translations unique (stream_config_id, locale)
);

create table if not exists public.blog_category_translations (
  id uuid primary key default gen_random_uuid(),
  blog_category_id uuid not null
    references public.blog_categories(id)
    on delete cascade,
  locale text not null
    check (locale in ('es', 'en')),
  slug text,
  name text not null,
  description text,
  updated_by uuid
    references public.admin_users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_blog_category_translations unique (blog_category_id, locale)
);

create table if not exists public.blog_post_translations (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null
    references public.blog_posts(id)
    on delete cascade,
  locale text not null
    check (locale in ('es', 'en')),
  slug text,
  title text not null,
  excerpt text,
  content text not null,
  updated_by uuid
    references public.admin_users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_blog_post_translations unique (blog_post_id, locale)
);

create table if not exists public.transmission_translations (
  id uuid primary key default gen_random_uuid(),
  transmission_id uuid not null
    references public.transmissions(id)
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
  constraint uq_transmission_translations unique (transmission_id, locale)
);

-- =========================================================
-- 2) Índices
-- =========================================================

create index if not exists idx_site_settings_translations_locale
  on public.site_settings_translations(locale);

create index if not exists idx_site_settings_translations_site_settings_id
  on public.site_settings_translations(site_settings_id);

create index if not exists idx_stream_config_translations_locale
  on public.stream_config_translations(locale);

create index if not exists idx_stream_config_translations_stream_config_id
  on public.stream_config_translations(stream_config_id);

create index if not exists idx_blog_category_translations_locale
  on public.blog_category_translations(locale);

create index if not exists idx_blog_category_translations_blog_category_id
  on public.blog_category_translations(blog_category_id);

create unique index if not exists ux_blog_category_translations_locale_slug
  on public.blog_category_translations(locale, slug)
  where slug is not null;

create index if not exists idx_blog_post_translations_locale
  on public.blog_post_translations(locale);

create index if not exists idx_blog_post_translations_blog_post_id
  on public.blog_post_translations(blog_post_id);

create unique index if not exists ux_blog_post_translations_locale_slug
  on public.blog_post_translations(locale, slug)
  where slug is not null;

create index if not exists idx_transmission_translations_locale
  on public.transmission_translations(locale);

create index if not exists idx_transmission_translations_transmission_id
  on public.transmission_translations(transmission_id);

create unique index if not exists ux_transmission_translations_locale_slug
  on public.transmission_translations(locale, slug)
  where slug is not null;

-- =========================================================
-- 3) Triggers updated_at
-- =========================================================

drop trigger if exists trg_site_settings_translations_updated_at
  on public.site_settings_translations;
create trigger trg_site_settings_translations_updated_at
before update on public.site_settings_translations
for each row
execute function public.set_updated_at();

drop trigger if exists trg_stream_config_translations_updated_at
  on public.stream_config_translations;
create trigger trg_stream_config_translations_updated_at
before update on public.stream_config_translations
for each row
execute function public.set_updated_at();

drop trigger if exists trg_blog_category_translations_updated_at
  on public.blog_category_translations;
create trigger trg_blog_category_translations_updated_at
before update on public.blog_category_translations
for each row
execute function public.set_updated_at();

drop trigger if exists trg_blog_post_translations_updated_at
  on public.blog_post_translations;
create trigger trg_blog_post_translations_updated_at
before update on public.blog_post_translations
for each row
execute function public.set_updated_at();

drop trigger if exists trg_transmission_translations_updated_at
  on public.transmission_translations;
create trigger trg_transmission_translations_updated_at
before update on public.transmission_translations
for each row
execute function public.set_updated_at();

-- =========================================================
-- 4) RLS
-- =========================================================

alter table public.site_settings_translations enable row level security;
alter table public.stream_config_translations enable row level security;
alter table public.blog_category_translations enable row level security;
alter table public.blog_post_translations enable row level security;
alter table public.transmission_translations enable row level security;

-- =========================================================
-- 5) Policies públicas
-- =========================================================

drop policy if exists "Public can read site settings translations"
  on public.site_settings_translations;
create policy "Public can read site settings translations"
on public.site_settings_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.site_settings s
    where s.id = site_settings_translations.site_settings_id
  )
);

drop policy if exists "Public can read stream config translations"
  on public.stream_config_translations;
create policy "Public can read stream config translations"
on public.stream_config_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.stream_config sc
    where sc.id = stream_config_translations.stream_config_id
      and sc.is_active = true
  )
);

drop policy if exists "Public can read blog category translations"
  on public.blog_category_translations;
create policy "Public can read blog category translations"
on public.blog_category_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_categories bc
    where bc.id = blog_category_translations.blog_category_id
      and bc.is_active = true
  )
);

drop policy if exists "Public can read blog post translations"
  on public.blog_post_translations;
create policy "Public can read blog post translations"
on public.blog_post_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_posts bp
    where bp.id = blog_post_translations.blog_post_id
      and bp.is_visible = true
  )
);

drop policy if exists "Public can read transmission translations"
  on public.transmission_translations;
create policy "Public can read transmission translations"
on public.transmission_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.transmissions t
    where t.id = transmission_translations.transmission_id
      and t.is_visible = true
  )
);

-- =========================================================
-- 6) Policies admin
-- =========================================================

drop policy if exists "Admins can manage site settings translations"
  on public.site_settings_translations;
create policy "Admins can manage site settings translations"
on public.site_settings_translations
for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can manage stream config translations"
  on public.stream_config_translations;
create policy "Admins can manage stream config translations"
on public.stream_config_translations
for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can manage blog category translations"
  on public.blog_category_translations;
create policy "Admins can manage blog category translations"
on public.blog_category_translations
for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can manage blog post translations"
  on public.blog_post_translations;
create policy "Admins can manage blog post translations"
on public.blog_post_translations
for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can manage transmission translations"
  on public.transmission_translations;
create policy "Admins can manage transmission translations"
on public.transmission_translations
for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- =========================================================
-- 7) Backfill inicial ES
-- =========================================================

insert into public.site_settings_translations (
  site_settings_id,
  locale,
  site_name,
  channel_name,
  tagline,
  slogan,
  short_description,
  default_offline_message,
  primary_cta_label,
  default_seo_title,
  default_seo_description,
  global_notice,
  institutional_text,
  updated_by
)
select
  s.id,
  'es',
  s.site_name,
  s.channel_name,
  s.tagline,
  s.slogan,
  s.short_description,
  s.default_offline_message,
  s.primary_cta_label,
  s.default_seo_title,
  s.default_seo_description,
  s.global_notice,
  s.institutional_text,
  s.updated_by
from public.site_settings s
on conflict (site_settings_id, locale) do update
set
  site_name = excluded.site_name,
  channel_name = excluded.channel_name,
  tagline = excluded.tagline,
  slogan = excluded.slogan,
  short_description = excluded.short_description,
  default_offline_message = excluded.default_offline_message,
  primary_cta_label = excluded.primary_cta_label,
  default_seo_title = excluded.default_seo_title,
  default_seo_description = excluded.default_seo_description,
  global_notice = excluded.global_notice,
  institutional_text = excluded.institutional_text,
  updated_by = excluded.updated_by;

insert into public.stream_config_translations (
  stream_config_id,
  locale,
  title,
  subtitle,
  offline_message,
  updated_by
)
select
  sc.id,
  'es',
  sc.title,
  sc.subtitle,
  sc.offline_message,
  sc.updated_by
from public.stream_config sc
on conflict (stream_config_id, locale) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  offline_message = excluded.offline_message,
  updated_by = excluded.updated_by;

insert into public.blog_category_translations (
  blog_category_id,
  locale,
  slug,
  name,
  description
)
select
  bc.id,
  'es',
  bc.slug,
  bc.name,
  bc.description
from public.blog_categories bc
on conflict (blog_category_id, locale) do update
set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.blog_post_translations (
  blog_post_id,
  locale,
  slug,
  title,
  excerpt,
  content,
  updated_by
)
select
  bp.id,
  'es',
  bp.slug,
  bp.title,
  bp.excerpt,
  bp.content,
  bp.updated_by
from public.blog_posts bp
on conflict (blog_post_id, locale) do update
set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  updated_by = excluded.updated_by;

insert into public.transmission_translations (
  transmission_id,
  locale,
  slug,
  title,
  description,
  updated_by
)
select
  t.id,
  'es',
  t.slug,
  t.title,
  t.description,
  t.updated_by
from public.transmissions t
on conflict (transmission_id, locale) do update
set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  updated_by = excluded.updated_by;