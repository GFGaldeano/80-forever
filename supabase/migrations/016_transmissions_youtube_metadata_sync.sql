alter table public.transmissions
  add column if not exists youtube_title text,
  add column if not exists youtube_author_name text,
  add column if not exists youtube_author_url text,
  add column if not exists youtube_last_synced_at timestamptz;

create index if not exists idx_transmissions_youtube_video_id
  on public.transmissions (youtube_video_id);

create index if not exists idx_transmissions_youtube_last_synced_at
  on public.transmissions (youtube_last_synced_at desc);