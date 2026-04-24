create index if not exists idx_site_analytics_events_metadata_action
  on public.site_analytics_events ((metadata->>'action'));

create index if not exists idx_site_analytics_events_metadata_status
  on public.site_analytics_events ((metadata->>'status'));

create index if not exists idx_site_analytics_events_stream_action_status_occurred
  on public.site_analytics_events (
    event_name,
    occurred_at desc,
    ((metadata->>'action')),
    ((metadata->>'status'))
  );