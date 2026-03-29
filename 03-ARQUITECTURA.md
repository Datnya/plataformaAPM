# APM Group — Control de Proyectos — Arquitectura del Sistema

> **Versión:** 0.2.0 | **Última actualización:** 2026-03-28

---

## 1. Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│              APM Group — Control de Proyectos               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            CAPA 1: PRESENTACIÓN                      │   │
│  │  (Lo que ve el usuario según su rol)                 │   │
│  │                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │  Login   │ │Dashboard │ │ Vistas   │            │   │
│  │  │  Page    │ │ por Rol  │ │ CRUD     │            │   │
│  │  └──────────┘ └──────────┘ └──────────┘            │   │
│  │                                                      │   │
│  │  Framework: Next.js 16 (App Router) + React 19      │   │
│  │  Estilos: Tailwind CSS v4 + Poppins                 │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────┼──────────────────────────────┐   │
│  │            CAPA 2: API / BACKEND                      │   │
│  │  (Lógica de negocio)                                  │   │
│  │                                                       │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │Supabase   │  │API Routes │  │Servicios  │        │   │
│  │  │Auth (SSR) │  │Next.js    │  │Upload,    │        │   │
│  │  │@supabase/ │  │Route      │  │Email,     │        │   │
│  │  │ssr        │  │Handlers   │  │Calendar,  │        │   │
│  │  │           │  │           │  │PDF Gen    │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘        │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────┼──────────────────────────────┐   │
│  │            CAPA 3: DATOS Y ALMACENAMIENTO             │   │
│  │                                                       │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │Supabase   │  │Supabase   │  │Supabase   │        │   │
│  │  │PostgreSQL │  │Storage    │  │Auth       │        │   │
│  │  │(tablas)   │  │(archivos) │  │(sesiones) │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            CAPA 4: SERVICIOS EXTERNOS                 │   │
│  │                                                       │   │
│  │  Supabase (DB + Auth + Storage)   Vercel (hosting)    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes y Responsabilidades

### 2.1 Capa de Presentación — Next.js 16 (App Router)

**Responsabilidad:** Toda la interfaz de usuario, navegación por roles, y renderizado de dashboards y formularios CRUD.

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (Poppins font, metadata SEO)
│   ├── page.tsx                   # Página principal (redirige a login/dashboard)
│   ├── globals.css                # Design system APM (variables, utilities, animaciones)
│   ├── api/                       # API Routes (ver sección 2.2)
│   └── favicon.ico
│
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx          # Formulario de login (email/password)
│   │
│   ├── layout/
│   │   ├── DashboardLayout.tsx    # Layout principal con sidebar + navbar
│   │   ├── Sidebar.tsx            # Sidebar (260px) con navegación por rol
│   │   ├── MobileSidebar.tsx      # Sidebar responsivo para móvil
│   │   └── Navbar.tsx             # Barra superior (64px) con info de usuario
│   │
│   └── dashboard/
│       ├── DashboardRouter.tsx    # Router keep-alive por rol (ADMIN/CONSULTOR/CLIENTE)
│       │
│       │── # ─── VISTAS ADMIN ──────────────────────
│       ├── AdminDashboard.tsx       # Dashboard principal admin (KPIs, resumen)
│       ├── AdminUsuarios.tsx        # CRUD de usuarios del sistema
│       ├── AdminNuevoUsuario.tsx    # Formulario crear usuario
│       ├── AdminProyectos.tsx       # Gestión de todos los proyectos
│       ├── AdminProspectos.tsx      # Pipeline comercial (kanban NUEVO→CERRADO)
│       ├── AdminControlClientes.tsx # Control de clientes y sus cuentas
│       ├── AdminConsultorGoals.tsx  # Objetivos asignados a consultores
│       ├── AdminCalendario.tsx      # Calendario global de actividades
│       ├── AdminSocialContent.tsx   # Calendario de contenido para redes sociales
│       ├── AdminManualUsuario.tsx   # Manual de usuario interactivo (secciones admin)
│       ├── AdminCertificados.tsx    # Generador de certificados PDF con firmas y QR
│       │
│       │── # ─── VISTAS CONSULTOR ──────────────────
│       ├── ConsultorDashboard.tsx   # Dashboard del consultor (sus proyectos, horas)
│       ├── ConsultorProyectos.tsx   # Sus proyectos asignados con actividades
│       ├── ConsultorJornada.tsx     # Registro de jornada (check-in/out, evidencias)
│       ├── ConsultorObjetivos.tsx   # Sus objetivos semanales/mensuales
│       ├── ConsultorInformes.tsx    # Generación de informes de actividad
│       ├── ConsultorCalendario.tsx  # Calendario personal del consultor (privado)
│       ├── ConsultorManualUsuario.tsx # Manual de usuario interactivo (secciones consultor)
│       │
│       │── # ─── VISTAS CLIENTE ────────────────────
│       ├── ClienteDashboard.tsx     # Dashboard del cliente (avance de proyecto)
│       ├── ClienteProyecto.tsx      # Detalle de su proyecto
│       └── ClienteEvidencias.tsx    # Evidencias subidas por el consultor
│
├── context/
│   └── AuthContext.tsx            # Context para auth state con Supabase, rol, vista actual
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase browser client (createBrowserClient)
│   │   └── server.ts              # Supabase server client (createServerClient + cookies)
│   ├── auth-guard.ts              # Server-side role verification (requireRole)
│   ├── fetch-cache.ts             # Client-side in-memory fetch cache (60s TTL)
│   ├── nav-items.tsx              # Navegación por rol (NavItem[])
│   ├── constants.ts               # Constantes (APP_NAME, colores, labels)
│   ├── prisma.ts                  # Singleton de Prisma Client (legacy, en transición)
│   └── utils.ts                   # Utilidades generales
│
├── types/
│   └── index.ts                   # Re-export de tipos Prisma + enums custom
│
└── generated/
    └── prisma/client/             # Cliente Prisma auto-generado (legacy)
```

**Navegación por roles (DashboardRouter):**
```
ADMIN:
  dashboard → AdminDashboard
  usuarios → AdminUsuarios
  proyectos → AdminProyectos
  prospectos → AdminProspectos
  control-clientes → AdminControlClientes
  consultant-goals → AdminConsultorGoals
  calendario → AdminCalendario
  redes → AdminSocialContent
  manual → AdminManualUsuario
  certificados → AdminCertificados
  jornada → ConsultorJornada (vista de consultor)
  objetivos → ConsultorObjetivos (vista de consultor)
  informes → ConsultorInformes (vista de consultor)

CONSULTOR:
  dashboard → ConsultorDashboard
  proyectos-consultor → ConsultorProyectos
  jornada → ConsultorJornada
  informes → ConsultorInformes
  calendario-consultor → ConsultorCalendario (privado — admin no puede ver)
  manual-consultor → ConsultorManualUsuario

CLIENTE:
  dashboard → ClienteDashboard
  proyecto → ClienteProyecto
  evidencias → ClienteEvidencias
```

### 2.2 Capa de API / Backend

**Responsabilidad:** Lógica de negocio, autenticación vía Supabase Auth, acceso a datos via Supabase client, procesamiento de uploads, generación de PDFs y notificaciones.

```
API Routes:
src/app/api/
├── auth/
│   └── login/
│       └── route.ts               # POST — Autenticación (Supabase signInWithPassword)
│
├── projects/
│   ├── route.ts                   # GET (listar) / POST (crear proyecto)
│   └── [id]/
│       └── route.ts               # GET / PUT / DELETE proyecto por ID
│
├── prospects/
│   ├── route.ts                   # GET (listar) / POST (crear prospecto)
│   └── [id]/
│       └── route.ts               # GET / PUT / DELETE prospecto por ID
│
├── jornada/
│   ├── route.ts                   # GET (listar) / POST (registrar jornada)
│   └── [id]/
│       └── route.ts               # GET / PUT / DELETE registro de jornada
│
├── goals/
│   ├── [id]/
│   │   └── ...                    # CRUD objetivo por ID
│   └── project/
│       └── ...                    # Objetivos por proyecto
│
├── calendar/
│   └── [id]/
│       └── ...                    # Eventos de calendario por ID
│
├── social-content/
│   ├── route.ts                   # GET / POST contenido social
│   └── [id]/
│       └── route.ts               # GET / PUT / DELETE por ID
│
├── email/
│   └── notification/
│       └── ...                    # Envío de notificaciones por email
│
├── upload/
│   └── route.ts                   # POST — Subida de archivos (evidencias)
│
├── admin/
│   ├── clients/
│   │   └── ...                    # Gestión de clientes (admin)
│   ├── dashboard/
│   │   └── ...                    # KPIs del dashboard admin
│   ├── goals/
│   │   └── ...                    # Objetivos de consultores (admin)
│   ├── notes/
│   │   └── ...                    # Notas administrativas
│   └── users/
│       └── ...                    # CRUD usuarios (admin)
│
└── consultant/
    ├── calendar/
    │   └── ...                    # Calendario del consultor
    ├── projects/
    │   └── ...                    # Proyectos asignados al consultor
    └── reports/
        └── ...                    # Reportes del consultor
```

**Patrón de autenticación (Supabase Auth):**
```
Método: Supabase Auth (@supabase/ssr)
Flujo:
  1. Usuario envía email + password a POST /api/auth/login
  2. API Route crea Supabase server client con cookies
  3. supabase.auth.signInWithPassword() verifica credenciales
  4. Si válido, consulta tabla "users" para obtener perfil (id, name, role, status)
  5. Verifica que status === "ACTIVO" (si no, llama signOut y retorna 403)
  6. Frontend detecta sesión vía onAuthStateChange en AuthContext
  7. DashboardRouter renderiza vistas según userRole del contexto

Manejo de tokens expirados:
  - AuthContext.getUser() captura errores de refresh token inválido
  - Si el token es inválido, llama supabase.auth.signOut() para limpiar la sesión
  - Esto evita el error "Invalid Refresh Token: Refresh Token Not Found"
```

**Autorización server-side (auth-guard.ts):**
```
Función: requireRole(allowedRoles: string[])
  - Verifica sesión con supabase.auth.getUser()
  - Busca perfil en tabla "users"
  - Valida status === "ACTIVO" y role está en allowedRoles
  - Retorna { userId, role } o { error: NextResponse(401|403|404) }
```

### 2.3 Capa de Datos

**Responsabilidad:** Persistencia de todos los datos de la aplicación, relaciones entre entidades.

```
Base de datos: Supabase PostgreSQL (cloud)
  Uso: Todos los datos de la aplicación
  Acceso: Supabase client (@supabase/ssr) con RLS policies
  Legacy: Prisma client aún presente pero en transición

Modelos (tablas principales):
  ├── users              # Usuarios (ADMIN, CONSULTOR, CLIENTE) — synced con Supabase Auth
  ├── clients            # Empresas clientes
  ├── projects           # Proyectos (vincular consultor ↔ cliente)
  ├── time_logs          # Registros de jornada (check-in/out, modalidad, evidencias)
  ├── goals              # Objetivos semanales/mensuales por proyecto
  ├── activities         # Actividades ejecutadas en proyectos
  ├── prospects          # Prospectos del pipeline comercial
  ├── admin_notes        # Notas del calendario administrativo
  └── social_contents    # Contenido para redes sociales

Almacenamiento de archivos: Supabase Storage
  Uso: Evidencias fotográficas, informes PDF, certificados generados
```

### 2.4 Servicios Externos

| Servicio | Para qué | Tipo de integración | Estado |
|----------|---------|---------------------|--------|
| Supabase | Base de datos PostgreSQL, Auth, Storage | SDK (@supabase/ssr + @supabase/supabase-js) | Activo |
| Vercel | Hosting y despliegue | Plataforma (Git push → deploy) | Activo |
| GitHub | Control de versiones y CI trigger | Git remote | Activo |

---

## 3. Flujo de Datos Principal

### 3.1 Consultor registra su jornada de trabajo

```
1. Consultor inicia sesión → POST /api/auth/login (Supabase signInWithPassword)
2. AuthContext detecta sesión vía onAuthStateChange, carga perfil desde tabla "users"
3. Consultor navega a vista "jornada" → ConsultorJornada.tsx (keep-alive, sin remount)
4. Selecciona proyecto, fecha, modalidad (PRESENCIAL/REMOTO)
5. Registra check-in time, áreas visitadas, personas contactadas
6. Sube evidencias fotográficas → POST /api/upload (Supabase Storage)
7. Envía formulario → POST /api/jornada con datos completos
8. Backend inserta registro en tabla time_logs via Supabase client
9. Frontend actualiza vista con el nuevo registro confirmado
```

### 3.2 Admin gestiona pipeline de prospectos comerciales

```
1. Admin inicia sesión → userRole="ADMIN"
2. Navega a vista "prospectos" → AdminProspectos.tsx (vista Kanban, keep-alive)
3. Ve prospectos organizados en columnas: NUEVO → CONTACTADO → NEGOCIACION → CERRADO
4. Crea nuevo prospecto → POST /api/prospects (razón social, RUC, contacto, rubro)
5. Actualiza estado del prospecto → PUT /api/prospects/[id] (cambia status)
6. Al cerrar prospecto, puede crear cliente → POST /api/admin/clients
7. Asigna consultor y crea proyecto → POST /api/projects
```

### 3.3 Cliente visualiza avance de su proyecto

```
1. Cliente inicia sesión → userRole="CLIENTE"
2. DashboardRouter renderiza ClienteDashboard.tsx (keep-alive)
3. Frontend carga proyecto asignado al cliente via API
4. Cliente ve: objetivos (PENDIENTE/EN_PROCESO/COMPLETADO), actividades recientes
5. Navega a "evidencias" → ClienteEvidencias.tsx
6. Ve las evidencias fotográficas subidas por el consultor en cada jornada
```

---

## 4. Optimizaciones de Rendimiento

### 4.1 DashboardRouter — Patrón Keep-Alive

```
Problema: Cada click en el sidebar desmontaba el componente activo y montaba uno
          nuevo, disparando todos los useEffect y fetches (~5 segundos por navegación).

Solución: Los componentes se montan la primera vez que el usuario los visita y
          permanecen montados (ocultos con display:none). Navegaciones subsiguientes
          son instantáneas.

Implementación:
  - useState(Set) trackea vistas visitadas
  - Object.entries(roleViews).map() renderiza todos los visitados
  - Solo el activo tiene display:block, el resto display:none
  - Datos se cargan una sola vez y persisten en memoria
```

### 4.2 Fetches Paralelos

```
ConsultorDashboard: 3 fetches secuenciales → Promise.all()
  Antes: fetch(projects) → await → fetch(reports) → await → fetch(calendar)
  Ahora: Promise.all([projects, reports, calendar]) — ~3× más rápido
```

### 4.3 Caché de Fetches en Memoria

```
Archivo: src/lib/fetch-cache.ts
  fetchCached<T>(url, ttl?) — retorna datos cacheados si TTL no expiró
  invalidateCache(pattern?) — limpia entradas que coincidan con el patrón
  TTL por defecto: 60 segundos
```

---

## 5. Decisiones Arquitectónicas

| Decisión | Lo que elegimos | Lo que descartamos | Por qué |
|----------|----------------|-------------------|---------|
| Framework | Next.js 16 (App Router) | Vite+React, Remix | Full-stack integrado, API Routes, SSR, deploy trivial en Vercel |
| Base de datos | Supabase PostgreSQL | SQLite (dev anterior), MongoDB | Cloud-hosted, RLS policies, Auth integrado, Storage incluido |
| Autenticación | Supabase Auth (@supabase/ssr) | bcryptjs custom (anterior), NextAuth, Clerk | Sesiones persistentes con cookies, refresh token automático, cero mantenimiento |
| Router de vistas | Keep-alive (display:none) | Unmount/remount estándar, SWR/React Query | Navegación instantánea sin librerías extra, datos persisten en componente |
| Hosting | Vercel | AWS, Railway | Zero-config para Next.js, preview deploys, plan gratuito |
| Estado cliente | React Context | Zustand, Redux | Estado simple (auth + vista actual), no justifica dependencia extra |
| Routing por rol | DashboardRouter (client-side) | File-based routing con middleware | SPA-like navigation dentro del dashboard, vistas dinámicas por rol sin recargar página |
| Iconos | Lucide React | Heroicons, FontAwesome | Consistente, tree-shakeable, amplia librería de iconos |
| CSS | Tailwind v4 + CSS custom | CSS Modules, styled-components | Prototipado rápido + variables CSS custom para brand consistency |
| PDFs | jsPDF | html2pdf, Puppeteer | Client-side generation sin servidor, ligero, soporte de firmas y QR |

---

## 6. Seguridad

### 6.1 Principios de Seguridad
```
1. Autenticación delegada a Supabase Auth — tokens JWT manejados automáticamente
2. API keys y credenciales solo en variables de entorno (.env), nunca en código
3. Validación de inputs en API Routes antes de insertar en DB
4. Roles de usuario (ADMIN/CONSULTOR/CLIENTE) verificados server-side con auth-guard.ts
5. Refresh tokens inválidos se limpian automáticamente (AuthContext maneja errores)
6. Supabase RLS (Row Level Security) policies aplicadas a tablas sensibles
```

### 6.2 Datos Sensibles
| Dato | Dónde se almacena | Cómo se protege |
|------|-------------------|----------------|
| Contraseñas | Supabase Auth (hash interno) | Manejado por Supabase — nunca expuesto |
| SUPABASE_URL/ANON_KEY | Variables de entorno `.env` | `.gitignore` excluye `.env` |
| Tokens de sesión | Cookies httpOnly (Supabase SSR) | Automático vía @supabase/ssr |
| Datos de clientes (RUC, contactos) | Supabase PostgreSQL | RLS policies + verificación de rol |
| Evidencias fotográficas | Supabase Storage | Acceso vía API Route con verificación de sesión |

### 6.3 Aislamiento Multi-Tenant
```
Método: Column-based (company_id en tabla users) + Supabase RLS
Implementación:
  - Cada usuario CLIENTE tiene un company_id que lo vincula a su empresa (tabla clients)
  - Los CONSULTORES ven solo los proyectos donde están asignados (consultant_id)
  - Los CLIENTES ven solo los proyectos de su empresa
  - El ADMIN ve todo sin restricciones
  - auth-guard.ts verifica roles server-side en cada API Route protegida
```

---

## 7. Escalabilidad

### 7.1 Cuellos de Botella Anticipados
```
1. Supabase Free tier — Límite de 500MB en DB y 1GB en Storage
   Solución: Upgrade a Supabase Pro cuando se acerque al límite

2. Keep-alive router — Muchos componentes montados consumen memoria
   Solución: Para >20 vistas, implementar LRU eviction en mountedViews

3. Fetch cache en memoria — Se pierde al recargar la página
   Solución: Aceptable para el uso actual; migrar a SWR si se necesita
   persistencia cross-tab
```

### 7.2 Plan de Crecimiento
| Usuarios | Infra Necesaria | Costo Estimado |
|----------|-----------------|---------------|
| 0-20 (actual) | Vercel Hobby + Supabase Free | $0/mes |
| 20-100 | Vercel Pro + Supabase Free | $20/mes |
| 100-500 | Vercel Pro + Supabase Pro | $45/mes |

---

## 8. Variables de Entorno

```bash
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# ===== BASE DE DATOS (legacy Prisma) =====
DATABASE_URL="postgresql://..."

# ===== APP =====
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANTE:** Nunca commitear valores reales. Usar `.env.example` con placeholders.

---

## 9. Monitoring y Observabilidad

| Qué monitorear | Herramienta | Umbral de alerta |
|----------------|-------------|-----------------|
| Errores en runtime | Vercel Logs (integrado) | Revisión manual post-deploy |
| Performance | Vercel Analytics (plan gratuito incluye métricas básicas) | p95 > 3 segundos |
| Disponibilidad | Vercel (uptime integrado) | < 99% |
| Base de datos | Supabase Dashboard (queries, storage, auth logs) | Según métricas del plan |

> **Nota:** Monitoreo avanzado (Sentry, PostHog) pendiente de implementar en fases futuras.
