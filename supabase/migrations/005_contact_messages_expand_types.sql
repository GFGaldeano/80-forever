alter table public.contact_messages
drop constraint if exists contact_messages_message_type_check;

alter table public.contact_messages
add constraint contact_messages_message_type_check
check (
  message_type in (
    'general',
    'commercial',
    'sponsor',
    'sumarme_al_proyecto',
    'alianza_prensa'
  )
);