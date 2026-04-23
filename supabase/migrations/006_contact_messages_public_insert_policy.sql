alter table public.contact_messages enable row level security;

drop policy if exists "Public can insert contact messages" on public.contact_messages;

create policy "Public can insert contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (
  status = 'new'
  and message_type in (
    'general',
    'commercial',
    'sponsor',
    'sumarme_al_proyecto',
    'alianza_prensa'
  )
);