# 80 Forever - OBS recording local workflow

## Objetivo

Grabar cada transmisión de 80 Forever mientras se emite en vivo, para que esa grabación pueda transformarse luego en video on-demand de emisiones pasadas.

## Principio operativo

OBS será la fuente inicial de grabación. MediaMTX se usa para la transmisión HLS/RTMP, pero la grabación local queda controlada desde OBS para esta primera etapa.

```txt
OBS -> transmite a MediaMTX
OBS -> graba archivo local
Archivo local -> remux/procesamiento
Archivo procesado -> futuro VOD
```

## Carpetas locales recomendadas

Crear una estructura separada del repositorio:

```txt
E:\80's Forever\media\recordings\raw
E:\80's Forever\media\recordings\processed
E:\80's Forever\media\vod
E:\80's Forever\media\thumbnails
```

Usar el script:

```powershell
cd "E:\80's Forever\80-forever"

powershell -ExecutionPolicy Bypass -File .\scripts\vod\prepare-vod-local-folders.ps1
```

## Configuración recomendada de OBS

### Settings -> Output

Cambiar a modo avanzado:

```txt
Output Mode: Advanced
```

### Streaming

Mantener la configuración usada para MediaMTX local:

```txt
Server: rtmp://localhost:1935
Stream Key: 80forever
```

### Recording

Recomendado:

```txt
Recording Path:
E:\80's Forever\media\recordings\raw

Recording Format:
mkv

Encoder:
Same as stream o encoder disponible

Audio Track:
1
```

### Video

Para MVP local estable:

```txt
Base Canvas: 1920x1080
Output Scaled: 1280x720
FPS: 30
```

### Audio

```txt
Sample Rate: 48 kHz
Channels: Stereo
Audio Bitrate: 160 Kbps
```

## Convención de nombres

Usar nombres sin espacios raros, acentos ni caracteres problemáticos.

Formato sugerido:

```txt
80forever_YYYY-MM-DD_HH-mm_titulo-emision.mkv
```

Ejemplo:

```txt
80forever_2026-06-20_22-00_bloque-synth-pop.mkv
```

## Flujo de transmisión + grabación

1. Levantar MediaMTX local.
2. Abrir OBS.
3. Verificar que OBS tenga configurado `Start Streaming` hacia MediaMTX.
4. Verificar que OBS grabe en `recordings/raw`.
5. Iniciar transmisión.
6. Iniciar grabación si no se activa automáticamente.
7. Validar que 80 Forever local muestra el vivo.
8. Finalizar transmisión.
9. Finalizar grabación.
10. Procesar archivo.

## Remux MKV a MP4

La primera conversión recomendada es remux, no transcodificación. Remux cambia el contenedor sin recodificar video/audio, por lo tanto es rápido y no pierde calidad.

Requiere `ffmpeg` instalado.

```powershell
cd "E:\80's Forever\80-forever"

powershell -ExecutionPolicy Bypass -File .\scripts\vod\remux-obs-recording.ps1 `
  -InputPath "E:\80's Forever\media\recordings\raw\80forever_2026-06-20_22-00_bloque-synth-pop.mkv"
```

Salida esperada:

```txt
E:\80's Forever\media\recordings\processed\80forever_2026-06-20_22-00_bloque-synth-pop.mp4
```

## Crear HLS VOD opcional

Para video on-demand futuro con streaming por segmentos:

```powershell
cd "E:\80's Forever\80-forever"

powershell -ExecutionPolicy Bypass -File .\scripts\vod\create-vod-hls.ps1 `
  -InputPath "E:\80's Forever\media\recordings\processed\80forever_2026-06-20_22-00_bloque-synth-pop.mp4" `
  -Slug "80forever-2026-06-20-bloque-synth-pop"
```

Salida esperada:

```txt
E:\80's Forever\media\vod\80forever-2026-06-20-bloque-synth-pop\index.m3u8
```

## Generar thumbnail

```powershell
cd "E:\80's Forever\80-forever"

powershell -ExecutionPolicy Bypass -File .\scripts\vod\generate-vod-thumbnail.ps1 `
  -InputPath "E:\80's Forever\media\recordings\processed\80forever_2026-06-20_22-00_bloque-synth-pop.mp4" `
  -OutputPath "E:\80's Forever\media\thumbnails\80forever-2026-06-20-bloque-synth-pop.jpg" `
  -Timestamp "00:00:10"
```

## Decisiones importantes

- El archivo `raw` no se borra automáticamente.
- El MP4 procesado queda en `processed`.
- La versión HLS VOD queda en `vod/<slug>`.
- El thumbnail queda en `thumbnails`.
- El alta en admin queda para una feature futura.

## Futuro flujo completo

```txt
Grabación raw MKV
-> MP4 procesado
-> HLS VOD o MP4 público
-> thumbnail
-> registro DB
-> admin VOD
-> página pública de emisión pasada
```
