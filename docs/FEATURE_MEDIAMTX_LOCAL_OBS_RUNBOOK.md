# Feature: MediaMTX local + OBS runbook

## Objetivo

Dejar preparado el flujo de prueba local con MediaMTX y OBS para validar la transmisión real de 80 Forever en `localhost:3000`.

## Alcance

- Config local de MediaMTX.
- Script PowerShell para levantar MediaMTX local.
- Script PowerShell para detener MediaMTX local.
- Runbook operativo paso a paso.
- Instrucciones exactas para OBS.
- URL HLS local para `/admin/stream`.
- Validación con player HLS y analytics existentes.

## Archivos agregados

- `ops/mediamtx/mediamtx.local.yml`
- `scripts/streaming/start-mediamtx-local.ps1`
- `scripts/streaming/stop-mediamtx-local.ps1`
- `docs/MEDIAMTX_LOCAL_OBS_RUNBOOK.md`
- `docs/FEATURE_MEDIAMTX_LOCAL_OBS_RUNBOOK.md`

## Flujo

```txt
OBS -> rtmp://localhost:1935 + stream key 80forever
MediaMTX -> http://localhost:8888/80forever/index.m3u8
80 Forever -> localhost:3000
```

## Momento OBS

El momento correcto para transmitir es después de:

1. MediaMTX local levantado.
2. 80 Forever corriendo en `npm run dev`.
3. `/admin/stream` configurado con provider `Self-hosted HLS`.
4. URL HLS local guardada.

Mensaje operativo:

```txt
AHORA SÍ: abrí OBS y empezá a transmitir.
```

## Validación

No toca DB ni código visual de app. Validación esperada:

```bash
npm run build
npm run dev
```

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\streaming\start-mediamtx-local.ps1
```

OBS:

```txt
Server: rtmp://localhost:1935
Stream Key: 80forever
```

App:

```txt
http://localhost:3000
```
