# DB_OPERATIONS.md

## Propósito

Este documento define la política operativa para:

- migraciones de base de datos
- backups
- restore
- rollback
- seeds
- despliegues relacionados a Supabase/PostgreSQL

Su objetivo es evitar cambios improvisados, reducir riesgo de rotura y mantener trazabilidad del esquema del proyecto **80's Forever**.

---

## 1. Principios rectores

### 1.1 Migraciones primero
Todo cambio estructural en base de datos debe quedar versionado como migración SQL.

No se deben hacer cambios importantes solo desde interfaces visuales si luego no quedan reflejados en archivos versionados.

### 1.2 Backups antes de tocar producción
Antes de aplicar cambios relevantes en producción, debe existir un punto claro de recuperación.

### 1.3 Cambios pequeños y reversibles
Las migraciones deben ser:
- atómicas
- legibles
- focalizadas
- fáciles de auditar

### 1.4 Soft actions antes que delete físico
Siempre que tenga sentido de producto, priorizar:
- `is_active`
- `is_visible`
- `status`

antes que borrado físico.

### 1.5 Producción no es laboratorio
Primero se prueba localmente y luego en entorno real.

---

## 2. Estructura de carpetas recomendada

```txt
supabase/
  migrations/
    001_80s_forever_mvp_schema.sql
    002_80s_forever_seed_base.sql
    003_80s_forever_rls.sql
    004_80s_forever_phase2_schema.sql
  seeds/
    bootstrap_first_admin.sql