# {{NOMBRE_DEL_PROYECTO}} — Plan de Implementacion

> **Version:** 0.1.0 | **Ultima actualizacion:** {{FECHA}}

---

## Estado del Sistema

### Completado
| Fase | Descripcion | Estado | Fecha | Commit/PR |
|------|-------------|--------|-------|-----------|
| — | — | — | — | — |
<!-- Agregar filas a medida que completes fases -->

### En Progreso
| Fase | Descripcion | Estado | Bloqueadores |
|------|-------------|--------|-------------|
| — | — | — | — |

### Por Construir
| Fase | Descripcion | Prioridad | Dependencias |
|------|-------------|-----------|-------------|
| — | — | — | — |

---

## FASE 0 — Setup Inicial

> **Prioridad:** CRITICA | **Duracion estimada:** {{TIEMPO}}
> **Objetivo:** Tener el proyecto funcionando con auth y pagina en blanco

### 0.1 — Inicializar Repositorio
```bash
# <!-- LLENAR: Comandos para inicializar tu proyecto -->
[EJEMPLO]
npx create-next-app@latest mi-proyecto --ts --tailwind --app
cd mi-proyecto
git init && git checkout -b develop
```

### 0.2 — Configurar Autenticacion
```
Tareas:
1. {{TAREA — ej: "Instalar Supabase SDK"}}
2. {{TAREA — ej: "Configurar middleware de auth"}}
3. {{TAREA — ej: "Crear paginas sign-in / sign-up"}}
4. {{TAREA — ej: "Probar: registrar usuario → login → ver dashboard"}}
```

**Archivos clave:**
```
<!-- LLENAR: Archivos que se crean en esta fase -->
src/
├── middleware.ts                # Auth guard
├── lib/auth.ts                 # Cliente de auth
├── app/(auth)/sign-in/page.tsx # Login
└── app/(auth)/sign-up/page.tsx # Registro
```

### 0.3 — Configurar Base de Datos
```
Tareas:
1. {{TAREA — ej: "Crear proyecto en Supabase"}}
2. {{TAREA — ej: "Ejecutar migracion inicial (ESQUEMA-DB.md)"}}
3. {{TAREA — ej: "Configurar RLS en todas las tablas"}}
4. {{TAREA — ej: "Probar: crear registro → leer → verificar aislamiento"}}
```

### 0.4 — Layout Base
```
Tareas:
1. {{TAREA — ej: "Instalar shadcn/ui + componentes base"}}
2. {{TAREA — ej: "Crear layout con sidebar + topbar"}}
3. {{TAREA — ej: "Paginas stub: /dashboard, /settings"}}
4. {{TAREA — ej: "Configurar tema y colores"}}
```

**Entregable Fase 0:** {{DESCRIPCION — ej: "App con login, dashboard vacio, DB configurada"}}

**Validacion:**
```bash
{{COMANDO_BUILD — ej: npm run build}}    # Debe pasar
{{COMANDO_TYPES — ej: npx tsc --noEmit}} # Debe estar limpio
```

---

## FASE 1 — {{NOMBRE — ej: "Core Features"}}

> **Prioridad:** {{ALTA/MEDIA}} | **Duracion estimada:** {{TIEMPO}}
> **Dependencias:** Fase 0 completada
> **Objetivo:** {{OBJETIVO_DE_ESTA_FASE}}

### 1.1 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
3. {{TAREA}}
4. {{TAREA}}
```

**Archivos clave:**
```
{{ESTRUCTURA_DE_ARCHIVOS}}
```

### 1.2 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
```

### 1.3 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
```

**Entregable Fase 1:** {{DESCRIPCION}}

**Validacion:**
```bash
{{COMANDOS_DE_VALIDACION}}
```

---

## FASE 2 — {{NOMBRE — ej: "UI y Dashboard"}}

> **Prioridad:** {{ALTA/MEDIA}} | **Duracion estimada:** {{TIEMPO}}
> **Dependencias:** {{QUE_FASES_DEBEN_ESTAR_LISTAS}}
> **Objetivo:** {{OBJETIVO}}

### 2.1 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
```

### 2.2 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
```

**Entregable Fase 2:** {{DESCRIPCION}}

---

## FASE 3 — {{NOMBRE — ej: "Integraciones"}}

> **Prioridad:** {{MEDIA}} | **Duracion estimada:** {{TIEMPO}}
> **Dependencias:** {{QUE_FASES_DEBEN_ESTAR_LISTAS}}
> **Objetivo:** {{OBJETIVO}}

### 3.1 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
```

**Entregable Fase 3:** {{DESCRIPCION}}

---

## FASE 4 — {{NOMBRE — ej: "MVP Launch"}}

> **Prioridad:** {{MEDIA}} | **Duracion estimada:** {{TIEMPO}}
> **Dependencias:** {{QUE_FASES_DEBEN_ESTAR_LISTAS}}
> **Objetivo:** {{OBJETIVO}}

### 4.1 — {{SUB-TAREA}}
```
Tareas:
1. {{TAREA}}
2. {{TAREA}}
```

**Entregable Fase 4:** {{DESCRIPCION}}

---

## FASE 5+ — Post-MVP (OPCIONAL)

<!-- LLENAR: Features que construiras despues del lanzamiento -->

| Fase | Feature | Descripcion | Prioridad |
|------|---------|-------------|-----------|
| 5 | {{FEATURE}} | {{DESCRIPCION}} | {{PRIORIDAD}} |
| 5 | {{FEATURE}} | {{DESCRIPCION}} | {{PRIORIDAD}} |
| 6 | {{FEATURE}} | {{DESCRIPCION}} | {{PRIORIDAD}} |
| 6 | {{FEATURE}} | {{DESCRIPCION}} | {{PRIORIDAD}} |

---

## Technical Debt Register

<!-- LLENAR: Deuda tecnica conocida que necesitas resolver eventualmente -->

| ID | Area | Issue | Prioridad | Cuando |
|----|------|-------|-----------|--------|
| TD-01 | {{AREA}} | {{DESCRIPCION}} | {{PRIORIDAD}} | {{CUANDO}} |
| TD-02 | {{AREA}} | {{DESCRIPCION}} | {{PRIORIDAD}} | {{CUANDO}} |
| TD-03 | {{AREA}} | {{DESCRIPCION}} | {{PRIORIDAD}} | {{CUANDO}} |

---

## Checklist Pre-Deploy (Antes de cada fase)

```
[ ] Build pasa sin errores
[ ] TypeScript limpio (si aplica)
[ ] Tests relevantes pasan
[ ] Variables de entorno configuradas
[ ] Migraciones de DB aplicadas
[ ] Revisado por el agente (/audit)
[ ] Branch actualizado con develop/main
[ ] PR creado con descripcion clara
```

---

## Protocolo de Actualizacion

Este documento se actualiza:

1. **Al completar una fase:** Mover de "Por Construir" a "Completado" con fecha y commit
2. **Al descubrir deuda tecnica:** Agregar al Technical Debt Register
3. **Al cambiar prioridades:** Re-ordenar fases pendientes
4. **Al inicio de cada sesion:** Verificar que el estado refleja la realidad

```
Tip para el agente:
"Revisa 07-PLAN-DE-IMPLEMENTACION.md y actualiza el estado de las fases
 basandote en los commits recientes"
```
