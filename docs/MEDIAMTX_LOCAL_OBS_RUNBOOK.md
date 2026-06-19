# 80 Forever - MediaMTX local + OBS runbook

## Objetivo

Probar la señal real local de 80 Forever usando este flujo:

```txt
OBS -> MediaMTX local -> HLS local -> 80 Forever localhost
```

## URLs estándar

```txt
RTMP para OBS: rtmp://localhost:1935
Stream key OBS: 80forever
HLS para 80 Forever: http://localhost:8888/80forever/index.m3u8
Sitio local: http://localhost:3000
```

## 1. Levantar MediaMTX local

En PowerShell, desde el repo:

```powershell
cd "E:\80's Forever\80-forever"
powershell -ExecutionPolicy Bypass -File .\scripts\streaming\start-mediamtx-local.ps1
```

Dejá esa terminal abierta.

## 2. Configurar 80 Forever

En otra terminal Bash:

```bash
cd "/e/80's Forever/80-forever"
npm run dev
```

Abrí:

```txt
http://localhost:3000/admin/stream
```

Configurá:

```txt
Provider: Self-hosted HLS
Estado: En vivo
URL HLS (.m3u8): http://localhost:8888/80forever/index.m3u8
URL fallback de emergencia: https://www.youtube.com/embed/VIDEO_ID
```

Guardá la configuración.

## 3. Configurar OBS

En OBS:

```txt
Settings -> Stream
Service: Custom...
Server: rtmp://localhost:1935
Stream Key: 80forever
```

Configuración recomendada inicial:

```txt
Video bitrate: 2500 a 4500 Kbps
Keyframe interval: 2 segundos
Audio bitrate: 160 Kbps
Sample rate: 48 kHz
```

## 4. Momento exacto para transmitir

Cuando MediaMTX esté levantado y `/admin/stream` ya tenga la URL local HLS:

```txt
AHORA SÍ: abrí OBS y empezá a transmitir.
```

En OBS:

```txt
Start Streaming
```

## 5. Validar en localhost

Abrí o refrescá:

```txt
http://localhost:3000
```

Resultado esperado:

```txt
- El player deja de quedar en "Cargando señal HLS..."
- Se muestra la señal transmitida desde OBS.
- El badge "HLS propio" aparece sobre el player.
```

## 6. Validar manifiesto HLS directo

En navegador, abrir:

```txt
http://localhost:8888/80forever/index.m3u8
```

Si OBS está transmitiendo correctamente, debería devolver un manifiesto HLS.

## 7. Validar analytics

Consulta en Supabase remoto:

```sql
select
  event_name,
  metadata ->> 'action' as action,
  metadata ->> 'component' as component,
  metadata ->> 'provider' as provider,
  metadata ->> 'mode' as mode,
  metadata ->> 'error_detail' as error_detail,
  metadata ->> 'fallback_triggered' as fallback_triggered,
  created_at
from public.site_analytics_events
where event_name = 'stream_interaction'
order by created_at desc
limit 20;
```

Eventos esperados si HLS carga:

```txt
hls_load_start
hls_js_supported
hls_media_attached
hls_ready
```

Si falla HLS y usa fallback:

```txt
hls_error
hls_fallback_youtube
```

## 8. Detener MediaMTX

PowerShell:

```powershell
cd "E:\80's Forever\80-forever"
powershell -ExecutionPolicy Bypass -File .\scripts\streaming\stop-mediamtx-local.ps1
```

## Troubleshooting

### El player queda en "Cargando señal HLS..."

Revisar:

```txt
1. OBS está transmitiendo.
2. Stream key exacta: 80forever.
3. MediaMTX está levantado.
4. http://localhost:8888/80forever/index.m3u8 devuelve contenido.
```

### Aparece fallback YouTube

Significa que el HLS falló o no estuvo disponible. Revisar logs de MediaMTX y OBS.

### Error de CORS

La config local incluye:

```yaml
hlsAllowOrigin: '*'
```

### Puerto ocupado

Detener contenedor previo:

```powershell
docker rm -f 80forever-mediamtx
```
