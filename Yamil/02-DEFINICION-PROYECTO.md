# {{NOMBRE_DEL_PROYECTO}} — Definicion del Proyecto

> **Version:** 0.1.0 | **Ultima actualizacion:** {{FECHA}}
> **Estado:** {{Pre-desarrollo / En desarrollo / MVP listo / En produccion}}

---

## 1. Resumen Ejecutivo

<!-- LLENAR: 3-5 oraciones que cualquier persona pueda leer y entender tu proyecto -->

**{{NOMBRE_DEL_PROYECTO}}** resuelve {{PROBLEMA}} para {{USUARIOS}}
mediante {{SOLUCION_EN_UNA_LINEA}}.

**Diferenciador clave:** {{QUE_TE_HACE_UNICO}}

**Modelo de ingresos:** {{COMO_GANAS_DINERO}}

**Estado actual:** {{EN_QUE_FASE_ESTAS}}

---

## 2. Problema

### 2.1 Descripcion del Problema
<!-- LLENAR -->
```
{{DESCRIPCION_DETALLADA_DEL_PROBLEMA}}
```

### 2.2 Impacto del Problema
<!-- LLENAR: Cuanto le cuesta al usuario NO resolver este problema? -->
```
- Tiempo perdido: {{HORAS_POR_SEMANA_O_MES}}
- Dinero perdido: {{ESTIMACION}}
- Frustracion: {{DESCRIBIR}}
```

### 2.3 Soluciones Actuales y sus Limitaciones
| Solucion Actual | Que hace bien | Que hace mal | Precio |
|-----------------|--------------|-------------|--------|
| {{COMPETIDOR_1}} | {{FORTALEZA}} | {{DEBILIDAD}} | {{PRECIO}} |
| {{COMPETIDOR_2}} | {{FORTALEZA}} | {{DEBILIDAD}} | {{PRECIO}} |
| {{HACERLO_MANUAL}} | {{FORTALEZA}} | {{DEBILIDAD}} | {{COSTO}} |

---

## 3. Solucion Propuesta

### 3.1 Vision del Producto
<!-- LLENAR -->
```
{{VISION_A_3_ANOS — como se ve tu producto cuando este "terminado"}}
```

### 3.2 Propuesta de Valor
<!-- LLENAR: Que obtiene el usuario que no puede obtener en otro lado? -->
```
Para {{USUARIO_TARGET}}
que necesita {{NECESIDAD}}
{{NOMBRE_DEL_PROYECTO}} es {{CATEGORIA_DE_PRODUCTO}}
que {{BENEFICIO_PRINCIPAL}}
a diferencia de {{ALTERNATIVA_PRINCIPAL}}
nuestro producto {{DIFERENCIADOR_CLAVE}}
```

### 3.3 Funcionalidades Principales (MVP)

| # | Funcionalidad | Descripcion | Prioridad | Estado |
|---|--------------|-------------|-----------|--------|
| 1 | {{FEATURE}} | {{DESCRIPCION}} | CRITICA | {{TODO/EN_PROGRESO/HECHO}} |
| 2 | {{FEATURE}} | {{DESCRIPCION}} | CRITICA | {{TODO/EN_PROGRESO/HECHO}} |
| 3 | {{FEATURE}} | {{DESCRIPCION}} | CRITICA | {{TODO/EN_PROGRESO/HECHO}} |
| 4 | {{FEATURE}} | {{DESCRIPCION}} | ALTA | {{TODO/EN_PROGRESO/HECHO}} |
| 5 | {{FEATURE}} | {{DESCRIPCION}} | MEDIA | {{TODO/EN_PROGRESO/HECHO}} |

### 3.4 Funcionalidades Post-MVP (Futuro)

| # | Funcionalidad | Descripcion | Cuando |
|---|--------------|-------------|--------|
| 1 | {{FEATURE}} | {{DESCRIPCION}} | {{FASE_O_FECHA}} |
| 2 | {{FEATURE}} | {{DESCRIPCION}} | {{FASE_O_FECHA}} |
| 3 | {{FEATURE}} | {{DESCRIPCION}} | {{FASE_O_FECHA}} |

---

## 4. Usuarios Target

### 4.1 Personas (User Personas)

#### Persona 1: {{NOMBRE_DESCRIPTIVO — ej: "El Restaurantero Ocupado"}}
```
Rol: {{ROL — ej: Dueno de restaurante}}
Edad: {{RANGO — ej: 35-50}}
Contexto: {{SITUACION — ej: Maneja 2 restaurantes, no tiene equipo tech}}
Frustracion principal: {{DOLOR — ej: Pierde reservas porque no contesta WhatsApp a tiempo}}
Lo que necesita: {{NECESIDAD — ej: Alguien que conteste por el 24/7}}
Como lo busca: {{CANAL — ej: Busca en Google "chatbot para restaurantes"}}
Disposicion a pagar: {{RANGO — ej: $50-200/mes si realmente funciona}}
```

#### Persona 2: {{NOMBRE_DESCRIPTIVO}} (OPCIONAL)
```
Rol: {{ROL}}
Edad: {{RANGO}}
Contexto: {{SITUACION}}
Frustracion principal: {{DOLOR}}
Lo que necesita: {{NECESIDAD}}
Disposicion a pagar: {{RANGO}}
```

### 4.2 Jobs-to-be-Done
<!-- LLENAR: Que "trabajo" contrata el usuario a tu producto para hacer? -->
```
Cuando {{SITUACION}},
quiero {{ACCION}},
para poder {{RESULTADO_DESEADO}}.
```

```
Cuando {{SITUACION}},
quiero {{ACCION}},
para poder {{RESULTADO_DESEADO}}.
```

---

## 5. Modelo de Negocio

### 5.1 Planes y Pricing

| Plan | Precio/mes | Limite 1 | Limite 2 | Limite 3 | Target |
|------|-----------|----------|----------|----------|--------|
| {{PLAN_1}} | ${{PRECIO}} | {{LIMITE}} | {{LIMITE}} | {{LIMITE}} | {{PARA_QUIEN}} |
| {{PLAN_2}} | ${{PRECIO}} | {{LIMITE}} | {{LIMITE}} | {{LIMITE}} | {{PARA_QUIEN}} |
| {{PLAN_3}} | ${{PRECIO}} | {{LIMITE}} | {{LIMITE}} | {{LIMITE}} | {{PARA_QUIEN}} |

### 5.2 Fuentes de Ingreso
<!-- LLENAR -->
```
1. {{FUENTE — ej: Suscripcion mensual}} — {{PORCENTAJE_ESTIMADO_DEL_INGRESO}}
2. {{FUENTE — ej: Setup fee / onboarding}} — {{PORCENTAJE}}
3. {{FUENTE — ej: Marketplace / comisiones}} — {{PORCENTAJE}}
```

### 5.3 Estructura de Costos
<!-- LLENAR: Cuanto te cuesta operar por mes -->
```
Infraestructura: ${{COSTO}}/mes ({{DESGLOSE}})
APIs externas: ${{COSTO}}/mes ({{DESGLOSE}})
Dominio + Email: ${{COSTO}}/mes
Total operativo: ${{TOTAL}}/mes
Break-even: {{CUANTOS_USUARIOS_PAGANDO_NECESITAS}}
```

---

## 6. Metricas de Exito

### 6.1 KPIs del MVP
| Metrica | Target (3 meses) | Como se mide |
|---------|-------------------|-------------|
| Usuarios registrados | {{NUMERO}} | {{HERRAMIENTA — ej: Supabase Auth count}} |
| Usuarios activos/semana | {{NUMERO}} | {{HERRAMIENTA}} |
| Usuarios de pago | {{NUMERO}} | {{HERRAMIENTA — ej: Stripe dashboard}} |
| MRR (Monthly Recurring Revenue) | ${{NUMERO}} | Stripe |
| Churn mensual | < {{PORCENTAJE}}% | {{HERRAMIENTA}} |
| NPS (satisfaccion) | > {{NUMERO}} | {{HERRAMIENTA — ej: encuesta}} |

### 6.2 North Star Metric
<!-- LLENAR: LA metrica que, si sube, todo lo demas sube -->
```
{{METRICA — ej: "Numero de mensajes respondidos automaticamente por semana"}}
```

---

## 7. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| {{RIESGO — ej: "Usuarios no confian en IA para responder"}} | {{Alta/Media/Baja}} | {{Alto/Medio/Bajo}} | {{PLAN — ej: "Modo revision antes de enviar"}} |
| {{RIESGO — ej: "Costo de APIs muy alto"}} | {{NIVEL}} | {{NIVEL}} | {{PLAN}} |
| {{RIESGO — ej: "Competidor grande lanza feature similar"}} | {{NIVEL}} | {{NIVEL}} | {{PLAN}} |

---

## 8. Timeline de Alto Nivel

| Fase | Descripcion | Duracion Estimada | Entregable |
|------|-------------|-------------------|-----------|
| 0 — Setup | Repo, auth, DB, infra basica | {{DURACION}} | Proyecto funcional con login |
| 1 — Core | {{DESCRIPCION}} | {{DURACION}} | {{ENTREGABLE}} |
| 2 — MVP | {{DESCRIPCION}} | {{DURACION}} | {{ENTREGABLE}} |
| 3 — Beta | {{DESCRIPCION}} | {{DURACION}} | {{ENTREGABLE}} |
| 4 — Launch | {{DESCRIPCION}} | {{DURACION}} | {{ENTREGABLE}} |

---

## Notas Adicionales

<!-- LLENAR: Cualquier contexto extra que el agente necesite saber -->
```
{{NOTAS}}
```
