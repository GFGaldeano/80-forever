# Feature: Self-hosted HLS player foundation

## Objetivo

Agregar el primer reproductor real para señales self-hosted HLS en 80 Forever.

Esta feature consume `stream_config.source_url` cuando `provider = self_hosted_hls` y mantiene `stream_config.embed_url` como fallback YouTube/iframe si la señal HLS falla.

## Alcance

- Agrega componente `HlsStreamPlayer`.
- Usa `hls.js` mediante import dinámico en cliente.
- Soporta reproducción HLS nativa cuando el navegador la permite.
- Usa MediaSource Extensions vía `hls.js` cuando el navegador no reproduce HLS de forma nativa.
- Muestra fallback YouTube si HLS falla y existe `embed_url`.
- Mantiene la estética visual actual del player público.
- No toca base de datos.
- No toca on-demand.

## Dependencia requerida

Antes de validar build, instalar:

```bash
npm install hls.js
```

Esto actualizará `package.json` y `package-lock.json`.

## Flujo de reproducción

```txt
provider = self_hosted_hls
status = live | replay
source_url = URL .m3u8
```

Resultado:

```txt
PublicStreamPlayer -> HlsStreamPlayer -> source_url
```

Si falla HLS y hay fallback:

```txt
embed_url -> iframe fallback YouTube
```

## Validación esperada

```bash
npm install hls.js
npm run build
npm run dev
```

Pruebas funcionales contra DB remota:

- `/admin/stream`: provider `Self-hosted HLS`.
- `source_url`: manifiesto `.m3u8`.
- `embed_url`: YouTube fallback.
- Home pública `/` o `/es`: el player intenta reproducir HLS.
- Si HLS falla, muestra fallback si existe embed.
