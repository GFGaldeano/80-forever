# Supabase local migrations - 80 Forever

## Objetivo

Esta guía deja preparado el flujo seguro para trabajar cambios de base de datos en 80 Forever:

```txt
migración SQL → prueba local con Docker/Supabase CLI → validación → aplicación remota
```

No se debe aplicar una migración directamente al proyecto remoto sin validar primero en local.

---

## Forma de trabajo en este proyecto

En 80 Forever:

```txt
Git, npm, Supabase y validaciones → Bash desde VS Code
PowerShell → solo para scripts auxiliares de ZIP/compresión
```

---

## Por qué existe esta feature

El repositorio recibido desde la rama `feature/supabase-cli-local-migrations-foundation` ya tenía migraciones en `supabase/migrations`, pero empezaban en `005_*`.

Eso implica que faltaban migraciones iniciales necesarias para reconstruir la base desde cero. Por ejemplo, `005_contact_messages_expand_types.sql` espera que `public.contact_messages` ya exista.

Esta feature agrega:

```txt
supabase/config.toml
supabase/seed.sql
supabase/migrations/001_public_schema_baseline.sql
.env.local.example
scripts npm para Supabase CLI
```

La baseline reconstruye las tablas base previas a las migraciones 005..018 sin incluir datos reales de producción.

---

## Puertos locales

Para evitar choques con otros proyectos Supabase locales, 80 Forever usa puertos 553xx:

| Servicio | URL / puerto |
|---|---|
| API | http://127.0.0.1:55321 |
| DB | postgresql://postgres:postgres@127.0.0.1:55322/postgres |
| Studio | http://127.0.0.1:55323 |
| Inbucket | http://127.0.0.1:55324 |
| Shadow DB | 55320 |
| Pooler | 55329 |
| Analytics | 55327 |

---

## Requisitos

```txt
Docker Desktop activo
Node.js instalado
Git instalado
Supabase CLI disponible vía npx o global
```

Validar Docker desde Bash:

```bash
docker version
docker ps
```

Validar Supabase CLI:

```bash
npx supabase --version
```

---

## Primer arranque local

Desde la raíz del repo, en Bash:

```bash
npm run supabase:start
```

Luego revisar credenciales locales:

```bash
npm run supabase:status
```

Copiar `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Completar en `.env.local`:

```txt
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key local>
SUPABASE_SERVICE_ROLE_KEY=<service role key local>
```

---

## Reset local completo

Cada vez que se quiera validar desde cero:

```bash
npm run supabase:reset
```

Esto ejecuta:

```txt
001_public_schema_baseline.sql
005_contact_messages_expand_types.sql
006_contact_messages_public_insert_policy.sql
...
018_public_translation_foundation.sql
seed.sql
```

---

## Validaciones SQL recomendadas

Después de `npm run supabase:reset`, entrar a Studio:

```txt
http://127.0.0.1:55323
```

Validar tablas principales:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Validar stream activo:

```sql
select provider, status, title, is_active
from public.stream_config;
```

Validar traducciones base:

```sql
select locale, title, offline_message
from public.stream_config_translations
order by locale;
```

Validar RLS:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

---

## Flujo para una migración nueva

Crear rama desde Bash:

```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-feature
```

Crear migración:

```bash
npx supabase migration new nombre_migracion
```

Editar el SQL generado en:

```txt
supabase/migrations/YYYYMMDDHHMMSS_nombre_migracion.sql
```

Validar local:

```bash
npm run supabase:reset
npm run build
```

Solo si todo está OK, linkear y aplicar remoto:

```bash
npm run supabase:link -- --project-ref TU_PROJECT_REF
npm run supabase:push
```

---

## Si `supabase start` falla por Docker/Storage

Probar limpieza local desde Bash:

```bash
npx supabase stop --all
rm -rf supabase/.temp
npm run supabase:start
```

Si el stack completo falla pero solo necesitás validar DB:

```bash
npx supabase db start
npx supabase db reset
```

Luego volver a linkear remoto si `.temp` fue eliminado:

```bash
npm run supabase:link -- --project-ref TU_PROJECT_REF
```

---

## Reglas de seguridad

- No commitear `.env.local`.
- No commitear dumps con datos reales.
- No commitear service role keys.
- No aplicar remoto sin `db reset` local exitoso.
- No modificar producción desde Studio sin migración versionada.
- No inventar contenido ES/EN en DB: las traducciones deben ser controladas.

---

## Relación con streaming/on-demand

Esta feature no implementa streaming.

Su función es dejar la base preparada para que próximas features puedan agregar de forma segura:

```txt
self_hosted_hls
youtube fallback
on-demand propio
metadata de media propia
```

## Hotfix v3 - Cloudinary en build local

Si copiaste `.env.local.example` a `.env.local`, asegurate de que las variables de Cloudinary no queden vacias. Algunas rutas API importan Cloudinary durante `next build`, por lo que el build puede fallar si estas variables estan vacias.

Para validacion local sin subir archivos reales, podes usar placeholders no vacios:

```env
CLOUDINARY_CLOUD_NAME=local-placeholder
CLOUDINARY_API_KEY=local-placeholder
CLOUDINARY_API_SECRET=local-placeholder
```

Para pruebas reales de upload en el admin, reemplazalos por credenciales validas de Cloudinary.

## Hotfix v4 - Orden de funciones y policies de admin_users

La baseline debe crear `public.is_active_admin()` y `public.current_admin_user_id()` despues de crear `public.admin_users`, pero antes de crear cualquier policy que invoque esas funciones.

Orden correcto:
1. Crear tabla `public.admin_users`.
2. Crear funciones dependientes de `public.admin_users`.
3. Crear policies de `public.admin_users`.
4. Continuar con el resto del schema.

## Hotfix v5 - `site_settings.id` para traducciones

La migracion `018_public_translation_foundation.sql` crea `public.site_settings_translations` con una FK hacia `public.site_settings(id)`.

Como el repo historico no incluye todas las migraciones iniciales, la baseline local debe reconstruir `public.site_settings` con columna `id uuid primary key` antes de ejecutar la migracion 015/018.

Esto evita el error:

```txt
ERROR: column "id" referenced in foreign key constraint does not exist
references public.site_settings(id)
```

## Hotfix v6 - Columnas heredadas de `site_settings`

La migracion `018_public_translation_foundation.sql` hace backfill desde `public.site_settings` hacia `public.site_settings_translations` leyendo estas columnas:

- `site_name`
- `tagline`
- `default_offline_message`
- `primary_cta_label`

Como el set historico de migraciones del repo no incluye todas las migraciones iniciales, la baseline local debe reconstruir tambien esas columnas para que el backfill ES/EN pueda ejecutarse.

## Hotfix v7 - Fallback DB-only para Windows / Storage unhealthy

En Windows puede ocurrir que `npx supabase start` aplique correctamente todas las migraciones, pero luego falle el health check de Storage:

```txt
supabase_storage_80-forever container is not ready: unhealthy
```

Para validar migraciones locales no es obligatorio levantar todo el stack. En ese caso, usar modo DB-only:

```bash
npx supabase stop --all
rm -rf supabase/.temp

npm run supabase:db:start
npm run supabase:db:reset
npm run build
```

Este flujo permite validar schema/migraciones con PostgreSQL local sin depender de Storage, Studio, Auth o API Gateway.

Cuando se necesite probar funcionalidades de Storage/upload, se revisa el stack completo por separado.

