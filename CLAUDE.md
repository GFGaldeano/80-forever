@AGENTS.md

---

## `CLAUDE.md`


# CLAUDE.md

## Propósito

Este archivo resume el contexto operativo que un agente como Claude debe entender antes de modificar el proyecto **80's Forever**.

El objetivo es evitar respuestas genéricas, cambios desalineados con el producto o decisiones técnicas que contradigan la documentación base.

---

## Qué es 80's Forever

80's Forever es una plataforma web de streaming musical ochentoso con:

- home pública con player central
- identidad visual dark / neon / synthwave premium
- sponsors dinámicos
- panel admin
- blog y formularios de interacción

No es una simple landing con un iframe.  
Debe sentirse como una **señal digital temática**.

---

## Principio rector del producto

**El streaming es el protagonista.**

Todo lo demás debe reforzar esa experiencia:

- el branding
- los sponsors
- la interfaz
- los formularios
- el panel admin

Nunca deben competir por encima del player.

---

## Stack principal

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase
- PostgreSQL
- Cloudinary

---

## Arquitectura general

### Sitio público
Orientado a experiencia:
- home
- stream
- sponsors
- pedidos musicales
- blog
- contacto

### Panel admin
Orientado a operación:
- login
- dashboard
- transmisión
- sponsors
- assets
- pedidos
- blog
- configuración

---

## Reglas de diseño

- estética retro-premium, no kitsch
- neón contenido, no excesivo
- layout aireado
- dark mode como base natural
- glow solo en focos clave:
  - logo
  - badge LIVE
  - CTA principal
  - borde o contexto del player

---

## Reglas técnicas

- TypeScript claro y tipado
- componentes reutilizables antes que lógica dispersa
- separar UI de lógica de negocio
- contemplar loading / empty / error states
- priorizar soft delete / soft visibility:
  - `is_active`
  - `is_visible`
  - `status`
- no exponer `service_role` al frontend
- no romper RLS ni simplificarlo por comodidad

---

## Decisiones de producto ya tomadas

- fuente principal de stream: YouTube Live embebido
- producción: OBS Studio
- assets visuales: Cloudinary
- sponsors arriba y abajo del player en el MVP
- blog y pedidos musicales incluidos en MVP
- chat en vivo propio fuera del MVP
- programación avanzada fuera del MVP inicial

---

## Estilo esperado de implementación

Claude debe producir cambios:

- claros
- profesionales
- escalables
- coherentes con la documentación
- fáciles de revisar

Evitar:
- overengineering
- abstracciones innecesarias
- cambios masivos sin necesidad
- dependencias extra sin justificar
- romper la estructura del proyecto por resolver algo pequeño

---

## Antes de modificar algo importante

Claude debe revisar, en este orden:

1. `docs/CONTEXT.md`
2. `docs/REQUIREMENTS.md`
3. `docs/SKILLS.md`
4. `AGENTS.md`
5. estructura actual del código
6. esquema de base de datos / Supabase

---

## Convenciones operativas

### Base de datos
- usar UUID
- usar `created_at` / `updated_at`
- mantener constraints y estados controlados
- preferir migraciones claras sobre cambios sueltos

### Frontend
- usar componentes del design system
- mantener consistencia visual
- no mezclar estilos arbitrarios por componente
- respetar jerarquía visual del home y del admin

### Admin
- sobrio
- rápido de escanear
- operativo
- menos espectáculo visual que el sitio público

---

## Qué tipo de ayuda se espera de Claude

- implementación de componentes
- generación de SQL
- formularios y validaciones
- integración con Supabase
- mejoras de UX
- refactor puntual
- revisión de arquitectura
- documentación técnica
- tests básicos o hardening posterior

---

## Qué no debe asumir Claude

- que puede inventar nuevas features sin validación
- que el MVP incluye chat en tiempo real
- que puede reemplazar YouTube Live por otra solución sin consulta
- que puede borrar constraints o RLS por conveniencia
- que puede meter pagos o multi-tenant comercial en esta fase

---

## Definición de “done”

Una tarea está bien resuelta cuando:

- funciona
- respeta el diseño y el alcance
- tiene estados básicos contemplados
- es legible
- no rompe otras capas del sistema
- deja el proyecto mejor de lo que estaba

---

## Nota final

Si una decisión entra en conflicto entre:
- rapidez de implementación
- claridad operativa
- experiencia del usuario

priorizar en este orden:

1. claridad operativa
2. experiencia del usuario
3. velocidad de implementación