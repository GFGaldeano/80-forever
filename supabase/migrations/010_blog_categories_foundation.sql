create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_categories
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_categories_slug_key'
  ) then
    alter table public.blog_categories
      add constraint blog_categories_slug_key unique (slug);
  end if;
end $$;

alter table public.blog_categories enable row level security;

drop policy if exists "Public can read active blog categories" on public.blog_categories;
create policy "Public can read active blog categories"
on public.blog_categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage blog categories" on public.blog_categories;
create policy "Admins can manage blog categories"
on public.blog_categories
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

insert into public.blog_categories (name, slug, description, sort_order, is_active)
values
  ('Efemérides', 'efemerides', 'Hechos y aniversarios clave del universo musical.', 1, true),
  ('Noticias', 'noticias', 'Novedades del canal, artistas y actualidad editorial.', 2, true),
  ('Transmisiones', 'transmisiones', 'Avisos y contenido relacionado a emisiones especiales.', 3, true),
  ('Especiales', 'especiales', 'Coberturas, selecciones temáticas y contenido destacado.', 4, true),
  ('Comunidad', 'comunidad', 'Contenido social, participación del público y comunidad.', 5, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

alter table public.blog_posts
add column if not exists category_id uuid;

update public.blog_posts
set category_id = (
  select id
  from public.blog_categories
  where slug = 'noticias'
  limit 1
)
where category_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_category_id_fkey'
  ) then
    alter table public.blog_posts
    add constraint blog_posts_category_id_fkey
    foreign key (category_id)
    references public.blog_categories(id)
    on delete restrict;
  end if;
end $$;

create index if not exists idx_blog_posts_category_id
  on public.blog_posts (category_id);

alter table public.blog_posts
alter column category_id set not null;