# Contexto Supabase MCP - Plataforma APM

Este archivo contiene toda la configuración del proyecto Supabase para usarlo con el MCP de Supabase en cualquier proyecto/instancia de Claude Code.

---

## Credenciales del Proyecto

```
Project Ref: ovflbrrnqgmooutlukyf
Region: (ver URL)
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://ovflbrrnqgmooutlukyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmxicnJucWdtb291dGx1a3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzk1NzUsImV4cCI6MjA4MzcxNTU3NX0.8Rd22mCnCigBpFCaKZmj2F2q2bwHdM9nutb1hUMqUKM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmxicnJucWdtb291dGx1a3lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzOTU3NSwiZXhwIjoyMDgzNzE1NTc1fQ.UQ06rWqNXBUt6ZcraTfuU7PblS6dzCqAzmslKsWSSNU
```

---

## Esquema de Base de Datos

### Tablas (schema: public)

#### 1. `users`
Perfiles de usuario vinculados a `auth.users`. Se crean automáticamente via trigger.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | FK → auth.users.id |
| email | text (unique) | |
| name | text | |
| role | text | CHECK: `ADMIN`, `CONSULTOR`, `CLIENTE` (default: `CLIENTE`) |
| status | text | CHECK: `ACTIVO`, `INACTIVO` (default: `ACTIVO`) |
| company_id | bigint (nullable) | FK → clients.id |
| signature_url | text (nullable) | URL de firma del consultor |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 2. `clients`
Empresas clientes.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | Auto-generado |
| company_name | text | |
| status | text | CHECK: `ACTIVO`, `INACTIVO` (default: `ACTIVO`) |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 3. `projects`
Proyectos de consultoría.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | Auto-generado |
| name | text | default: `'Proyecto sin nombre'` |
| client_id | bigint (nullable) | FK → clients.id |
| consultant_id | uuid | FK → users.id |
| start_date | timestamptz | |
| end_date | timestamptz | |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 4. `project_client_users`
Tabla pivote: qué usuarios-cliente pueden ver qué proyectos.

| Columna | Tipo | Notas |
|---------|------|-------|
| project_id | bigint (PK) | FK → projects.id |
| user_id | uuid (PK) | FK → users.id |

#### 5. `time_logs`
Jornadas de trabajo de consultores.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | |
| project_id | bigint | FK → projects.id |
| consultant_id | uuid | FK → users.id |
| date | date | |
| check_in_time | timestamptz | |
| check_out_time | timestamptz (nullable) | |
| modality | text | CHECK: `PRESENCIAL`, `REMOTO` |
| areas_visited | jsonb | default: `[]` |
| people_met | jsonb (nullable) | default: `[]` |
| evidence_urls | jsonb | default: `[]` |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 6. `goals`
Objetivos asignados a proyectos.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | |
| project_id | bigint | FK → projects.id |
| description | text | |
| type | text | CHECK: `SEMANAL`, `MENSUAL` |
| status | text | CHECK: `PENDIENTE`, `EN_PROCESO`, `REVISION`, `COMPLETADO` (default: `PENDIENTE`) |
| due_date | timestamptz (nullable) | |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 7. `activities`
Actividades del calendario vinculadas a proyectos.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | |
| project_id | bigint | FK → projects.id |
| title | text | |
| description | text (nullable) | |
| date | timestamptz | |
| emails | jsonb | default: `[]` |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 8. `prospects`
Pipeline CRM de prospectos.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | |
| company_name | text | |
| trade_name | text (nullable) | |
| industry | text (nullable) | |
| contact_name | text | |
| contact_role | text (nullable) | |
| phone | text (nullable) | |
| ruc | text (nullable) | |
| email | text (nullable) | |
| notes | text (nullable) | |
| first_contact_date | timestamptz | |
| last_interaction_date | timestamptz | |
| status | text | CHECK: `NUEVO`, `CONTACTADO`, `NEGOCIACION`, `CERRADO` (default: `NUEVO`) |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 9. `admin_notes`
Notas del admin y reportes de consultores (compartida).

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | |
| title | text | Valores especiales: `CONS_NOTE`, `CONS_REPORT` para notas de consultor |
| description | text (nullable) | Puede contener JSON stringificado con `consultantId` |
| date | timestamptz | |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 10. `social_contents`
Gestión de contenido de redes sociales.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | bigint (PK, identity) | |
| networks | jsonb | default: `[]` |
| content_type | text | |
| format | text | |
| publish_date | timestamptz | |
| status | text | CHECK: `PENDIENTE`, `EN_PROCESO`, `LANZADO` (default: `PENDIENTE`) |
| title | text (nullable) | |
| description | text (nullable) | |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

#### 11. `certificates`
Certificados de cursos generados por proyecto.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| project_id | bigint | FK → projects.id |
| course_title | text | |
| participant_name | text | |
| participant_code | text | |
| duration | text | |
| issue_date | date | |
| pdf_url | text (nullable) | |
| access_key | text | Clave para acceso público al certificado |
| created_at | timestamptz | default: CURRENT_TIMESTAMP |

#### 12. `consultant_signatures`
Firmas digitales de consultores.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | text (PK) | Mismo UUID del usuario como string |
| name | text | |
| signature_url | text | |
| created_at | timestamptz | default: CURRENT_TIMESTAMP |

---

## Relaciones (Foreign Keys)

```
auth.users.id        ← users.id
clients.id           ← users.company_id
clients.id           ← projects.client_id
users.id             ← projects.consultant_id
projects.id          ← project_client_users.project_id
users.id             ← project_client_users.user_id
projects.id          ← time_logs.project_id
users.id             ← time_logs.consultant_id
projects.id          ← goals.project_id
projects.id          ← activities.project_id
projects.id          ← certificates.project_id
```

---

## Funciones de Base de Datos

### `get_user_role()`
Retorna el rol del usuario autenticado actual.
```sql
SELECT role FROM public.users WHERE id = (SELECT auth.uid());
```

### `get_user_company_id()`
Retorna el `company_id` del usuario autenticado actual.
```sql
SELECT company_id FROM public.users WHERE id = (SELECT auth.uid());
```

### `handle_new_user()`
Trigger que crea automáticamente un perfil en `public.users` cuando se registra un usuario en `auth.users`.
```sql
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    'CLIENTE'
  );
  RETURN new;
END;
```

**Trigger:** `on_auth_user_created` → se ejecuta en `auth.users` AFTER INSERT.

---

## Políticas RLS (Row Level Security)

Todas las tablas tienen RLS habilitado. Las políticas usan `get_user_role()` y `auth.uid()` para controlar acceso.

### Patrón general por rol:

| Tabla | ADMIN | CONSULTOR | CLIENTE |
|-------|-------|-----------|---------|
| users | ALL | SELECT (solo su propio registro) | SELECT (solo su propio registro) |
| clients | ALL | - | SELECT (solo su empresa) |
| projects | ALL | SELECT (solo asignados via consultant_id) | SELECT (solo de su empresa via client_id) |
| project_client_users | ALL | SELECT (proyectos asignados) | SELECT (su propio user_id) |
| time_logs | ALL | CRUD (solo los suyos via consultant_id) | SELECT (proyectos de su empresa) |
| goals | ALL | CRUD (solo de proyectos asignados) | - |
| activities | ALL | CRUD (solo de proyectos asignados) | - |
| prospects | ALL | - | - |
| admin_notes | ALL | ALL (solo CONS_NOTE/CONS_REPORT con su consultantId) | - |
| social_contents | ALL | - | - |
| certificates | ALL | SELECT (proyectos asignados) | SELECT (proyectos de su empresa) |
| consultant_signatures | ALL | ALL (solo su propio id) | - |

### Políticas detalladas de storage:

| Bucket | Policy | Roles | Operación |
|--------|--------|-------|-----------|
| evidencias | authenticated_read_evidencias | authenticated | SELECT |
| evidencias | consultant_upload_evidencias | ADMIN, CONSULTOR | INSERT |
| evidencias | admin_delete_evidencias | ADMIN | DELETE |
| certificados | admin_manage_certificados | ADMIN | ALL |
| certificados | read_own_certificados | authenticated | SELECT |

---

## Storage Buckets

| Bucket | Público | Uso |
|--------|---------|-----|
| `evidencias` | No | Fotos/evidencias subidas por consultores en jornadas |
| `certificados` | No | PDFs de certificados generados |

---

## Migraciones aplicadas (en orden)

1. `01_create_core_tables` — users, clients, projects, project_client_users
2. `02_create_operational_tables` — time_logs, goals, activities
3. `03_create_admin_tables` — prospects, admin_notes, social_contents
4. `04_enable_rls_and_policies` — RLS + políticas iniciales
5. `05_trigger_and_storage` — trigger handle_new_user + buckets
6. `06_fix_missing_rls_project_client_users` — RLS para tabla pivote
7. `fix_consultant_and_notes_policies` — políticas consultor + notas
8. `fix_critical_security_rls_and_trigger` — correcciones de seguridad
9. `consolidate_policies_cascade_storage` — consolidación final + storage policies

---

## Usuarios existentes en producción

| Email | Rol | Status |
|-------|-----|--------|
| dmonzon@apmgroup.pe | ADMIN | ACTIVO |
| admin@plataformaapm.com | ADMIN | ACTIVO |
| consultor@plataformaapm.com | CONSULTOR | ACTIVO |
| cliente@plataformaapm.com | CLIENTE | ACTIVO |

---

## Stack del Frontend que consume Supabase

- **Framework:** Next.js 16 (App Router) + React 19
- **Auth:** Supabase Auth via `@supabase/supabase-js` (email/password)
- **DB Client:** `@supabase/supabase-js` con anon key en frontend, service_role_key en API routes
- **Storage:** Upload via API route con service_role_key al bucket `evidencias`
- **Roles:** 3 roles (ADMIN, CONSULTOR, CLIENTE) — determinan navegación, vistas y acceso a datos
- **Aislamiento:** RLS a nivel de Supabase + funciones `get_user_role()` / `get_user_company_id()`

---

## Cómo usar este archivo en otro proyecto

1. Configura el MCP de Supabase en tu `.mcp.json` o settings de Claude Code
2. Arrastra este archivo al chat para dar contexto completo
3. El MCP ya podrá operar sobre el proyecto `ovflbrrnqgmooutlukyf` con conocimiento total del esquema, políticas y estructura

### Config MCP recomendada:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic-ai/mcp-supabase@latest",
        "--access-token",
        "<TU_SUPABASE_PERSONAL_ACCESS_TOKEN>",
        "--project-ref",
        "ovflbrrnqgmooutlukyf"
      ]
    }
  }
}
```

> **Nota:** El `--access-token` es tu **Personal Access Token de Supabase** (no confundir con anon key ni service role). Se genera en: https://supabase.com/dashboard/account/tokens
