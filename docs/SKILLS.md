# SKILLS.md

## Propósito

Este documento define las capacidades operativas y técnicas que deben aplicarse al proyecto **80's Forever** durante su desarrollo.

No describe “skills” humanas abstractas, sino **áreas de trabajo y criterios de ejecución** para agentes o colaboradores técnicos.

---

## Skill 1 — Product understanding

### El agente debe saber identificar:
- qué es núcleo del producto
- qué es soporte
- qué está dentro del MVP
- qué queda fuera

### Núcleo
- player
- estado del canal
- sponsors
- admin operativo

### Soporte
- blog
- contacto
- pedidos musicales
- contenido editorial

---

## Skill 2 — Public shell implementation

### Debe poder construir:
- header público
- hero de estado
- shell del player
- carruseles de sponsors
- CTA editoriales
- footer

### Debe respetar:
- player first
- responsive real
- jerarquía visual
- identidad dark / neon premium

---

## Skill 3 — Admin shell implementation

### Debe poder construir:
- login
- sidebar
- topbar
- dashboard
- tablas
- formularios admin
- estados operativos

### Debe priorizar:
- claridad
- velocidad de uso
- navegación simple
- consistencia visual

---

## Skill 4 — Supabase integration

### Debe poder resolver:
- conexión cliente / servidor
- lectura de tablas públicas
- operaciones protegidas de admin
- tipado de DB
- autenticación
- RLS

### Reglas críticas
- nunca exponer `service_role`
- respetar policies
- no simplificar seguridad para “hacer que funcione”
- usar tipos claros

---

## Skill 5 — Database-aware development

### Debe comprender:
- entidades del MVP
- relaciones principales
- estados de negocio
- soft flags
- restricciones de visibilidad

### Debe respetar:
- UUID
- `created_at`
- `updated_at`
- slugs únicos
- constraints de estado
- vigencia de assets por fechas

---

## Skill 6 — Forms and validation

### Debe saber construir:
- formularios públicos
- formularios admin
- validación con Zod
- mensajes de error claros
- feedback de éxito
- manejo de estados submit / loading

### Casos clave
- login
- stream config
- sponsor form
- asset form
- song request form
- contact form
- blog post form

---

## Skill 7 — Component-driven implementation

### Debe construir primero:
- componentes base
- variantes
- estados
- contratos mínimos

### Antes de armar pantallas
Todo componente debería contemplar:
- loading
- empty
- error
- disabled cuando aplique

---

## Skill 8 — Visual consistency

### Debe respetar:
- tokens
- spacing
- tipografía
- glow controlado
- colores semánticos
- diferencia entre público y admin

### No debe hacer
- estilos ad hoc por componente
- colores fuera del sistema
- efectos exagerados
- mezclas visuales incoherentes

---

## Skill 9 — Roadmap awareness

### Debe saber en qué sprint cae cada cosa

#### Sprint 0
setup y entorno

#### Sprint 1
shell público base

#### Sprint 2
player y estados

#### Sprint 3
sponsors

#### Sprint 4
admin base

#### Sprint 5
stream config real

#### Sprint 6
sponsors + assets reales

#### Sprint 7
pedidos + contacto

#### Sprint 8
blog + hardening

---

## Skill 10 — Change discipline

### Antes de proponer cambios importantes
revisar:
1. alcance del MVP
2. impacto en DB
3. impacto en RLS
4. impacto en UI pública
5. impacto en admin

### Antes de cerrar una tarea
confirmar:
- compila
- cumple objetivo
- no rompe flujo existente
- respeta arquitectura
- respeta naming
- respeta experiencia del producto

---

## Skill 11 — Documentation continuity

### Toda implementación importante debe mantener alineado:
- README
- docs de contexto
- requerimientos
- migraciones
- contratos de datos si cambian

No hace falta documentar todo, pero sí cualquier cambio estructural o decisivo.

---

## Skill 12 — MVP discipline

Este proyecto no necesita soluciones grandilocuentes.

Necesita:
- claridad
- foco
- consistencia
- ejecución incremental
- una base sólida para crecer

Ese criterio debe dominar cada decisión técnica.