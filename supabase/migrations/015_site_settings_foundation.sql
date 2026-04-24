create table if not exists public.site_settings (
  site_key text,
  channel_name text,
  slogan text,
  short_description text,
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
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists site_key text,
  add column if not exists channel_name text,
  add column if not exists slogan text,
  add column if not exists short_description text,
  add column if not exists contact_email text,
  add column if not exists whatsapp_community_url text,
  add column if not exists primary_logo_url text,
  add column if not exists banner_logo_url text,
  add column if not exists default_social_image_url text,
  add column if not exists site_url text,
  add column if not exists default_seo_title text,
  add column if not exists default_seo_description text,
  add column if not exists youtube_channel_url text,
  add column if not exists global_notice text,
  add column if not exists institutional_text text,
  add column if not exists updated_by uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.site_settings
set site_key = 'primary'
where site_key is null
   or btrim(site_key) = '';

alter table public.site_settings
alter column site_key set default 'primary';

alter table public.site_settings
alter column site_key set not null;

with ranked as (
  select
    ctid,
    row_number() over (
      partition by site_key
      order by updated_at desc nulls last, created_at desc nulls last
    ) as rn
  from public.site_settings
)
delete from public.site_settings s
using ranked r
where s.ctid = r.ctid
  and r.rn > 1;

create unique index if not exists idx_site_settings_site_key_unique
  on public.site_settings (site_key);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'site_settings_singleton_check'
  ) then
    alter table public.site_settings
      add constraint site_settings_singleton_check
      check (site_key = 'primary');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'site_settings_updated_by_fkey'
  ) then
    alter table public.site_settings
      add constraint site_settings_updated_by_fkey
      foreign key (updated_by)
      references public.admin_users(id)
      on delete set null;
  end if;
end $$;

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
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

insert into public.site_settings (
  site_key,
  channel_name,
  slogan,
  short_description,
  contact_email,
  whatsapp_community_url,
  primary_logo_url,
  banner_logo_url,
  default_social_image_url,
  site_url,
  default_seo_title,
  default_seo_description,
  youtube_channel_url,
  global_notice,
  institutional_text
)
select
  'primary',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null
where not exists (
  select 1
  from public.site_settings
  where site_key = 'primary'
);