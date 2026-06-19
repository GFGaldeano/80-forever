# Feature: HLS player analytics + fallback events

## Objetivo

Registrar eventos operativos del player HLS para saber cuándo la señal propia carga correctamente, cuándo falla y cuándo se activa el fallback YouTube.

## Alcance

- No toca base de datos.
- Reutiliza `site_analytics_events`.
- Reutiliza `event_name = stream_interaction`.
- Guarda acciones específicas dentro de `metadata.action`.
- No cambia estética.
- No cambia on-demand.

## Eventos registrados

Todos salen como:

```txt
event_name = stream_interaction
metadata.component = hls_stream_player
metadata.provider = self_hosted_hls
```

Acciones:

```txt
hls_load_start
hls_native_supported
hls_js_supported
hls_media_attached
hls_ready
hls_error
hls_unsupported
hls_fallback_youtube
```

## Metadata útil

```txt
source_host
fallback_host
has_source_url
has_fallback_embed
mode
error_detail
error_type
fatal
fallback_triggered
reason
```

## Validación esperada

```bash
npm run build
npm run dev
```

Prueba funcional:

1. Entrar a `/` o `/es`.
2. Verificar que se registra `hls_load_start`.
3. Si el manifiesto HLS carga, verificar `hls_ready`.
4. Si falla HLS y existe fallback, verificar `hls_error` y `hls_fallback_youtube`.
5. Confirmar en DB remota `site_analytics_events`.

Consulta sugerida:

```sql
select
  event_name,
  metadata ->> 'action' as action,
  metadata ->> 'provider' as provider,
  metadata ->> 'mode' as mode,
  metadata ->> 'error_detail' as error_detail,
  metadata ->> 'fallback_triggered' as fallback_triggered,
  created_at
from public.site_analytics_events
where event_name = 'stream_interaction'
  and metadata ->> 'component' = 'hls_stream_player'
order by created_at desc
limit 20;
```
