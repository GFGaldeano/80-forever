# Feature: Live provider toggle + YouTube fallback

## Objetivo

Preparar 80 Forever para soportar una señal propia self-hosted HLS sin eliminar YouTube.

Esta feature no implementa todavía el reproductor HLS final. Deja lista la base de datos, validaciones, tipos y formulario admin para que la próxima feature pueda conectar `MediaMTX + OBS + hls.js`.

## Decisiones

- YouTube no se elimina.
- YouTube queda disponible como fallback de emergencia.
- Se agrega `self_hosted_hls` como nuevo provider de `stream_config`.
- La URL HLS se guarda en `source_url`.
- El embed fallback se puede guardar en `embed_url`.
- No se modifica estética.
- No se modifica on-demand.
- No se modifica la lógica de transmisiones históricas.

## Provider nuevo

```txt
self_hosted_hls
```

Uso esperado:

```txt
source_url = https://stream.80forever.com/80forever/index.m3u8
embed_url  = https://www.youtube.com/embed/VIDEO_ID   # opcional fallback
```

## Archivos tocados

- `supabase/migrations/019_stream_config_self_hosted_hls_provider.sql`
- `src/lib/validators/stream.ts`
- `src/lib/stream/get-admin-stream-config.ts`
- `src/lib/stream/get-public-stream-config.ts`
- `src/components/admin/stream-config-form.tsx`
- `src/components/streaming/public-stream-player.tsx`

## Validación esperada

```bash
npm run supabase:stop:all
rm -rf supabase/.temp
npm run supabase:db:start
npm run supabase:db:reset
npm run build
```

## Próxima feature

```txt
feature/self-hosted-hls-player-foundation
```

Ahí se agregará el reproductor real con `hls.js` y se consumirá `source_url` cuando el provider sea `self_hosted_hls`.
