# Feature: Supabase CLI local migrations foundation

## Rama

```txt
feature/supabase-cli-local-migrations-foundation
```

## Alcance

Esta feature prepara 80 Forever para trabajar migraciones de base de datos con Supabase CLI y Docker local antes de aplicar cambios remotos.

## Cambios incluidos

```txt
package.json
.env.local.example
supabase/config.toml
supabase/seed.sql
supabase/migrations/001_public_schema_baseline.sql
docs/DB_OPERATIONS.md
docs/SUPABASE_LOCAL_MIGRATIONS.md
```

## No incluido

```txt
- No implementa streaming.
- No agrega self_hosted_hls todavía.
- No modifica estética.
- No cambia componentes públicos/admin.
- No toca datos reales de producción.
```

## Validación esperada en Bash

```bash
npm install
npm run supabase:start
npm run supabase:status
npm run supabase:reset
npm run build
```

## Resultado esperado

La base local debe reconstruirse desde cero usando:

```txt
001_public_schema_baseline.sql
005..018 migraciones existentes
seed.sql
```
