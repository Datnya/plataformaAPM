# APM Group — Control de Proyectos — Arquitectura del Sistema

> **Versión:** 0.1.0 | **Última actualización:** 2026-03-26

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
│  │  │Auth       │  │API Routes │  │Servicios  │        │   │
│  │  │Custom     │  │Next.js    │  │Upload,    │        │   │
│  │  │bcryptjs   │  │Route      │  │Email,     │        │   │
│  │  │           │  │Handlers   │  │Calendar   │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘        │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────┼──────────────────────────────┐   │
│  │            CAPA 3: DATOS Y ALMACENAMIENTO             │   │
│  │                                                       │   │
│  │  ┌───────────┐  ┌───────────┐                        │   │
│  │  │SQLite     │  │File       │                        │   │
│  │  │(dev.db)   │  │System     │                        │   │
│  │  │via Prisma │  │(uploads)  │                        │   │
│  │  └───────────┘  └───────────┘                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            CAPA 4: SERVICIOS EXTERNOS (FUTURO)        │   │
│  │                                                       │   │
│  │  PostgreSQL (prod)   Supabase Storage   Vercel        │   │
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
│       ├── DashboardRouter.tsx    # Router de vistas por rol (ADMIN/CONSULTOR/CLIENTE)
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
│       │
│       │── # ─── VISTAS CONSULTOR ──────────────────
│       ├── ConsultorDashboard.tsx   # Dashboard del consultor (sus proyectos, horas)
│       ├── ConsultorProyectos.tsx   # Sus proyectos asignados con actividades
│       ├── ConsultorJornada.tsx     # Registro de jornada (check-in/out, evidencias)
│       ├── ConsultorObjetivos.tsx   # Sus objetivos semanales/mensuales
│       ├── ConsultorInformes.tsx    # Generación de informes de actividad
│       ├── ConsultorCalendario.tsx  # Calendario personal del consultor
│       │
│       │── # ─── VISTAS CLIENTE ────────────────────
│       ├── ClienteDashboard.tsx     # Dashboard del cliente (avance de proyecto)
│       ├── ClienteProyecto.tsx      # Detalle de su proyecto
│       └── ClienteEvidencias.tsx    # Evidencias subidas por el consultor
│
├── context/
│   └── AuthContext.tsx            # Context para auth state, rol, vista actual
│
├── lib/
│   ├── prisma.ts                  # Singleton de Prisma Client
│   ├── constants.ts               # Constantes (APP_NAME, límites)
│   └── utils.ts                   # Utilidades generales
│
├── types/
│   └── index.ts                   # Re-export de tipos Prisma + enums custom
│
└── generated/
    └── prisma/client/             # Cliente Prisma auto-generado
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
  jornada → ConsultorJornada (vista de consultor)
  objetivos → ConsultorObjetivos (vista de consultor)
  informes → ConsultorInformes (vista de consultor)

CONSULTOR:
  dashboard → ConsultorDashboard
  proyectos-consultor → ConsultorProyectos
  jornada → ConsultorJornada
  informes → ConsultorInformes
  calendario-consultor → ConsultorCalendario

CLIENTE:
  dashboard → ClienteDashboard
  proyecto → ClienteProyecto
  evidencias → ClienteEvidencias
```

### 2.2 Capa de API / Backend

**Responsabilidad:** Lógica de negocio, autenticación, acceso a datos via Prisma, procesamiento de uploads y notificaciones.

```
API Routes:
src/app/api/
├── auth/
│   └── login/
│       └── route.ts               # POST — Autenticación (email + bcrypt verify)
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

**Patrón de autenticación:**
```
Método: Custom (bcryptjs hash/verify)
Flujo:
  1. Usuario envía email + password a POST /api/auth/login
  2. API Route busca usuario por email en SQLite via Prisma
  3. bcryptjs.compare() verifica password contra hash almacenado
  4. Si válido, retorna datos del usuario (id, name, role, companyId)
  5. Frontend almacena en AuthContext (React Context, no persistente)
  6. DashboardRouter renderiza vistas según userRole del contexto
```

### 2.3 Capa de Datos

**Responsabilidad:** Persistencia de todos los datos de la aplicación, relaciones entre entidades.

```
Base de datos principal: SQLite (archivo dev.db — desarrollo)
  Uso: Todos los datos de la aplicación
  ORM: Prisma 5.22.0 con cliente generado
  Futuro: Migración a PostgreSQL para producción

Modelos (8 tablas):
  ├── users          # Usuarios (ADMIN, CONSULTOR, CLIENTE)
  ├── clients        # Empresas clientes
  ├── projects       # Proyectos (vincular consultor ↔ cliente)
  ├── time_logs      # Registros de jornada (check-in/out, modalidad, evidencias)
  ├── goals          # Objetivos semanales/mensuales por proyecto
  ├── activities     # Actividades ejecutadas en proyectos
  ├── prospects      # Prospectos del pipeline comercial
  ├── admin_notes    # Notas administrativas
  └── social_contents # Contenido para redes sociales

Almacenamiento de archivos: Filesystem local (vía /api/upload)
  Uso: Evidencias fotográficas de jornadas de consultoría
  Nota: No persistente en Vercel — pendiente migrar a servicio externo

Campos JSON stringified (limitación SQLite):
  - time_logs.areas_visited    → ["Producción", "Almacén"]
  - time_logs.people_met       → [{"nombre":"...", "apellido":"...", "cargo":"..."}]
  - time_logs.evidence_urls    → ["url1", "url2"]
  - social_contents.networks   → ["LinkedIn", "Instagram"]
  - activities.emails          → ["correo@ejemplo.com"]
```

### 2.4 Servicios Externos

| Servicio | Para qué | Tipo de integración | Costo estimado |
|----------|---------|---------------------|----------------|
| Vercel | Hosting y despliegue | Plataforma (Git push → deploy) | Gratis (plan Hobby) |
| GitHub | Control de versiones y CI trigger | Git remote | Gratis |

> **Nota:** No hay integraciones con servicios pagos de terceros en la versión actual del MVP.

---

## 3. Flujo de Datos Principal

### 3.1 Consultor registra su jornada de trabajo

```
1. Consultor inicia sesión → POST /api/auth/login
2. AuthContext almacena userId, userRole="CONSULTOR", isAuthenticated=true
3. Consultor navega a vista "jornada" → ConsultorJornada.tsx
4. Selecciona proyecto, fecha, modalidad (PRESENCIAL/REMOTO)
5. Registra check-in time, áreas visitadas, personas contactadas
6. Sube evidencias fotográficas → POST /api/upload
7. Envía formulario → POST /api/jornada con datos completos
8. Backend inserta registro en tabla time_logs via Prisma
9. Frontend actualiza vista con el nuevo registro confirmado
```

### 3.2 Admin gestiona pipeline de prospectos comerciales

```
1. Admin inicia sesión → userRole="ADMIN"
2. Navega a vista "prospectos" → AdminProspectos.tsx (vista Kanban)
3. Ve prospectos organizados en columnas: NUEVO → CONTACTADO → NEGOCIACION → CERRADO
4. Crea nuevo prospecto → POST /api/prospects (razón social, RUC, contacto, rubro)
5. Actualiza estado del prospecto → PUT /api/prospects/[id] (cambia status)
6. Al cerrar prospecto, puede crear cliente → POST /api/admin/clients
7. Asigna consultor y crea proyecto → POST /api/projects
```

### 3.3 Cliente visualiza avance de su proyecto

```
1. Cliente inicia sesión → userRole="CLIENTE"
2. DashboardRouter renderiza ClienteDashboard.tsx
3. Frontend carga proyecto asignado al cliente via API
4. Cliente ve: objetivos (PENDIENTE/EN_PROCESO/COMPLETADO), actividades recientes
5. Navega a "evidencias" → ClienteEvidencias.tsx
6. Ve las evidencias fotográficas subidas por el consultor en cada jornada
```

---

## 4. Decisiones Arquitectónicas

| Decisión | Lo que elegimos | Lo que descartamos | Por qué |
|----------|----------------|-------------------|---------|
| Framework | Next.js 16 (App Router) | Vite+React, Remix | Full-stack integrado, API Routes, SSR, deploy trivial en Vercel |
| Base de datos | SQLite (dev) + Prisma | PostgreSQL (dev), MongoDB | Cero config local, iteración rápida, migración trivial a PG con Prisma |
| Autenticación | Custom bcryptjs | NextAuth, Clerk, Supabase Auth | App interna con ~20 usuarios, no necesita OAuth ni SSO |
| Hosting | Vercel | AWS, Railway | Zero-config para Next.js, preview deploys, plan gratuito |
| Estado cliente | React Context | Zustand, Redux | Estado simple (auth + vista actual), no justifica dependencia extra |
| Routing por rol | DashboardRouter (client-side) | File-based routing con middleware | SPA-like navigation dentro del dashboard, vistas dinámicas por rol sin recargar página |
| Iconos | Lucide React | Heroicons, FontAwesome | Consistente, tree-shakeable, amplia librería de iconos |
| CSS | Tailwind v4 + CSS custom | CSS Modules, styled-components | Prototipado rápido + variables CSS custom para brand consistency |

---

## 5. Seguridad

### 5.1 Principios de Seguridad
```
1. Contraseñas hasheadas con bcryptjs — nunca almacenadas en texto plano
2. API keys y credenciales solo en variables de entorno (.env), nunca en código
3. Validación de inputs en API Routes antes de insertar en DB
4. Roles de usuario (ADMIN/CONSULTOR/CLIENTE) determinan acceso a vistas y APIs
```

### 5.2 Datos Sensibles
| Dato | Dónde se almacena | Cómo se protege |
|------|-------------------|----------------|
| Contraseñas | Hash bcrypt en columna `password` de tabla `users` | bcryptjs hash con salt |
| DATABASE_URL | Variable de entorno `.env` | `.gitignore` excluye `.env` |
| Datos de clientes (RUC, contactos) | SQLite `dev.db` / PostgreSQL (prod) | Acceso restringido por rol (solo ADMIN ve prospectos) |
| Evidencias fotográficas | Filesystem local / Storage externo (futuro) | Acceso vía API Route con verificación de sesión |

### 5.3 Aislamiento Multi-Tenant
```
Método: Column-based (companyId en tabla users)
Implementación:
  - Cada usuario CLIENTE tiene un companyId que lo vincula a su empresa (tabla clients)
  - Los CONSULTORES ven solo los proyectos donde están asignados (consultant_id)
  - Los CLIENTES ven solo los proyectos de su empresa
  - El ADMIN ve todo sin restricciones
  - Pendiente: Implementar middleware de autorización en API Routes
```

---

## 6. Escalabilidad

### 6.1 Cuellos de Botella Anticipados
```
1. SQLite — Writer único, no soporta concurrencia real
   Solución: Migrar a PostgreSQL (Supabase) para producción

2. Almacenamiento de archivos en filesystem local
   Solución: Migrar a Supabase Storage o AWS S3

3. Auth en React Context (no persistente)
   Solución: Implementar JWT con cookies httpOnly o sesiones server-side

4. Campos JSON stringified en SQLite (no indexables)
   Solución: En PostgreSQL usar tipo JSON nativo con índices GIN
```

### 6.2 Plan de Crecimiento
| Usuarios | Infra Necesaria | Costo Estimado |
|----------|-----------------|---------------|
| 0-20 (actual) | Vercel Hobby + SQLite local | $0/mes |
| 20-100 | Vercel Pro + Supabase Free (PostgreSQL) | $20/mes |
| 100-500 | Vercel Pro + Supabase Pro + Supabase Storage | $45/mes |

---

## 7. Variables de Entorno

```bash
# Auth
# (Sin variables de auth externas — autenticación custom)

# Base de datos
DATABASE_URL="file:./dev.db"           # SQLite en desarrollo
# DATABASE_URL="postgresql://user:pass@host:5432/db"  # PostgreSQL en producción

# App
NODE_ENV=development                    # development | production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANTE:** Nunca commitear valores reales. Usar `.env.example` con placeholders.

---

## 8. Monitoring y Observabilidad

| Qué monitorear | Herramienta | Umbral de alerta |
|----------------|-------------|-----------------|
| Errores en runtime | Vercel Logs (integrado) | Revisión manual post-deploy |
| Performance | Vercel Analytics (plan gratuito incluye métricas básicas) | p95 > 3 segundos |
| Disponibilidad | Vercel (uptime integrado) | < 99% |

> **Nota:** Monitoreo avanzado (Sentry, PostHog) pendiente de implementar en fases futuras.
