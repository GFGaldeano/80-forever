-- =========================================================
-- 019_stream_config_self_hosted_hls_provider.sql
-- 80 Forever - proveedor self-hosted HLS con YouTube fallback
-- =========================================================
--
-- Objetivo:
--   Permitir configurar una señal propia HLS (.m3u8) para futura integración
--   con MediaMTX/OBS, manteniendo YouTube/Facebook/external como proveedores
--   de fallback o emergencia.
--
-- Importante:
--   Esta migración solo amplía el enum/check de provider.
--   No elimina YouTube.
--   No modifica datos existentes.
--   No activa todavía el reproductor HLS final.

alter table public.stream_config
  drop constraint if exists stream_config_provider_check;

alter table public.stream_config
  add constraint stream_config_provider_check
  check (
    provider in (
      'youtube',
      'facebook',
      'external',
      'self_hosted_hls'
    )
  );

comment on column public.stream_config.provider
is 'Proveedor de la señal principal: youtube, facebook, external o self_hosted_hls. YouTube se conserva como fallback de emergencia.';
