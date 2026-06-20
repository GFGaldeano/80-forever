# Feature: VOD recording local workflow

## Objetivo

Definir y documentar el flujo local para grabar transmisiones de 80 Forever desde OBS mientras se emite en vivo, dejando los archivos listos para convertirse luego en videos on-demand de emisiones pasadas.

Esta feature no toca base de datos, no cambia UI y no modifica el player. Es una base operativa para el futuro módulo VOD.

## Decisión principal

La grabación inicial se hace desde OBS en formato `mkv` para reducir riesgo de pérdida si la transmisión o la PC se cortan. Luego se remuxea a `mp4` sin recodificar cuando los codecs son compatibles.

```txt
OBS transmite en vivo
+
OBS graba MKV local
+
Remux MKV -> MP4
+
Opcional: MP4 -> HLS VOD
+
Futuro: registrar en admin como emisión pasada
```

## Estructura local recomendada

```txt
E:\80's Forever\media\recordings\raw
E:\80's Forever\media\recordings\processed
E:\80's Forever\media\vod
E:\80's Forever\media\thumbnails
```

## Archivos agregados

- `docs/OBS_RECORDING_LOCAL_WORKFLOW.md`
- `docs/FEATURE_VOD_RECORDING_LOCAL_WORKFLOW.md`
- `scripts/vod/prepare-vod-local-folders.ps1`
- `scripts/vod/remux-obs-recording.ps1`
- `scripts/vod/create-vod-hls.ps1`
- `scripts/vod/generate-vod-thumbnail.ps1`

## Validación esperada

```bash
npm run build
```

También validar en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\vod\prepare-vod-local-folders.ps1
```

Si `ffmpeg` está instalado:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\vod\remux-obs-recording.ps1 -InputPath "E:\80's Forever\media\recordings\raw\archivo.mkv"
```

## Futuras features relacionadas

- `feature/vod-assets-db-foundation`
- `feature/admin-vod-library-foundation`
- `feature/public-vod-past-transmissions-player`
- `feature/vod-player-analytics`
