# 80 Forever — Feature: Live autoplay + fallback listener

## Rama sugerida

`feature/live-autoplay-fallback-listener`

## Objetivo

Mejorar la experiencia del player público para que la audiencia no tenga que tocar Play cuando hay transmisión en vivo propia por HLS.

Comportamiento esperado:

- Si hay transmisión en vivo Self-hosted HLS, cargar el player HLS y comenzar reproducción automática en modo silenciado.
- Mostrar una llamada visible para que la audiencia toque **Activar sonido**.
- Si no hay vivo disponible, mostrar el video embebido de YouTube configurado como fallback.
- Si el usuario está mirando YouTube y comienza el vivo, detectar el cambio con polling público y cambiar automáticamente al HLS.
- Si el HLS cae o no responde, volver al fallback embebido cuando exista.

## Cambios técnicos

### API pública de estado

Se agregó:

`GET /api/stream/status?locale=es|en`

Devuelve:

```json
{
  "stream": {},
  "checked_at": "2026-06-21T00:00:00.000Z"
}
```

La ruta reutiliza `getPublicStreamConfig(locale)` y responde con `Cache-Control: no-store` para que el cliente pueda consultar cambios de estado del vivo.

### Listener en player público

`PublicStreamPlayer` ahora mantiene estado cliente del stream y consulta `/api/stream/status` cada 10 segundos.

Cuando cambia la firma pública del stream (`provider`, `status`, `source_url`, `embed_url`, `updated_at`), el componente actualiza el player sin recargar la página.

### Verificación de manifiesto HLS

Cuando el estado público indica Self-hosted HLS en `live` o `replay`, el navegador intenta verificar el `.m3u8` con `fetch` y timeout corto.

Esto permite detectar si la señal propia está caída y usar el fallback embebido cuando exista.

### Autoplay seguro

`HlsStreamPlayer` ahora:

- configura el video con `autoPlay`, `muted`, `playsInline` y `preload="auto"`;
- llama a `video.play()` al cargar metadata/manifiesto;
- arranca silenciado para respetar políticas de navegadores;
- muestra botón **Activar sonido**;
- muestra copy ES/EN para explicar la política de audio;
- registra eventos analytics de autoplay, audio habilitado, mute y fallback.

## Copy público

ES:

> La transmisión en vivo comienza automáticamente. Por políticas del navegador, el sonido puede iniciar silenciado. Tocá Activar sonido para escuchar.

EN:

> The live stream starts automatically. Due to browser policies, audio may start muted. Tap Enable sound to listen.

## Notas operativas

El flujo recomendado de salida al aire queda:

1. MediaMTX corriendo en el servidor.
2. OBS empieza a enviar señal al path `80forever`.
3. El admin activa estado `En vivo`.
4. El sitio detecta el cambio y pasa automáticamente al HLS.
5. La audiencia toca **Activar sonido** para escuchar.

Si no hay vivo, o si el HLS no responde, el sitio conserva el fallback YouTube configurado.

## Validación sugerida

1. Ejecutar `npm run lint`.
2. Ejecutar `npx tsc --noEmit`.
3. Configurar en admin:
   - Provider: `Self-hosted HLS`
   - Status: `Offline`
   - Fallback embed YouTube válido
4. Abrir home pública y confirmar fallback YouTube.
5. Cambiar status a `Live` con HLS válido.
6. Confirmar que el player cambia a HLS automáticamente.
7. Confirmar autoplay muted y botón **Activar sonido**.
8. Detener OBS y confirmar fallback si el HLS deja de responder.
