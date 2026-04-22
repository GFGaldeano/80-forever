# AGENTS.md

## Misión

Este proyecto debe evolucionar como un producto real, no como una demo improvisada.

Cualquier agente que trabaje sobre **80's Forever** debe ayudar a construir:

- una experiencia pública sólida
- una consola admin simple y efectiva
- una base técnica escalable
- una documentación viva alineada con el código

---

## Contexto del proyecto

80's Forever es una plataforma web de streaming musical ochentoso con identidad visual neón y sponsors dinámicos.

La idea central es:

- producir contenido musical en OBS
- distribuir vía YouTube Live
- presentar la señal dentro de una web propia
- monetizar con sponsors
- operar todo desde un panel admin

---

## Reglas globales para agentes

### 1. Respetar el alcance del MVP
No agregar features no aprobadas.
No ampliar el scope sin necesidad.

### 2. Mantener la separación de capas
- público = experiencia
- admin = operación

### 3. No romper la jerarquía del producto
El player es el núcleo del sitio público.

### 4. No comprometer seguridad
- no exponer `service_role`
- no debilitar RLS
- no asumir permisos que no existen

### 5. Favorecer mantenibilidad
- código claro
- nombres consistentes
- componentes reutilizables
- cambios pequeños y bien delimitados

---

## Principios técnicos

- TypeScript estricto
- server/client boundaries claras
- validación de inputs
- manejo de estados vacíos y errores
- preferencia por migraciones explícitas
- soft visibility / soft state antes que delete físico

---

## Principios visuales

- dark premium
- neon controlado
- synthwave refinado
- branding consistente
- dashboard sobrio
- home con protagonismo del stream

---

## Flujo esperado de trabajo

Cuando un agente reciba una tarea debe:

1. entender qué módulo toca
2. revisar si afecta público, admin o ambos
3. revisar si impacta DB, Supabase o RLS
4. implementar la solución más clara posible
5. documentar brevemente decisiones si son relevantes

---

## Orden de lectura recomendado

Antes de cambios importantes:
1. `README.md`
2. `docs/CONTEXT.md`
3. `docs/REQUIREMENTS.md`
4. `docs/SKILLS.md`
5. `CLAUDE.md`
6. esquema / migraciones / tipos

---

## Estilo de cambios esperado

### Bueno
- cambios acotados
- componentes bien nombrados
- lógica separada
- SQL consistente
- documentación actualizada cuando corresponde

### Malo
- meter todo en un archivo
- duplicar lógica
- cambiar naming sin necesidad
- mezclar UI con acceso a datos
- romper convenciones del proyecto

---

## Áreas principales del sistema

### Sitio público
- home
- player
- sponsors
- pedidos musicales
- blog
- contacto

### Admin
- auth
- dashboard
- stream config
- sponsors
- assets
- blog
- settings

### Infraestructura
- Supabase
- RLS
- migraciones
- Cloudinary
- variables de entorno

---

## Restricciones actuales del MVP

Fuera del alcance por ahora:

- chat propio en tiempo real
- votaciones
- ranking de canciones
- pagos integrados
- analítica avanzada
- permisos ultrafinos por rol
- automatizaciones complejas
- programación editorial avanzada

---

## Definición mínima de calidad

Un cambio es aceptable si:

- compila
- cumple el objetivo
- es coherente con la arquitectura
- mantiene seguridad
- respeta la experiencia del producto
- no introduce deuda innecesaria

---

## Nota operativa

Si una decisión no está clara, elegir la opción que:
- simplifique la operación admin
- mantenga integridad del producto
- evite reescrituras costosas más adelante