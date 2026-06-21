# Feature: VOD assets DB foundation

## Objetivo

Crear la base de datos inicial para videos on-demand / emisiones pasadas de 80 Forever.

Esta feature prepara la capa de metadata para que la plataforma pueda registrar videos derivados de transmisiones grabadas, sin guardar archivos pesados dentro de Supabase.

## Decisiones

- Supabase guarda metadata y URLs.
- Los archivos de video viven en servidor de medios, storage externo o futuro Ubuntu Server.
- Un VOD puede estar asociado opcionalmente a una transmision existente.
- Se soporta URL MP4 y URL HLS VOD.
- La publicacion publica exige `status = published` e `is_visible = true`.
- Se agrega soporte de traducciones ES/EN.
- Se agregan policies RLS para publico/admin.

## Archivos

- `supabase/migrations/020_vod_assets_foundation.sql`
- `src/types/vod.ts`
- `docs/FEATURE_VOD_ASSETS_DB_FOUNDATION.md`

## Tablas agregadas

### `public.vod_assets`

Metadata principal de videos on-demand.

Campos destacados:

- `transmission_id`
- `media_kind`
- `status`
- `title`
- `slug`
- `description`
- `video_url`
- `hls_url`
- `poster_url`
- `thumbnail_url`
- `duration_seconds`
- `file_size_bytes`
- `recorded_at`
- `published_at`
- `is_visible`
- `metadata`

### `public.vod_asset_translations`

Traducciones por locale para VOD.

Campos destacados:

- `vod_asset_id`
- `locale`
- `slug`
- `title`
- `description`

## Vista agregada

### `public.v_public_vod_assets`

Vista publica base de videos publicados y visibles.

## Validacion local DB-only

```bash
npm run supabase:stop:all
rm -rf supabase/.temp
npm run supabase:db:start
npm run supabase:db:reset
npm run build
```

## Aplicacion remota

Aplicar solo la migracion `020_vod_assets_foundation.sql` en Supabase remoto, preferentemente desde SQL Editor, para evitar empujar la baseline local `001`.

## Futuras features

- `feature/admin-vod-library-foundation`
- `feature/public-vod-past-transmissions-player`
- `feature/vod-player-analytics`
