# APM Group — Control de Proyectos — Stack Tecnológico

> **Versión:** 0.2.0 | **Última actualización:** 2026-03-28

---

## 1. Stack Canónico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| **Framework** | Next.js 16 (App Router) | 16.2.1 | Framework full-stack con SSR, API Routes integradas y App Router para organización basada en carpetas. Ecosistema maduro y despliegue trivial en Vercel. |
| **Lenguaje** | TypeScript | ^5 | Tipado estático para reducir errores en tiempo de desarrollo. Inferencia de tipos con Prisma genera tipos automáticos del esquema de DB. |
| **Runtime** | Node.js | ≥ 18 | Runtime requerido por Next.js 16. Compatibilidad nativa con el ecosistema npm. |
| **Componentes UI** | Componentes propios + Lucide React | ^1.6.0 | Componentes custom construidos a medida para las necesidades del negocio (dashboards por rol, formularios de jornada, kanban de prospectos). Lucide para iconografía consistente. |
| **Estilos** | Tailwind CSS v4 | ^4 | Utility-first CSS con compilación PostCSS. Rapidez de desarrollo y diseño consistente sin escribir CSS custom extenso. |
| **Estado (cliente)** | React Context API | — (built-in React 19) | Suficiente para el manejo de estado de la app (autenticación, rol de usuario, vista actual, consultor seleccionado). No se necesita una librería externa dado el flujo simple de estado. |
| **Auth** | Supabase Auth (@supabase/ssr) | ^0.9.0 | Autenticación con sesiones persistentes via cookies httpOnly. Login vía `signInWithPassword()`. Manejo automático de refresh tokens. |
| **Base de datos** | Supabase PostgreSQL | Cloud | Base de datos relacional cloud-hosted con Row Level Security (RLS). Acceso vía Supabase JS client. |
| **ORM/Cliente DB** | Supabase JS + Prisma (legacy) | ^2.100.1 / ^5.22.0 | Supabase JS client para queries directas. Prisma aún presente pero en transición, pendiente de eliminar. |
| **Generación PDF** | jsPDF | ^4.2.1 | Generación client-side de certificados PDF con soporte de firmas y códigos QR. |
| **Códigos QR** | qrcode | ^1.5.4 | Generación de QR codes para certificados y validación. |
| **Excel** | xlsx (SheetJS) | ^0.18.5 | Exportación de datos a hojas de cálculo Excel. |
| **Archivos** | file-saver + JSZip | ^2.0.5 / ^3.10.1 | Descarga de archivos generados y empaquetado ZIP de múltiples certificados. |
| **Hosting** | Vercel | — | Plataforma optimizada para Next.js. Despliegue automático desde GitHub, previews por branch, edge functions. |
| **CI/CD** | GitHub + Vercel | — | Push a GitHub dispara build automático en Vercel. Sin pipeline CI/CD custom adicional por ahora. |
| **Testing** | — | — | Sin framework de testing configurado todavía. Pendiente de implementar. |

---

## 2. Decisiones Clave y Alternativas Descartadas

### Framework Frontend — Next.js 16 (App Router)

**Elegido: Next.js 16 con App Router.**
Framework full-stack que unifica frontend y backend en un solo proyecto. El App Router permite organización por carpetas, layouts anidados, y Server Components. Las API Routes integradas eliminan la necesidad de un backend separado para esta etapa del proyecto.

**Descartado:**
- **Vite + React** — No incluye backend integrado; habría requerido un servidor Express/Fastify separado, duplicando infraestructura para un equipo pequeño.
- **Remix** — Ecosistema más pequeño, menor cantidad de componentes y ejemplos disponibles. Menor integración con Vercel.

### Base de datos — Supabase PostgreSQL

**Elegido: Supabase PostgreSQL.**
Migración completada desde SQLite/Prisma a Supabase. PostgreSQL cloud-hosted con RLS policies, Auth integrado, Storage incluido y panel de administración web. Supabase JS client para queries directas sin ORM intermediario.

**Descartado (anteriores):**
- **SQLite (Prisma)** — Usado en desarrollo inicial. Limitaciones: sin concurrencia real, sin enums nativos, JSON stringified. Migrado a Supabase.
- **MongoDB** — Modelo relacional es más adecuado para las relaciones complejas del proyecto (User ↔ Client ↔ Project ↔ TimeLog ↔ Goal).

### Autenticación — Supabase Auth (@supabase/ssr)

**Elegido: Supabase Auth con SSR.**
Sesiones persistentes con cookies httpOnly manejadas automáticamente por `@supabase/ssr`. Refresh tokens automáticos, sin necesidad de lógica custom de expiración. AuthContext detecta sesión vía `onAuthStateChange()` y carga perfil desde tabla `users`.

**Descartado (anteriores):**
- **bcryptjs custom** — Usado en versión anterior. Sesiones no persistentes (se perdían al recargar). Migrado a Supabase Auth.
- **NextAuth.js / Auth.js** — Sobredimensionado para una app interna sin necesidad de OAuth/SSO.
- **Clerk** — Costo recurrente injustificado para un MVP con ~20 usuarios internos.

### Rendimiento — DashboardRouter Keep-Alive

**Elegido: Patrón keep-alive con display:none.**
Los componentes se montan la primera vez que el usuario los visita y permanecen montados (ocultos) en navegaciones posteriores. Esto elimina re-fetches y re-renders, haciendo la navegación instantánea.

**Descartado:**
- **SWR / React Query** — Añade dependencia para resolver un problema que el keep-alive resuelve sin librerías.
- **Unmount/remount estándar** — Causaba ~5 segundos de espera por click al re-disparar todos los fetches.

### Hosting / Deploy — Vercel

**Elegido: Vercel.**
Plataforma nativa para Next.js con despliegue zero-config. Preview deployments automáticos por PR, SSL incluido, CDN global. Plan gratuito suficiente para el MVP.

**Descartado:**
- **AWS (EC2/ECS)** — Complejidad operacional excesiva para un equipo pequeño.
- **Railway / Render** — Menos optimizados para Next.js.

---

## 3. Variables de Entorno

```bash
# NUNCA commitear valores reales — usar .env.example

# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# ===== BASE DE DATOS (legacy Prisma) =====
DATABASE_URL="postgresql://..."

# ===== APP =====
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Design System

### 4.1 Colores

```css
/* APM Group Corporate Palette */

/* Core */
--background: #ffffff;
--foreground: #111827;
--surface: #f3f4f6;
--surface-hover: #e5e7eb;
--border: #e5e7eb;
--border-light: #f3f4f6;

/* Texto */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;

/* Acentos */
--primary: #b4c307;              /* Color principal de marca APM Group — Verde lima corporativo */
--primary-hover: #9aaa06;
--primary-light: #e8ed9e;
--accent-success: #22c55e;
--accent-warning: #f59e0b;
--accent-error: #ef4444;
--accent-info: #3b82f6;
```

### 4.2 Tipografía

```
Headings: Poppins (600, 700)
Body: Poppins (300, 400, 500)
Monospace: Fuente del sistema (monospace)
```

### 4.3 Tema

```
Modo: Light (modo único)
Estilo: Corporativo / Limpio
Inspiración: Dashboards empresariales tipo Monday.com, Notion, Linear
Sidebar: 260px fijo (fondo blanco) | Navbar: 64px de alto (fondo blanco)
```

---

## 5. Dependencias Principales

### 5.1 Producción

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "@supabase/ssr": "^0.9.0",
  "@supabase/supabase-js": "^2.100.1",
  "@prisma/client": "^5.22.0",
  "@prisma/adapter-pg": "^7.5.0",
  "bcryptjs": "^3.0.3",
  "lucide-react": "^1.6.0",
  "jspdf": "^4.2.1",
  "jszip": "^3.10.1",
  "qrcode": "^1.5.4",
  "xlsx": "^0.18.5",
  "file-saver": "^2.0.5",
  "pg": "^8.20.0",
  "sqlite3": "^6.0.1"
}
```

### 5.2 Desarrollo

```json
{
  "typescript": "^5",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "prisma": "^5.22.0",
  "eslint": "^9",
  "eslint-config-next": "16.2.1",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@types/bcryptjs": "^2.4.6",
  "@types/pg": "^8.20.0",
  "@types/file-saver": "^2.0.7",
  "@types/qrcode": "^1.5.6"
}
```

---

## 6. Configuraciones Clave

### 6.1 TypeScript
```json
// tsconfig.json — configuraciones importantes
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  }
}
```

### 6.2 ESLint
```
- eslint-config-next/core-web-vitals (reglas de rendimiento web)
- eslint-config-next/typescript (reglas de TS)
- Ignores: .next/**, out/**, build/**, next-env.d.ts
```

### 6.3 PostCSS
```
Plugin: @tailwindcss/postcss (integración Tailwind v4)
```

### 6.4 Supabase Client
```
Browser: src/lib/supabase/client.ts — createBrowserClient (para componentes "use client")
Server:  src/lib/supabase/server.ts — createServerClient con cookies (para API Routes)
Auth Guard: src/lib/auth-guard.ts — requireRole() para verificar permisos server-side
```

### 6.5 Performance
```
DashboardRouter: Patrón keep-alive — componentes visitados permanecen montados
Fetch Cache: src/lib/fetch-cache.ts — caché en memoria con TTL configurable (60s default)
Fetches paralelos: ConsultorDashboard usa Promise.all() para 3 endpoints simultáneos
```

---

## 7. Límites y Restricciones Técnicas

| Restricción | Detalle | Impacto |
|------------|---------|---------|
| Supabase Free tier | 500MB DB, 1GB Storage, 50K auth users | Suficiente para MVP, upgrade a Pro cuando se necesite |
| Prisma legacy | Prisma client aún presente pero sin uso activo | Pendiente de eliminar para reducir tamaño de bundle |
| Vercel timeout | 60 segundos máximo en API Routes (plan gratuito) | Operaciones de subida de archivos y reportes deben ser eficientes |
| Keep-alive memory | Componentes montados consumen memoria del navegador | Aceptable para <20 vistas; implementar LRU eviction si crece |
| Fetch cache in-memory | Se pierde al recargar la página | Aceptable — el keep-alive evita navegaciones redundantes |
| Sin validación con Zod | Validación manual de inputs en cada API Route | Propenso a errores. Implementar Zod para validación centralizada |
