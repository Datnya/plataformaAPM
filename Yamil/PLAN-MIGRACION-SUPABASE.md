# 🚀 Plan de Migración a Supabase — PlataformaAPM

> **Fecha:** 2026-03-26 | **Estado:** Pendiente de ejecución
> **Proyecto Supabase existente:** `ovflbrrnqgmooutlukyf` (Organización: Datnya)
> **Región:** us-west-2 | **PostgreSQL:** 17.6.1

---

## 📋 Resumen Ejecutivo

Migrar el backend de PlataformaAPM desde **SQLite + Prisma + API Routes custom** hacia **Supabase (PostgreSQL + Auth + RLS + Storage)**, aplicando las buenas prácticas de la skill oficial `supabase-postgres-best-practices`.

### ¿Qué cambia?

| Componente | Antes (SQLite) | Después (Supabase) |
|-----------|---------------|-------------------|
| Base de datos | SQLite (`dev.db`) | PostgreSQL 17 (Supabase) |
| Autenticación | Custom bcryptjs + React Context | Supabase Auth (JWT, sesiones persistentes) |
| Seguridad de datos | Filtrado en código (API Routes) | Row Level Security (RLS) en PostgreSQL |
| Almacenamiento | Filesystem local (`/api/upload`) | Supabase Storage (buckets) |
| API de datos | API Routes custom con Prisma | Supabase Client JS (directo desde frontend) + API Routes para lógica compleja |
| Sesiones | No persistentes (React Context) | Persistentes (cookies httpOnly, JWT refresh) |

### ¿Qué NO cambia?

- **Next.js 16** sigue siendo el framework
- **Tailwind CSS v4** y el design system APM se mantienen
- **Componentes de dashboard** (19 componentes) se mantienen
- **Estructura de roles** (ADMIN, CONSULTOR, CLIENTE) se mantiene

---

## 🔧 Skill Instalada: `supabase-postgres-best-practices`

```
Ubicación: skills/supabase/skills/supabase-postgres-best-practices/
Versión: 1.1.0
Autor: Supabase (oficial)
```

### Reglas que aplicaremos (por prioridad):

| # | Categoría | Impacto | Reglas clave a aplicar |
|---|----------|---------|----------------------|
| 1 | **Query Performance** | CRITICAL | Índices en columnas filtradas, índices compuestos para queries frecuentes |
| 2 | **Connection Management** | CRITICAL | Connection pooling de Supabase (PgBouncer integrado) |
| 3 | **Security & RLS** | CRITICAL | Políticas RLS por rol, `(select auth.uid())` para performance, `security definer` functions |
| 4 | **Schema Design** | HIGH | `bigint identity` para PKs, índices en FKs, constraints con `DO $$ ... $$`, tipos nativos JSONB |
| 5 | **Data Access** | MEDIUM | Paginación cursor-based, batch inserts, evitar N+1 |

---

## 📦 Fases de Implementación

---

### FASE 1: Configurar Proyecto Supabase
**Duración estimada:** 15 minutos
**Riesgo:** Bajo

#### Paso 1.1 — Verificar proyecto existente

Usaremos el proyecto Supabase ya existente:
- **Project ID:** `ovflbrrnqgmooutlukyf`
- **Organización:** Datnya (`enahadaonpezbozsqpzy`)
- **Host:** `db.ovflbrrnqgmooutlukyf.supabase.co`

```bash
# Verificar que el proyecto esté activo y saludable
# (ya confirmado: status = ACTIVE_HEALTHY)
```

#### Paso 1.2 — Obtener credenciales

Usando el MCP de Supabase:
1. Obtener la **URL del proyecto** (`get_project_url`)
2. Obtener las **API keys** (`get_publishable_keys`)
3. Guardar en `.env.local`:

```bash
# .env.local (NUNCA commitear)
NEXT_PUBLIC_SUPABASE_URL=https://ovflbrrnqgmooutlukyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # Solo server-side
```

#### Paso 1.3 — Instalar Supabase Client en el proyecto

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Crear los archivos de utilidad:
- `src/lib/supabase/client.ts` — Cliente para componentes del lado del cliente
- `src/lib/supabase/server.ts` — Cliente para Server Components y API Routes
- `src/lib/supabase/middleware.ts` — Middleware para refresh de sesiones

---

### FASE 2: Migración del Esquema de Base de Datos
**Duración estimada:** 30 minutos
**Riesgo:** Medio

#### Paso 2.1 — Crear tablas en PostgreSQL (via MCP `apply_migration`)

Aplicando buenas prácticas de la skill:

| Práctica | Referencia | Qué haremos |
|---------|-----------|------------|
| **Primary Keys** | `schema-primary-keys.md` | Usar `bigint generated always as identity` en vez de UUIDs random |
| **Foreign Key Indexes** | `schema-foreign-key-indexes.md` | Crear índice en CADA columna FK |
| **Constraints** | `schema-constraints.md` | CHECK constraints para enums (role, status, modality) |
| **Data Types** | `schema-data-types.md` | JSONB nativo en vez de JSON stringified |
| **Lowercase identifiers** | `schema-lowercase-identifiers.md` | Todo en snake_case sin comillas |

#### Migración 1: `create_core_tables`

```sql
-- Tabla: clients (empresas)
create table public.clients (
  id bigint generated always as identity primary key,
  company_name text not null,
  status text not null default 'ACTIVO'
    check (status in ('ACTIVO', 'INACTIVO')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla: users (vinculada a auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'CLIENTE'
    check (role in ('ADMIN', 'CONSULTOR', 'CLIENTE')),
  status text not null default 'ACTIVO'
    check (status in ('ACTIVO', 'INACTIVO')),
  company_id bigint references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index users_company_id_idx on public.users(company_id);
create index users_role_idx on public.users(role);

-- Tabla: projects
create table public.projects (
  id bigint generated always as identity primary key,
  name text not null default 'Proyecto sin nombre',
  client_id bigint references public.clients(id) on delete set null,
  consultant_id uuid not null references public.users(id),
  start_date timestamptz not null,
  end_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_client_id_idx on public.projects(client_id);
create index projects_consultant_id_idx on public.projects(consultant_id);

-- Tabla: project_client_users (N:N entre projects y users-clientes)
create table public.project_client_users (
  project_id bigint not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (project_id, user_id)
);
create index project_client_users_user_id_idx on public.project_client_users(user_id);
```

#### Migración 2: `create_operational_tables`

```sql
-- Tabla: time_logs (jornadas)
create table public.time_logs (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  consultant_id uuid not null references public.users(id),
  date date not null,
  check_in_time timestamptz not null,
  check_out_time timestamptz,
  modality text not null check (modality in ('PRESENCIAL', 'REMOTO')),
  areas_visited jsonb not null default '[]'::jsonb,
  people_met jsonb default '[]'::jsonb,
  evidence_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index time_logs_project_id_idx on public.time_logs(project_id);
create index time_logs_consultant_id_idx on public.time_logs(consultant_id);
create index time_logs_date_idx on public.time_logs(date);

-- Tabla: goals (objetivos)
create table public.goals (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  description text not null,
  type text not null check (type in ('SEMANAL', 'MENSUAL')),
  status text not null default 'PENDIENTE'
    check (status in ('PENDIENTE', 'EN_PROCESO', 'REVISION', 'COMPLETADO')),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_project_id_idx on public.goals(project_id);

-- Tabla: activities
create table public.activities (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  date timestamptz not null,
  emails jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index activities_project_id_idx on public.activities(project_id);
```

#### Migración 3: `create_admin_tables`

```sql
-- Tabla: prospects (pipeline comercial)
create table public.prospects (
  id bigint generated always as identity primary key,
  company_name text not null,
  trade_name text,
  industry text,
  contact_name text not null,
  contact_role text,
  phone text,
  ruc text,
  email text,
  notes text,
  first_contact_date timestamptz not null,
  last_interaction_date timestamptz not null,
  status text not null default 'NUEVO'
    check (status in ('NUEVO', 'CONTACTADO', 'NEGOCIACION', 'CERRADO')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prospects_status_idx on public.prospects(status);

-- Tabla: admin_notes
create table public.admin_notes (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla: social_contents
create table public.social_contents (
  id bigint generated always as identity primary key,
  networks jsonb not null default '[]'::jsonb,
  content_type text not null,
  format text not null,
  publish_date timestamptz not null,
  status text not null default 'PENDIENTE'
    check (status in ('PENDIENTE', 'EN_PROCESO', 'LANZADO')),
  title text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### FASE 3: Row Level Security (RLS)
**Duración estimada:** 30 minutos
**Riesgo:** Alto — Es la parte más crítica de seguridad

#### Buenas prácticas aplicadas de la skill:

| Regla | Referencia | Aplicación |
|-------|-----------|-----------|
| Siempre habilitar RLS | `security-rls-basics.md` | `alter table X enable row level security` en TODAS las tablas |
| Funciones cacheadas | `security-rls-performance.md` | Usar `(select auth.uid())` en vez de `auth.uid()` directo |
| Helper functions | `security-rls-performance.md` | Crear `get_user_role()` como `security definer` |
| Índices en columnas RLS | `security-rls-performance.md` | Ya creados en Fase 2 |

#### Migración 4: `enable_rls_and_policies`

```sql
-- ═══ Helper Function (security definer) ═══
create or replace function public.get_user_role()
returns text
language sql
security definer
set search_path = ''
as $$
  select role from public.users where id = (select auth.uid());
$$;

create or replace function public.get_user_company_id()
returns bigint
language sql
security definer
set search_path = ''
as $$
  select company_id from public.users where id = (select auth.uid());
$$;

-- ═══ HABILITAR RLS EN TODAS LAS TABLAS ═══
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_client_users enable row level security;
alter table public.time_logs enable row level security;
alter table public.goals enable row level security;
alter table public.activities enable row level security;
alter table public.prospects enable row level security;
alter table public.admin_notes enable row level security;
alter table public.social_contents enable row level security;

-- ═══ POLÍTICAS: users ═══
-- Admin: ve todos los usuarios
create policy admin_all_users on public.users
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- Consultor/Cliente: ve su propio perfil
create policy own_profile on public.users
  for select to authenticated
  using (id = (select auth.uid()));

-- ═══ POLÍTICAS: clients ═══
-- Admin: CRUD completo
create policy admin_all_clients on public.clients
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- Cliente: ve su propia empresa
create policy client_own_company on public.clients
  for select to authenticated
  using (id = (select public.get_user_company_id()));

-- ═══ POLÍTICAS: projects ═══
-- Admin: ve todos
create policy admin_all_projects on public.projects
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- Consultor: ve sus proyectos asignados
create policy consultant_own_projects on public.projects
  for select to authenticated
  using (
    (select public.get_user_role()) = 'CONSULTOR'
    and consultant_id = (select auth.uid())
  );

-- Cliente: ve proyectos de su empresa
create policy client_company_projects on public.projects
  for select to authenticated
  using (
    (select public.get_user_role()) = 'CLIENTE'
    and client_id = (select public.get_user_company_id())
  );

-- ═══ POLÍTICAS: time_logs ═══
-- Admin: ve todos
create policy admin_all_timelogs on public.time_logs
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- Consultor: CRUD sus propias jornadas
create policy consultant_own_timelogs on public.time_logs
  for all to authenticated
  using (
    (select public.get_user_role()) = 'CONSULTOR'
    and consultant_id = (select auth.uid())
  );

-- Cliente: ve time_logs de sus proyectos (solo lectura)
create policy client_project_timelogs on public.time_logs
  for select to authenticated
  using (
    (select public.get_user_role()) = 'CLIENTE'
    and project_id in (
      select id from public.projects
      where client_id = (select public.get_user_company_id())
    )
  );

-- ═══ POLÍTICAS: goals ═══
-- Admin: CRUD completo
create policy admin_all_goals on public.goals
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- Consultor: ve goals de sus proyectos
create policy consultant_project_goals on public.goals
  for select to authenticated
  using (
    (select public.get_user_role()) = 'CONSULTOR'
    and project_id in (
      select id from public.projects
      where consultant_id = (select auth.uid())
    )
  );

-- ═══ POLÍTICAS: prospects (solo admin) ═══
create policy admin_only_prospects on public.prospects
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- ═══ POLÍTICAS: admin_notes (solo admin) ═══
create policy admin_only_notes on public.admin_notes
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- ═══ POLÍTICAS: social_contents (solo admin) ═══
create policy admin_only_social on public.social_contents
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- ═══ POLÍTICAS: activities ═══
-- Admin: CRUD completo
create policy admin_all_activities on public.activities
  for all to authenticated
  using ((select public.get_user_role()) = 'ADMIN');

-- Consultor: CRUD en sus proyectos
create policy consultant_project_activities on public.activities
  for all to authenticated
  using (
    (select public.get_user_role()) = 'CONSULTOR'
    and project_id in (
      select id from public.projects
      where consultant_id = (select auth.uid())
    )
  );
```

---

### FASE 4: Migrar Autenticación a Supabase Auth
**Duración estimada:** 45 minutos
**Riesgo:** Alto

#### Paso 4.1 — Eliminar auth custom, instalar Supabase Auth

Archivos a **crear**:
```
src/lib/supabase/client.ts     → createBrowserClient()
src/lib/supabase/server.ts     → createServerClient()
src/middleware.ts               → Refresh de sesiones JWT
```

Archivos a **modificar**:
```
src/context/AuthContext.tsx     → Usar supabase.auth en vez de state manual
src/components/auth/LoginForm.tsx → supabase.auth.signInWithPassword()
src/app/layout.tsx              → Envolver con AuthProvider actualizado
```

Archivos a **eliminar**:
```
src/app/api/auth/login/route.ts → Ya no necesario (Supabase Auth lo maneja)
```

#### Paso 4.2 — Crear trigger para sincronizar auth.users → public.users

```sql
-- Función que se ejecuta cuando se crea un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'role', 'CLIENTE')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

#### Paso 4.3 — Crear usuarios iniciales

Crear los usuarios existentes del sistema usando `supabase.auth.admin.createUser()` desde un script o API Route protegida, pasando metadata `{ name, role }`.

---

### FASE 5: Migrar Storage (Evidencias)
**Duración estimada:** 20 minutos
**Riesgo:** Bajo

#### Paso 5.1 — Crear bucket para evidencias

```sql
-- Via Supabase Storage (o dashboard)
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', false);
```

#### Paso 5.2 — Políticas de storage

```sql
-- Consultores pueden subir evidencias
create policy consultant_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'evidencias'
    and (select public.get_user_role()) in ('ADMIN', 'CONSULTOR')
  );

-- Todos los autenticados pueden ver evidencias (de sus proyectos)
create policy authenticated_read on storage.objects
  for select to authenticated
  using (bucket_id = 'evidencias');
```

#### Paso 5.3 — Actualizar componentes

Reemplazar `POST /api/upload` por `supabase.storage.from('evidencias').upload()`.

---

### FASE 6: Refactorizar Componentes Frontend
**Duración estimada:** 2-3 horas
**Riesgo:** Medio

#### Paso 6.1 — Reemplazar `fetch('/api/...')` por Supabase Client

| Componente | Antes | Después |
|-----------|-------|--------|
| `ConsultorJornada.tsx` | `fetch('/api/jornada')` | `supabase.from('time_logs').select()` |
| `AdminProspectos.tsx` | `fetch('/api/prospects')` | `supabase.from('prospects').select()` |
| `AdminProyectos.tsx` | `fetch('/api/projects')` | `supabase.from('projects').select('*, clients(*), users!consultant_id(*)')` |
| `AdminUsuarios.tsx` | `fetch('/api/admin/users')` | `supabase.from('users').select('*, clients(*)')` |
| `AdminSocialContent.tsx` | `fetch('/api/social-content')` | `supabase.from('social_contents').select()` |
| `ConsultorProyectos.tsx` | `fetch('/api/consultant/projects')` | `supabase.from('projects').select()` (RLS filtra automáticamente) |

> [!IMPORTANT]
> Con RLS activo, ya NO necesitas filtrar por `consultant_id` o `company_id` manualmente. Supabase filtra automáticamente según el usuario autenticado.

#### Paso 6.2 — Eliminar API Routes redundantes

Una vez que el frontend use Supabase Client directo, estas API Routes se pueden eliminar:

```
src/app/api/projects/          → Reemplazado por supabase.from('projects')
src/app/api/prospects/         → Reemplazado por supabase.from('prospects')
src/app/api/jornada/           → Reemplazado por supabase.from('time_logs')
src/app/api/goals/             → Reemplazado por supabase.from('goals')
src/app/api/calendar/          → Reemplazado por supabase.from('activities')
src/app/api/social-content/    → Reemplazado por supabase.from('social_contents')
src/app/api/admin/             → Reemplazado (RLS maneja permisos)
src/app/api/consultant/        → Reemplazado (RLS filtra por consultor)
src/app/api/upload/            → Reemplazado por supabase.storage
src/app/api/auth/              → Reemplazado por Supabase Auth
```

**Mantener solo para lógica compleja:**
```
src/app/api/email/notification/ → Mantener (envío de emails requiere server-side)
```

---

### FASE 7: Testing y Verificación
**Duración estimada:** 30 minutos
**Riesgo:** Bajo

#### Paso 7.1 — Verificar con Supabase Advisors

```
# Via MCP: get_advisors (security + performance)
# Esto detectará automáticamente:
# - Tablas sin RLS habilitado
# - Índices faltantes
# - Políticas mal configuradas
```

#### Paso 7.2 — Test manual por cada rol

| Rol | Tests |
|-----|-------|
| **ADMIN** | Login ✓, Dashboard con KPIs ✓, CRUD usuarios ✓, CRUD proyectos ✓, Pipeline prospectos ✓, Calendario ✓, Redes sociales ✓ |
| **CONSULTOR** | Login ✓, Ve solo sus proyectos ✓, Registra jornada ✓, Sube evidencias ✓, Ve calendario propio ✓ |
| **CLIENTE** | Login ✓, Ve solo su proyecto ✓, Ve evidencias ✓, NO ve otros proyectos ✓, NO ve prospectos ✓ |

---

## 📊 Resumen de Ejecución

| Fase | Acción | Herramienta | Duración |
|------|--------|------------|----------|
| 1 | Configurar proyecto + instalar deps | MCP `get_project_url` + `npm install` | 15 min |
| 2 | Crear esquema PostgreSQL | MCP `apply_migration` (3 migraciones) | 30 min |
| 3 | Habilitar RLS + políticas | MCP `apply_migration` (1 migración grande) | 30 min |
| 4 | Migrar auth a Supabase Auth | Código + MCP `apply_migration` | 45 min |
| 5 | Migrar storage (evidencias) | MCP `execute_sql` + código | 20 min |
| 6 | Refactorizar frontend | Código (reemplazar fetch → supabase client) | 2-3 hrs |
| 7 | Testing + advisors | MCP `get_advisors` + tests manuales | 30 min |
| **TOTAL** | | | **~5 horas** |

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Pérdida de datos existentes en SQLite | Medio | Exportar datos de `dev.db` antes de migrar y re-insertarlos vía seed scripts |
| RLS mal configurada deja datos expuestos | Alto | Ejecutar `get_advisors(security)` después de cada migración |
| Auth migration rompe sesiones existentes | Medio | Los usuarios deberán re-registrarse (son ~20, manejable) |
| Queries lentas por RLS suboptimal | Medio | Usar `(select auth.uid())` y `security definer` functions (skill reference) |

---

## ✅ Checklist Pre-Ejecución

- [x] Skill `supabase-postgres-best-practices` instalada
- [x] Proyecto Supabase existente identificado (`ovflbrrnqgmooutlukyf`)
- [x] Esquema actual analizado (8 tablas en Prisma)
- [x] Políticas RLS diseñadas por rol
- [x] Fases 1, 2, 3 y 5 (Setup de Tablas, RLS, Trigger y Buckets) aplicadas exitosamente vía MCP.
- [ ] **Siguiente paso:** Configurar los clientes de API en frontend (Fase 4 y Fase 6) e instalar dependencias si faltan.

---

> **Plan en progreso**. Las políticas y esquemas de base de datos están correctamente aplicadas en Postgres con 0 warnings críticos en RLS.
