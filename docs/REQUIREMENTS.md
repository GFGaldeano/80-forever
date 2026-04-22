# REQUIREMENTS.md

## Objetivo

Este documento fija los requerimientos funcionales y de alcance del MVP de **80's Forever**.

Su función es evitar ambigüedad durante desarrollo y mantener el foco en la versión 1.

---

## 1. Requerimientos funcionales del MVP

### 1.1 Sitio público

#### Home
Debe incluir:
- logo y branding
- slogan
- estado del canal
- player central
- carrusel superior de sponsors
- carrusel inferior de sponsors
- CTA a pedido musical
- bloque de destacado editorial
- bloque de posts recientes
- footer

#### Stream
El sistema debe soportar:
- `live`
- `offline`
- `upcoming`
- `replay`
- fallback visual si no hay transmisión válida

#### Sponsors
La home debe poder renderizar:
- banners activos
- banners visibles
- banners vigentes por fecha
- placements `top`, `bottom` o `both`

#### Pedidos musicales
El público debe poder enviar:
- nombre o alias
- canción
- artista
- mensaje opcional
- red social opcional

#### Contacto
El sistema debe admitir mensajes:
- generales
- comerciales

#### Blog
Debe existir:
- listado de posts
- categorías
- post individual
- posts destacados para home

---

### 1.2 Panel admin

#### Login
Debe existir autenticación para usuarios internos válidos.

#### Dashboard
Debe mostrar al menos:
- estado del stream
- sponsors activos
- pedidos pendientes
- posts publicados

#### Gestión de transmisión
Debe permitir:
- definir proveedor
- cargar `source_url`
- cargar `embed_url`
- definir `status`
- definir `title`
- definir `subtitle`
- definir `offline_message`
- definir `next_live_at`

#### Gestión de sponsors
Debe permitir:
- alta
- edición
- visibilidad
- activación/desactivación

#### Gestión de assets
Debe permitir:
- subir imagen o GIF
- asociar a sponsor
- definir placement
- definir prioridad
- definir duración
- definir fechas
- mostrar / ocultar
- activar / desactivar

#### Pedidos musicales
Debe permitir:
- listar
- ver detalle
- marcar como leído
- destacar
- aprobar
- archivar

#### Blog
Debe permitir:
- crear post
- editar post
- guardar borrador
- publicar
- archivar
- destacar

#### Settings
Debe permitir:
- actualizar nombre del sitio
- actualizar slogan
- actualizar links sociales
- actualizar mensaje offline
- actualizar CTA principal

---

## 2. Requerimientos no funcionales

### Diseño
- interfaz dark premium
- neon controlado
- alta legibilidad
- consistencia visual entre público y admin

### Operación
- panel rápido de usar
- tareas frecuentes en pocos pasos
- foco en claridad

### Performance
- banners optimizados
- player estable
- imágenes comprimidas y bien entregadas
- comportamiento responsive

### Seguridad
- auth en admin
- RLS en tablas de negocio
- `service_role` fuera del frontend
- acceso público limitado solo a lo necesario

### Mantenibilidad
- componentes reutilizables
- TypeScript
- separación clara entre UI y lógica
- documentación viva

---

## 3. Alcance congelado del MVP

### Sí entra
- home pública
- player central
- sponsors dinámicos
- panel admin
- pedidos musicales
- blog básico
- contacto
- configuración general

### No entra
- chat en vivo propio
- comentarios en tiempo real
- votaciones
- ranking de temas
- pagos integrados
- analítica avanzada
- automatizaciones complejas
- campañas comerciales avanzadas
- programación editorial compleja
- permisos granulares sofisticados

---

## 4. Criterio de éxito del MVP

El MVP se considera listo cuando:

- el admin puede iniciar sesión
- el admin puede configurar el stream
- la home refleja esa configuración
- el admin puede gestionar sponsors y banners
- los banners aparecen correctamente en la home
- el público puede enviar pedidos musicales
- el admin puede revisar esos pedidos
- el admin puede publicar posts
- el sitio funciona correctamente en desktop y mobile

---

## 5. Restricciones técnicas actuales

- fuente principal de distribución: YouTube Live embebido
- producción externa mediante OBS Studio
- assets gestionados en Cloudinary
- base de datos y auth en Supabase
- frontend en Next.js + TypeScript