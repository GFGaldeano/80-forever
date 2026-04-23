create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  is_visible boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists cover_image_url text,
  add column if not exists is_visible boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid references public.admin_users(id) on delete set null,
  add column if not exists updated_by uuid references public.admin_users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_slug_key'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_slug_key unique (slug);
  end if;
end $$;

create index if not exists idx_blog_posts_is_visible_published_at
  on public.blog_posts (is_visible, published_at desc);

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read visible blog posts" on public.blog_posts;
create policy "Public can read visible blog posts"
on public.blog_posts
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "Admins can manage blog posts" on public.blog_posts;
create policy "Admins can manage blog posts"
on public.blog_posts
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