# {{NOMBRE_DEL_PROYECTO}} — CLAUDE.md

> **Version:** 0.1.0 | **Branch:** `{{BRANCH_PRINCIPAL}}` | **Ultima actualizacion:** {{FECHA}}
> **Owner:** {{TU_NOMBRE_O_EMPRESA}}
> **Stack:** {{RESUMEN_DEL_STACK — ej: Next.js 15 + Supabase + Tailwind}}

---

## 1. Que es este proyecto

<!-- LLENAR: Describe tu proyecto en 2-3 parrafos. Que hace, para quien, y por que existe. -->

**{{NOMBRE_DEL_PROYECTO}}** es {{TIPO_DE_PRODUCTO — ej: "una plataforma SaaS", "una app movil", "un marketplace"}} que permite a {{USUARIOS_TARGET}} {{ACCION_PRINCIPAL — ej: "gestionar sus inventarios con IA"}}.

**Problema:** {{DESCRIPCION_DEL_PROBLEMA}}

**Solucion:** {{COMO_LO_RESUELVES}}

**Pipeline Principal:**
```
<!-- LLENAR: Describe el flujo de datos principal de tu app -->
[EJEMPLO]
Usuario → Dashboard → Accion → Backend → Base de datos → Resultado → Notificacion
```

**Usuarios Target:** {{DESCRIPCION_DE_USUARIOS}}

---

## 2. Estado actual del proyecto

<!-- LLENAR: Actualizar esto CADA VEZ que completes una fase o sprint -->

### Completado
| Fase | Descripcion | Estado | Fecha |
|------|-------------|--------|-------|
| {{FASE}} | {{DESCRIPCION}} | Done | {{FECHA}} |
<!-- Agregar filas a medida que completes fases -->

### En Progreso
| Fase | Descripcion | Estado | Notas |
|------|-------------|--------|-------|
| {{FASE}} | {{DESCRIPCION}} | En progreso | {{NOTAS}} |

### Por Construir
| Fase | Descripcion | Prioridad |
|------|-------------|-----------|
| {{FASE}} | {{DESCRIPCION}} | {{HIGH/MEDIUM/LOW}} |

### Build Status
```
<!-- LLENAR: Comandos para verificar que el proyecto compila -->
npm run build          # Debe pasar antes de cualquier PR
npx tsc --noEmit       # TypeScript sin errores (si aplica)
npm test               # Tests pasan
```

---

## 3. Documentos de Referencia

<!-- LLENAR: Actualiza las rutas segun donde coloques cada documento -->

| Que necesito | Archivo |
|--------------|---------|
| Arquitectura del sistema | `docs/ARQUITECTURA.md` |
| Schema de base de datos | `docs/ESQUEMA-DB.md` |
| Stack tecnologico | `docs/STACK.md` |
| Plan de implementacion | `docs/PLAN.md` |
| Logica de negocio | `docs/NEGOCIO.md` |
| Flujos de usuario | `docs/FLUJOS.md` |
| Este archivo | `CLAUDE.md` |

---

## 4. Reglas Cardinales (CRITICO)

<!-- LLENAR: Define las reglas que NUNCA se deben romper en tu proyecto -->

### 4.1 {{REGLA_PRINCIPAL — ej: "Seguridad de datos"}}
<!-- LLENAR: Regla mas importante de tu proyecto -->
```
[EJEMPLO]
- Toda tabla tiene RLS habilitado. Sin excepciones.
- Input sanitization en toda entrada de usuario.
- API keys nunca en el frontend.
```

### 4.2 {{SEGUNDA_REGLA — ej: "Autenticacion"}}
<!-- LLENAR -->
```
[EJEMPLO]
- Toda ruta API verifica autenticacion.
- Tokens JWT con expiracion de 1 hora.
- Refresh tokens rotan en cada uso.
```

### 4.3 {{TERCERA_REGLA — ej: "Calidad de codigo"}}
<!-- LLENAR -->
```
[EJEMPLO]
- TypeScript strict mode habilitado.
- No usar 'any' — siempre tipos explicitos.
- Tests para toda logica de negocio.
```

### 4.4 (OPCIONAL) Restricciones de Base de Datos
<!-- LLENAR: Constraints que causan errores si se violan -->
```
[EJEMPLO]
- tabla.status solo acepta: 'active' | 'inactive' | 'suspended'
- tabla.tipo solo acepta: 'free' | 'pro' | 'enterprise'
- NUNCA usar valores no definidos en los enums
```

---

## 5. Convenciones de Codigo

### 5.1 Idioma
<!-- LLENAR -->
```
- Comunicacion con el equipo: {{IDIOMA — ej: Espanol}}
- Codigo, comentarios, commits: {{IDIOMA — ej: Ingles}}
- Nombres de variables/funciones: {{FORMATO — ej: camelCase}}
- Nombres de archivos: {{FORMATO — ej: kebab-case}}
- Componentes React/Vue: {{FORMATO — ej: PascalCase}}
```

### 5.2 Commits
```
<!-- LLENAR: Tu formato de commits -->
[EJEMPLO — Conventional Commits]
feat|fix|docs|test|refactor|chore: descripcion en ingles

[EJEMPLO — Simple]
Descripcion de lo que se hizo
```

### 5.3 Branching
```
<!-- LLENAR: Tu estrategia de branches -->
[EJEMPLO]
main       ← produccion (solo PRs)
  └─ develop ← desarrollo activo
       ├─ feature/nombre
       ├─ fix/nombre
       └─ docs/nombre
```

---

## 6. Patrones de Codigo Importantes (CRITICO)

<!-- LLENAR: Patrones que el agente DEBE seguir al escribir codigo -->

### Patron de Autenticacion
```typescript
// <!-- LLENAR: Tu patron de auth en API routes -->
[EJEMPLO]
import { auth } from '@/lib/auth'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  // ... logica
}
```

### Patron de Acceso a Base de Datos
```typescript
// <!-- LLENAR: Como accedes a tu DB -->
[EJEMPLO]
import { db } from '@/lib/db'

const items = await db
  .from('tabla')
  .select('*')
  .eq('org_id', orgId)
```

### Patron de Manejo de Errores
```typescript
// <!-- LLENAR: Como manejas errores -->
[EJEMPLO]
try {
  const result = await someOperation()
  return NextResponse.json(result)
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```

---

## 7. Estructura del Proyecto

```
<!-- LLENAR: La estructura de carpetas de tu proyecto -->
[EJEMPLO para Next.js]
src/
├── app/
│   ├── api/            ← API routes
│   ├── (auth)/         ← Paginas de login/registro
│   └── (dashboard)/    ← Paginas protegidas
├── components/         ← Componentes reutilizables
├── lib/                ← Utilidades y servicios
│   ├── db.ts           ← Cliente de base de datos
│   ├── auth.ts         ← Configuracion de auth
│   └── utils.ts        ← Helpers generales
└── types/              ← Tipos TypeScript
```

---

## 8. Modos de Operacion del Agente

<!-- Puedes mantener estos modos o adaptarlos a tu flujo de trabajo -->

### `/architect` — Solo planificacion (sin codigo)
- Lee el codebase, analiza, propone planes
- Output: arquitectura, trade-offs, preguntas

### `/execute` — Implementacion
- Construye segun plan aprobado
- Verifica build al terminar

### `/audit` — Revision
- Analisis de seguridad y calidad
- Solo hallazgos con severidades, sin modificar codigo

### Validacion post-ejecucion:
```bash
<!-- LLENAR: Tus comandos de validacion -->
npm run build          # Build exitoso
npx tsc --noEmit       # TypeScript limpio (si aplica)
npm test               # Tests pasan
```

---

## 9. Condiciones de Stop

<!-- LLENAR: Cuando el agente DEBE detenerse y preguntarte -->

El agente debe detenerse y preguntar cuando:

- [ ] {{CONDICION — ej: "Operaciones destructivas en la base de datos"}}
- [ ] {{CONDICION — ej: "Push a la rama principal"}}
- [ ] {{CONDICION — ej: "Llamadas a APIs externas que cuestan dinero"}}
- [ ] {{CONDICION — ej: "Ambiguedad en los requisitos"}}
- [ ] {{CONDICION — ej: "Test critico falla y el fix no es obvio"}}
- [ ] {{CONDICION — ej: "Crear o modificar tablas en produccion"}}

---

## 10. Datos de Prueba (OPCIONAL)

<!-- LLENAR: IDs, credenciales de test, datos de demo -->
```
[EJEMPLO]
- Usuario de prueba: test@example.com / password123
- Organizacion de demo: org_demo_12345
- API key de sandbox: sk_test_xxxxx
```

---

## 11. Comandos Utiles

```bash
# <!-- LLENAR: Comandos que usas frecuentemente -->
[EJEMPLO]
npm run dev                    # Iniciar servidor de desarrollo
npm run build                  # Build de produccion
npm test                       # Correr tests
npm run db:migrate             # Aplicar migraciones
npm run db:seed                # Llenar datos de prueba
```

---

## Regla Final

Este documento:
- No se infiere
- No se flexibiliza
- No se interpreta creativamente

Es el marco obligatorio para todas las sesiones con el agente IA.
**Coherencia, trazabilidad y correctitud tienen prioridad sobre velocidad.**
