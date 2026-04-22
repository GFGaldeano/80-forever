<p align="center">
  <img
    src="https://res.cloudinary.com/dfoxsvhei/image/upload/v1776866586/80s-Forever-logo-21-9-aspect-ratio_qareil.png"
    alt="80's Forever"
    width="100%"
  />
</p>

<h1 align="center">80's Forever</h1>

<p align="center">
  <strong>La música que no tiene tiempo</strong>
</p>

<p align="center">
  Plataforma web de streaming musical ochentoso con identidad visual neón, sponsors dinámicos y panel de administración.
</p>

---

## Descripción

**80's Forever** es una plataforma web temática centrada en música de los 80, concebida como una **señal digital** y no como una simple página con un video embebido.

El sistema combina:

- una **home pública** con player central protagonista
- una identidad visual **dark / neon / synthwave premium**
- **banners de sponsors** dinámicos arriba y abajo del player
- un **panel administrativo** para operar el canal
- una base preparada para crecer hacia contenido editorial, comunidad y programación temática

La lógica del producto es clara:

- **OBS Studio** produce
- **YouTube Live** distribuye
- la **web presenta, organiza y monetiza**

---

## Objetivo del MVP

La primera versión del sistema busca resolver, de forma elegante y operativa, lo siguiente:

- mostrar la transmisión en la home pública
- cambiar el estado del canal desde el panel admin
- cargar y gestionar sponsors / banners
- recibir pedidos musicales
- publicar contenido editorial básico
- dejar una base técnica escalable para futuras fases

---

## Alcance del MVP

### Sitio público
- Home principal
- Player central con estados (`live`, `offline`, `upcoming`, `replay`)
- Carrusel superior e inferior de sponsors
- CTA “Pedí tu tema”
- Blog / novedades
- Contacto comercial / institucional

### Panel admin
- Login
- Dashboard inicial
- Gestión de transmisión
- Gestión de sponsors
- Gestión de assets / banners
- Gestión de pedidos musicales
- Gestión de blog
- Configuración general del sitio

---

## Stack tecnológico

### Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion**

### Backend / datos
- **Supabase**
  - PostgreSQL
  - Auth
  - Row Level Security
- **Cloudinary** para assets visuales

### Producción y distribución
- **OBS Studio**
- **YouTube Live** embebido como fuente principal del player

---

## Principios del producto

- **Player first**: el streaming es el protagonista
- **Neón contenido**: brillo con criterio, no ruido visual
- **Retro premium**: referencia ochentosa con estética sofisticada
- **Operación simple**: el admin debe permitir salir al aire rápido
- **Escalabilidad real**: la base del sistema debe servir para crecer sin rehacer todo

---

## Arquitectura general

El sistema se organiza en dos capas:

### 1. Sitio público
Pensado para audiencia, branding, visualización y experiencia.

Incluye:
- identidad de marca
- player central
- sponsors dinámicos
- CTA a interacción
- contenido editorial

### 2. Panel privado de administración
Pensado para operación del canal.

Incluye:
- control de stream
- alta y edición de sponsors
- carga de banners / GIFs
- gestión de pedidos musicales
- blog y configuración general

---

## Estructura sugerida del proyecto

```txt
src/
  app/
    (public)/
    admin/
    api/
  components/
    admin/
    branding/
    content/
    feedback/
    forms/
    layout/
    sponsors/
    streaming/
    ui/
  lib/
    config/
    constants/
    supabase/
    validators/
  services/
  types/

supabase/
  migrations/
  seeds/

docs/
  CONTEXT.md
  REQUIREMENTS.md
  SKILLS.md