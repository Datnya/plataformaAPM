# {{NOMBRE_DEL_PROYECTO}} — Logica de Negocio

> **Version:** 0.1.0 | **Ultima actualizacion:** {{FECHA}}

---

## 1. Modelo de Negocio

### 1.1 Propuesta de Valor

<!-- LLENAR: Resumen ejecutivo de como funciona tu negocio -->

**El problema:** {{PROBLEMA_EN_UNA_ORACION}}

**La solucion:** {{SOLUCION_EN_UNA_ORACION}}

**Diferenciador clave:** {{QUE_TE_HACE_UNICO}}

**Como gano dinero:** {{MODELO_DE_INGRESOS_EN_UNA_ORACION}}

### 1.2 Planes y Pricing

| Plan | Precio/mes | Limites clave | Target |
|------|-----------|--------------|--------|
| {{PLAN_1}} | ${{PRECIO}} | {{LIMITES}} | {{PARA_QUIEN}} |
| {{PLAN_2}} | ${{PRECIO}} | {{LIMITES}} | {{PARA_QUIEN}} |
| {{PLAN_3}} | ${{PRECIO}} | {{LIMITES}} | {{PARA_QUIEN}} |

### 1.3 Fuentes de Ingreso

```
1. {{FUENTE_PRINCIPAL — ej: Suscripcion mensual}}
2. {{FUENTE_SECUNDARIA — ej: Setup fee / onboarding}} (OPCIONAL)
3. {{FUENTE_TERCIARIA — ej: Comisiones / marketplace}} (OPCIONAL)
```

---

## 2. Roles y Permisos (CRITICO)

<!-- LLENAR: Define EXACTAMENTE que puede hacer cada tipo de usuario -->
<!-- El agente usara esta tabla para implementar permisos correctamente -->

### 2.1 Roles por Organizacion

| Permiso | {{ROL_1 — ej: Owner}} | {{ROL_2 — ej: Admin}} | {{ROL_3 — ej: Member}} | {{ROL_4 — ej: Viewer}} |
|---------|------|-------|--------|--------|
| Ver dashboard | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Crear {{recurso_1}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Editar {{recurso_1}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Eliminar {{recurso_1}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Crear {{recurso_2}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Gestionar miembros | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Ver billing | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Cambiar plan | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Gestionar API keys | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |
| Configuracion avanzada | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} | {{SI/NO}} |

### 2.2 Logica de Permisos en Codigo
```typescript
// <!-- LLENAR: Como se verifica en codigo -->
[EJEMPLO]
// Verificar permiso antes de accion
const canDelete = ['owner', 'admin'].includes(user.role)
if (!canDelete) return { error: 'No tienes permiso', status: 403 }
```

---

## 3. Ciclos de Vida de Entidades (CRITICO)

<!-- LLENAR: Para cada entidad principal, define sus estados y transiciones -->

### 3.1 {{ENTIDAD_1 — ej: "Pedido"}}

**Estados posibles:**
```
{{ESTADO_1 — ej: draft}} → {{ESTADO_2 — ej: pending}} → {{ESTADO_3 — ej: processing}}
                                    ↓                           ↓
                              {{cancelled}}              {{completed}} / {{failed}}
```

**Transiciones permitidas:**
| De | A | Quien puede | Condiciones |
|----|---|------------|------------|
| {{ESTADO_1}} | {{ESTADO_2}} | {{ROL}} | {{CONDICION — ej: "Todos los campos requeridos llenos"}} |
| {{ESTADO_2}} | {{ESTADO_3}} | {{ROL}} | {{CONDICION — ej: "Pago confirmado"}} |
| {{ESTADO_2}} | cancelled | {{ROL}} | {{CONDICION}} |
| {{ESTADO_3}} | {{ESTADO_4}} | {{ROL}} | {{CONDICION}} |
| {{ESTADO_3}} | failed | System | {{CONDICION — ej: "Error en procesamiento"}} |

**Reglas de negocio:**
```
- {{REGLA — ej: "Un pedido cancelado no puede reactivarse"}}
- {{REGLA — ej: "Solo se puede cancelar antes de que empiece el procesamiento"}}
- {{REGLA — ej: "Al completarse, se envia email de confirmacion automatico"}}
```

### 3.2 {{ENTIDAD_2 — ej: "Usuario"}} (OPCIONAL)

**Estados posibles:**
```
{{ESTADOS_Y_TRANSICIONES}}
```

### 3.3 {{ENTIDAD_3 — ej: "Suscripcion"}} (OPCIONAL)

**Estados posibles:**
```
{{ESTADOS_Y_TRANSICIONES}}
```

---

## 4. Reglas de Negocio Generales (CRITICO)

<!-- LLENAR: Lista TODAS las reglas que el agente debe respetar al escribir codigo -->

### 4.1 Validaciones de Datos
```
<!-- LLENAR: Que validaciones son obligatorias? -->
[EJEMPLO]
- Email: debe ser unico por organizacion
- Nombre: minimo 2 caracteres, maximo 100
- Precio: nunca negativo, maximo 2 decimales
- Telefono: formato E.164 (+521234567890)
- Fecha: nunca en el pasado para nuevas reservas
```

### 4.2 Limites del Sistema
```
<!-- LLENAR: Que limites tiene cada plan? -->
[EJEMPLO]
Plan Free:
- Maximo 100 {{recursos}} por mes
- Maximo 3 miembros
- Sin acceso a API
- Retencion de datos: 30 dias

Plan Pro:
- Maximo 10,000 {{recursos}} por mes
- Maximo 25 miembros
- Acceso completo a API
- Retencion de datos: 1 ano
```

### 4.3 Reglas de Eliminacion
```
<!-- LLENAR: Que pasa cuando se elimina algo? -->
[EJEMPLO]
- Eliminar organizacion: soft-delete (marcar is_deleted=true, no borrar datos)
- Eliminar usuario: desactivar, mantener datos 90 dias, luego hard-delete
- Eliminar {{recurso}}: eliminacion inmediata si status=draft, prohibido si status=active
```

### 4.4 Reglas de Notificacion
```
<!-- LLENAR: Cuando se envian notificaciones automaticas? -->
[EJEMPLO]
- Nuevo miembro se une: email de bienvenida
- {{Recurso}} creado: notificacion in-app al owner
- Pago fallido: email + notificacion in-app urgente
- Plan por expirar: email 7 dias antes
```

---

## 5. Flujos de Negocio Detallados

### 5.1 {{FLUJO_PRINCIPAL — ej: "Proceso de Compra"}}

```
<!-- LLENAR: Paso a paso detallado del flujo mas importante -->
[EJEMPLO]
1. Usuario navega a /productos
2. Selecciona producto → agrega al carrito
3. Click "Checkout" → /checkout
4. Sistema verifica:
   a. ¿Producto en stock? → Si: continuar. No: mostrar error
   b. ¿Usuario autenticado? → Si: continuar. No: redirigir a login
5. Usuario llena datos de envio
6. Sistema calcula:
   a. Subtotal
   b. Impuestos (16% IVA Mexico)
   c. Envio (basado en CP y peso)
   d. Total
7. Usuario selecciona metodo de pago
8. Sistema crea PaymentIntent en Stripe
9. Usuario confirma pago
10. Stripe webhook: payment_intent.succeeded
11. Sistema:
    a. Actualiza orden status → 'paid'
    b. Reduce stock del producto
    c. Envia email de confirmacion
    d. Notifica al admin
12. Resultado: orden confirmada, usuario ve pagina de exito
```

### 5.2 {{FLUJO_SECUNDARIO — ej: "Onboarding de Nuevo Usuario"}} (OPCIONAL)

```
{{PASOS_DETALLADOS}}
```

### 5.3 {{FLUJO_TERCIARIO — ej: "Proceso de Reembolso"}} (OPCIONAL)

```
{{PASOS_DETALLADOS}}
```

---

## 6. Integraciones de Negocio (OPCIONAL)

### 6.1 Pagos (si aplica)
```
Proveedor: {{ej: Stripe}}
Flujo: {{DESCRIBIR — ej: "Checkout hosted → webhook → actualizar DB"}}
Eventos clave:
- {{EVENTO}} → {{ACCION_EN_TU_SISTEMA}}
- {{EVENTO}} → {{ACCION_EN_TU_SISTEMA}}
```

### 6.2 Email Transaccional (si aplica)
```
Proveedor: {{ej: Resend, SendGrid}}
Emails automaticos:
- {{TRIGGER}} → {{TEMPLATE_DE_EMAIL}}
- {{TRIGGER}} → {{TEMPLATE_DE_EMAIL}}
```

### 6.3 {{OTRA_INTEGRACION}} (OPCIONAL)
```
{{DESCRIBIR}}
```

---

## 7. Metricas de Negocio

### 7.1 KPIs del Dashboard

<!-- LLENAR: Que metricas muestra tu dashboard principal? -->

| Metrica | Fuente | Refresh |
|---------|--------|---------|
| {{METRICA — ej: "Ingresos del mes"}} | {{FUENTE — ej: "billing_events"}} | {{FRECUENCIA — ej: "Diario"}} |
| {{METRICA — ej: "Usuarios activos"}} | {{FUENTE — ej: "user_sessions"}} | {{FRECUENCIA}} |
| {{METRICA — ej: "Tasa de conversion"}} | {{FUENTE — ej: "orders / visitors"}} | {{FRECUENCIA}} |
| {{METRICA — ej: "Tickets abiertos"}} | {{FUENTE}} | {{FRECUENCIA}} |

### 7.2 Reportes (OPCIONAL)
```
<!-- LLENAR: Que reportes genera tu sistema? -->
- {{REPORTE}} — {{FRECUENCIA}} — {{PARA_QUIEN}}
- {{REPORTE}} — {{FRECUENCIA}} — {{PARA_QUIEN}}
```

---

## 8. Glosario de Terminos

<!-- LLENAR: Terminos especificos de tu dominio que el agente debe conocer -->

| Termino | Definicion |
|---------|-----------|
| {{TERMINO}} | {{DEFINICION}} |
| {{TERMINO}} | {{DEFINICION}} |
| {{TERMINO}} | {{DEFINICION}} |
| {{TERMINO}} | {{DEFINICION}} |
