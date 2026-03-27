# APM Group — Control de Proyectos — Stack Tecnológico

> **Versión:** 0.1.0 | **Última actualización:** 2026-03-26

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
| **Auth** | Custom (bcryptjs + API Routes) | ^3.0.3 | Autenticación propia con hash bcrypt para contraseñas. Login vía API Route `/api/auth/login`. Estado de sesión manejado en cliente con React Context. |
| **Base de datos** | SQLite (desarrollo) | — | Base de datos embebida sin servidor, ideal para desarrollo local y prototyping rápido. Archivo `dev.db` en el proyecto. |
| **ORM/Cliente DB** | Prisma | ^5.22.0 | ORM con generación automática de tipos TypeScript desde el esquema. Migraciones declarativas y queries type-safe. Cliente generado en `src/generated/prisma/client`. |
| **Hosting** | Vercel | — | Plataforma optimizada para Next.js. Despliegue automático desde GitHub, previews por branch, edge functions. |
| **CI/CD** | GitHub + Vercel | — | Push a GitHub dispara build automático en Vercel. Sin pipeline CI/CD custom adicional por ahora. |
| **Validación** | Validación manual en API Routes | — | Validación de datos directamente en los handlers de API Routes. Sin librería de validación externa configurada todavía. |
| **Testing** | — | — | Sin framework de testing configurado todavía. Pendiente de implementar. |

---

## 2. Decisiones Clave y Alternativas Descartadas

### Framework Frontend — Next.js 16 (App Router)

**Elegido: Next.js 16 con App Router.**
Framework full-stack que unifica frontend y backend en un solo proyecto. El App Router permite organización por carpetas, layouts anidados, y Server Components. Las API Routes integradas eliminan la necesidad de un backend separado para esta etapa del proyecto.

**Descartado:**
- **Vite + React** — No incluye backend integrado; habría requerido un servidor Express/Fastify separado, duplicando infraestructura para un equipo pequeño.
- **Remix** — Ecosistema más pequeño, menor cantidad de componentes y ejemplos disponibles. Menor integración con Vercel.

### Base de datos — SQLite (Prisma)

**Elegido: SQLite con Prisma ORM.**
Para la fase de desarrollo y MVP, SQLite permite iterar rápido sin configurar un servidor de base de datos. Prisma abstrae el SQL y genera tipos TypeScript automáticos. La migración a PostgreSQL será trivial cambiando solo el `provider` en `schema.prisma`.

**Descartado:**
- **PostgreSQL (Supabase)** — Planeado para producción, pero innecesario para desarrollo local. Añade latencia de red y dependencia de servicio externo durante el desarrollo.
- **MongoDB** — Modelo relacional es más adecuado para las relaciones complejas del proyecto (User ↔ Client ↔ Project ↔ TimeLog ↔ Goal).

### Autenticación — Custom con bcryptjs

**Elegido: Autenticación personalizada con bcryptjs.**
Implementación simple y directa: hash de contraseñas con bcrypt, verificación en API Route `/api/auth/login`, estado de sesión en React Context. Suficiente para una plataforma interna corporativa con pocos usuarios.

**Descartado:**
- **NextAuth.js / Auth.js** — Sobredimensionado para una app interna sin necesidad de OAuth/SSO. Añade complejidad innecesaria para login simple email/password.
- **Clerk** — Costo recurrente injustificado para un MVP con ~20 usuarios internos. Dependencia externa para funcionalidad básica.

### Hosting / Deploy — Vercel

**Elegido: Vercel.**
Plataforma nativa para Next.js con despliegue zero-config. Preview deployments automáticos por PR, SSL incluido, CDN global. Plan gratuito suficiente para el MVP.

**Descartado:**
- **AWS (EC2/ECS)** — Complejidad operacional excesiva para un equipo pequeño. Requiere configuración manual de CI/CD, SSL, balanceo de carga.
- **Railway / Render** — Menos optimizados para Next.js. Sin preview deployments automáticos.

### Estilos — Tailwind CSS v4

**Elegido: Tailwind CSS v4 con PostCSS.**
Clases utilitarias permiten prototyping rápido. Design system configurado con variables CSS custom (`--primary`, `--background`, etc.) para mantener consistencia de marca APM Group.

**Descartado:**
- **CSS Modules** — Mayor verbose para prototipos rápidos. Sin ventaja significativa para componentes custom.
- **styled-components** — Dependencia adicional con CSS-in-JS, problemas de performance con SSR, incompatible con Server Components de Next.js.

---

## 3. Variables de Entorno

```bash
# NUNCA commitear valores reales — usar .env.example

# ===== APP =====
NODE_ENV=development                    # development | production
NEXT_PUBLIC_APP_URL=http://localhost:3000  # URL pública de la app

# ===== BASE DE DATOS =====
DATABASE_URL="file:./dev.db"            # Ruta al archivo SQLite (desarrollo)
# DATABASE_URL="postgresql://..."       # Para producción con PostgreSQL
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
Sidebar: 260px fijo | Navbar: 64px de alto
```

---

## 5. Dependencias Principales

### 5.1 Producción

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "@prisma/client": "^5.22.0",
  "@prisma/adapter-pg": "^7.5.0",
  "bcryptjs": "^3.0.3",
  "lucide-react": "^1.6.0",
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
  "@types/pg": "^8.20.0"
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

### 6.4 Prisma
```
Provider: sqlite (desarrollo) → postgresql (producción)
Output del cliente: src/generated/prisma/client
Engine: library
Singleton pattern: src/lib/prisma.ts (evita múltiples conexiones en hot reload)
```

---

## 7. Límites y Restricciones Técnicas

| Restricción | Detalle | Impacto |
|------------|---------|---------|
| SQLite en desarrollo | No soporta enums nativos, concurrencia limitada, sin JSON nativo | Se usan strings con convenciones ("ADMIN", "CONSULTOR") y campos JSON stringified |
| Sin sesiones persistentes | Auth state solo en React Context (memoria del cliente) | Refrescar la página cierra la sesión. Pendiente implementar JWT o cookies httpOnly |
| Vercel timeout | 60 segundos máximo en API Routes (plan gratuito) | Operaciones de subida de archivos y reportes deben ser eficientes |
| SQLite file locking | Un solo writer a la vez | No apto para producción con múltiples usuarios concurrentes. Migrar a PostgreSQL |
| Sin validación con Zod | Validación manual de inputs en cada API Route | Propenso a errores. Implementar Zod para validación centralizada |
| Almacenamiento de archivos | Upload local vía API Route `/api/upload` | No persistente en Vercel (filesystem efímero). Migrar a Supabase Storage o S3 |
