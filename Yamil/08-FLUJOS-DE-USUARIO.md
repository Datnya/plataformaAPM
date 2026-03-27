# {{NOMBRE_DEL_PROYECTO}} — Flujos de Usuario

> **Version:** 0.1.0 | **Ultima actualizacion:** {{FECHA}}
> **Objetivo:** Documentar cada interaccion usuario → interfaz → sistema → resultado

---

## 1. Onboarding (Primera Vez)

<!-- LLENAR: El flujo completo de un usuario nuevo -->

```
┌──────────── LANDING PAGE ────────────┐
│                                      │
│  {{CTA_PRINCIPAL — ej: "Empieza ya"}}│
│                                      │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────── REGISTRO ────────────────┐
│                                      │
│  {{METODO — ej: Email + Google OAuth}}│
│  → Crear cuenta en {{AUTH_PROVIDER}} │
│  → Auto-crear perfil en DB          │
│                                      │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────── SETUP INICIAL ───────────┐
│  (OPCIONAL — Solo si tu app necesita │
│   configuracion inicial)             │
│                                      │
│  Step 1: {{PREGUNTA/ACCION}}         │
│  Step 2: {{PREGUNTA/ACCION}}         │
│  Step 3: {{PREGUNTA/ACCION}}         │
│                                      │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────── DASHBOARD ───────────────┐
│                                      │
│  {{QUE_VE_EL_USUARIO_POR_PRIMERA_VEZ}}│
│                                      │
└──────────────────────────────────────┘
```

**Backend Flow:**
```
1. {{PASO — ej: "POST /api/auth/signup con email + password"}}
2. {{PASO — ej: "Auth provider crea usuario"}}
3. {{PASO — ej: "Trigger: auto-crear perfil en tabla profiles"}}
4. {{PASO — ej: "Crear organizacion default (si multi-tenant)"}}
5. {{PASO — ej: "Redirigir a /dashboard"}}
```

---

## 2. {{FLUJO_PRINCIPAL — ej: "Crear un Pedido"}}

### Interfaz

```
<!-- LLENAR: Mockup ASCII de la interfaz -->
[EJEMPLO]
┌──────────── /{{ruta}} ───────────────┐
│                                      │
│  {{TITULO_DE_LA_PAGINA}}             │
│                                      │
│  ┌────── Formulario ──────────────┐  │
│  │                                │  │
│  │  {{Campo 1}}: [____________]   │  │
│  │  {{Campo 2}}: [____________]   │  │
│  │  {{Campo 3}}: [▼ dropdown  ]   │  │
│  │                                │  │
│  │  [Cancelar]  [{{Accion}} →]    │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### Data Flow

```
1. {{PASO — ej: "Usuario llena formulario"}}
2. {{PASO — ej: "Frontend valida con Zod"}}
3. {{PASO — ej: "POST /api/{{recurso}}"}}
4. {{PASO — ej: "Backend verifica auth + permisos"}}
5. {{PASO — ej: "Validar reglas de negocio"}}
6. {{PASO — ej: "Insert en DB"}}
7. {{PASO — ej: "Enviar notificacion (si aplica)"}}
8. {{PASO — ej: "Retornar resultado al frontend"}}
9. {{PASO — ej: "Mostrar confirmacion"}}
```

### Resultado
```
{{QUE_VE_EL_USUARIO_DESPUES — ej: "El pedido aparece en la lista con status 'Pendiente'"}}
```

---

## 3. {{SEGUNDO_FLUJO — ej: "Editar Perfil / Configuracion"}}

### Interfaz

```
<!-- LLENAR: Mockup ASCII -->
┌──────────── /{{ruta}} ───────────────┐
│                                      │
│  {{CONTENIDO}}                       │
│                                      │
└──────────────────────────────────────┘
```

### Data Flow

```
1. {{PASO}}
2. {{PASO}}
3. {{PASO}}
```

---

## 4. {{TERCER_FLUJO — ej: "Buscar / Filtrar"}} (OPCIONAL)

### Interfaz

```
┌──────────── /{{ruta}} ───────────────┐
│                                      │
│  {{CONTENIDO}}                       │
│                                      │
└──────────────────────────────────────┘
```

### Data Flow

```
1. {{PASO}}
2. {{PASO}}
```

---

## 5. {{FLUJO_DE_PAGO}} (OPCIONAL — si cobras)

```
<!-- LLENAR: Flujo de suscripcion o pago -->
[EJEMPLO]
1. Usuario va a /settings/billing
2. Click "Cambiar Plan"
3. Selecciona plan Pro ($29/mes)
4. Redirigido a Stripe Checkout
5. Completa pago
6. Stripe webhook: subscription.created
7. Backend actualiza plan en DB
8. Usuario redirigido a /dashboard con plan activo
```

---

## 6. {{FLUJO_DE_NOTIFICACIONES}} (OPCIONAL)

```
<!-- LLENAR: Como se enteran los usuarios de eventos -->
[EJEMPLO]
Evento: Nuevo pedido recibido
  → In-app: Badge en sidebar "3 nuevos"
  → Email: Template "Nuevo pedido #123" (via Resend)
  → Push: (futuro) Notificacion push al movil
```

---

## 7. Manejo de Errores (CRITICO)

<!-- LLENAR: Que ve el usuario cuando algo falla -->

### 7.1 Errores Comunes

| Error | Cuando ocurre | Que ve el usuario | Que pasa en backend |
|-------|--------------|-------------------|-------------------|
| 401 Unauthorized | Token expirado | Redirigir a /sign-in | Middleware rechaza request |
| 403 Forbidden | Sin permisos | "No tienes permiso para esta accion" | Verificacion de rol falla |
| 404 Not Found | Recurso no existe | Pagina 404 custom | Query retorna null |
| 422 Validation | Datos invalidos | Errores en formulario (campo por campo) | Zod validation falla |
| 429 Rate Limit | Muchos requests | "Demasiados intentos, espera X segundos" | Rate limiter activo |
| 500 Internal | Bug en el codigo | "Algo salio mal, intenta de nuevo" | Error loggeado en Sentry |

### 7.2 Paginas de Error
```
/404 — {{DESCRIPCION — ej: "Pagina no encontrada con link a home"}}
/500 — {{DESCRIPCION — ej: "Error generico con boton de reintentar"}}
/maintenance — {{DESCRIPCION — ej: "En mantenimiento, volvemos pronto"}} (OPCIONAL)
```

---

## 8. Diagrama de Secuencia (OPCIONAL)

<!-- LLENAR: Para flujos complejos, un diagrama temporal ayuda mucho -->

```
[EJEMPLO — Flujo con API externa]

 Usuario          Frontend         Backend          API Externa       DB
   │                 │                │                │               │
   │ Click "Crear"   │                │                │               │
   │ ───────────────>│                │                │               │
   │                 │ POST /api/x    │                │               │
   │                 │ ──────────────>│                │               │
   │                 │                │ Validate       │               │
   │                 │                │ ──────────────>│               │
   │                 │                │                │               │
   │                 │                │ <──────────────│               │
   │                 │                │ result         │               │
   │                 │                │ ───────────────────────────────>│
   │                 │                │               INSERT           │
   │                 │ <──────────────│                │               │
   │                 │ response       │                │               │
   │ <───────────────│                │                │               │
   │ "Creado!"       │                │                │               │
```

---

## 9. Estados de la UI (OPCIONAL)

<!-- LLENAR: Estados visuales de componentes clave -->

### {{Componente Principal — ej: "Lista de Pedidos"}}

| Estado | Que ve el usuario | Condicion |
|--------|------------------|-----------|
| Loading | Skeleton / spinner | Datos cargando |
| Empty | "No hay {{recurso}} aun. Crea el primero" | 0 resultados |
| Populated | Lista con items | > 0 resultados |
| Error | "Error al cargar. Reintentar" | Fetch fallo |
| Filtered empty | "No hay resultados para '{{busqueda}}'" | Filtro sin matches |

---

## Protocolo de Actualizacion

Este documento se actualiza cuando:
- Se agrega una nueva pagina o flujo
- Cambia el flujo de autenticacion
- Se agregan integraciones con servicios externos
- Feedback de usuarios indica confusion en algun flujo
