alter table public.transmissions
  add column if not exists youtube_sync_source text,
  add column if not exists youtube_sync_error text;

create index if not exists idx_transmissions_youtube_sync_source
  on public.transmissions (youtube_sync_source);