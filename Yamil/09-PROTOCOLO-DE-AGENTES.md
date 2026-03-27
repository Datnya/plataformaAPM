# {{NOMBRE_DEL_PROYECTO}} — Protocolo de Interaccion con Agentes IA

> **Ultima actualizacion:** {{FECHA}}
> **Para usar con:** Claude Code, Cursor, Windsurf, o cualquier agente IA

---

## Resumen

Este documento define como interactuar con agentes de IA para construir tu proyecto de manera eficiente. Define modos de trabajo, reglas de comunicacion, y protocolos para mantener la coherencia entre sesiones.

---

## Los 4 Modos de Sesion

### `/architect` — Modo Planificacion (Sin codigo)

**Activar con:** `"Modo /architect. [descripcion del feature]"`

**Comportamiento:**
- Solo lectura del codebase
- Output: planes, arquitectura, preguntas, trade-offs
- No escribe codigo, no modifica archivos

**Cuando usar:**
- Inicio de nueva fase o feature
- Antes de una refactorizacion grande
- Diseno de nuevo esquema de DB o API
- Evaluacion de trade-offs

### `/execute` — Modo Implementacion

**Activar con:** `"Modo /execute. Implementar: [descripcion concreta]"`

**Comportamiento:**
- Escribe codigo segun plan aprobado
- Verifica build al terminar
- Commits al final de cada sub-tarea

**Cuando usar:**
- Plan ya aprobado en modo `/architect`
- Tarea bien definida y acotada

### `/teach` — Modo Ensenanza

**Activar con:** `"Modo /teach. Explicame: [tema]"`

**Comportamiento:**
- Explica cada decision con alternativas
- Muestra el "por que" antes del "como"
- No modifica codigo

### `/audit` — Modo Revision

**Activar con:** `"Modo /audit. Revisar: [area]"`

**Comportamiento:**
- Analisis de seguridad + calidad + performance
- Produce reporte con severidades
- Sin modificaciones

---

## Protocolo de Inicio de Sesion

Al comenzar cada sesion de trabajo, el agente debe:

```
1. Leer CLAUDE.md (o 01-PROYECTO-CLAUDE.md) — estado actual + reglas
2. Leer MEMORY.md (si existe) — decisiones previas
3. Leer el documento relevante a la tarea:
   - Nuevo feature → 03-ARQUITECTURA.md + 07-PLAN.md
   - UI work → 08-FLUJOS.md
   - Bug fix → 03-ARQUITECTURA.md
   - DB changes → 06-ESQUEMA-DB.md
4. Anunciar: "He leido [documentos]. Entiendo que estamos en [fase]. Listo para [tarea]."
```

**Prompt de inicio recomendado:**
```
"Continuamos desde la sesion anterior. Lee CLAUDE.md y MEMORY.md para contexto.
 Estamos en la Fase {{X}}. La tarea de hoy es: {{TAREA}}."
```

---

## Protocolo de Cierre de Sesion

Al terminar cada sesion:

```
1. Commit del trabajo (si hay cambios):
   git add [archivos relevantes]
   git commit -m "feat|fix|docs: description"

2. Actualizar documentacion:
   - Estado de fases en CLAUDE.md
   - Decisiones nuevas en MEMORY.md (si aplica)

3. Resumen de sesion:
   - Que se hizo
   - Que queda pendiente
   - Proximos pasos recomendados
```

---

## Tabla de Routing por Tarea

<!-- LLENAR: Adapta esta tabla a tu proyecto -->
<!-- Si usas Claude Code con subagentes, esto guia que agente usar -->

| Situacion | Enfoque Recomendado | Documentos a Leer |
|-----------|--------------------|--------------------|
| Nueva feature | Planificar primero (/architect) | ARQUITECTURA + PLAN |
| UI / componentes | Implementar (/execute) | FLUJOS + STACK |
| API route / endpoint | Implementar (/execute) | ARQUITECTURA + DB |
| Schema de DB | Planificar + implementar | ESQUEMA-DB + NEGOCIO |
| Bug / error | Debuggear directamente | ARQUITECTURA + codigo |
| Antes de deploy | Revisar (/audit) | Todo |
| Entender codigo | Explorar (/teach) | ARQUITECTURA |
| Pagos / billing | Planificar + implementar | NEGOCIO + STACK |

---

## Reglas de Comunicacion

### Con el Agente

```
HACER:
✓ Dar contexto claro: "Estamos en Fase 2, trabajando en el CRUD de productos"
✓ Ser especifico: "Crea un endpoint GET /api/products que retorne productos del org"
✓ Confirmar antes de ejecutar: "Antes de implementar, muestrame el plan"
✓ Corregir inmediatamente: "No, usa Zod en vez de validacion manual"

NO HACER:
✗ Instrucciones vagas: "Haz que funcione" (¿que cosa?)
✗ Saltar contexto: "Agrega el boton" (¿que boton? ¿donde?)
✗ Asumir que recuerda: Siempre dar contexto de la sesion actual
```

### Del Agente

```
EL AGENTE DEBE:
✓ Leer documentacion antes de escribir codigo
✓ Verificar build despues de cambios
✓ Detenerse si hay ambiguedad
✓ Actualizar docs si algo cambio
✓ Seguir patrones existentes del codebase

EL AGENTE NO DEBE:
✗ Inventar arquitectura nueva sin aprobacion
✗ Ignorar reglas cardinales de CLAUDE.md
✗ Hacer push sin permiso
✗ Modificar schema de produccion sin confirmacion
✗ Asumir valores — preguntar si no esta claro
```

---

## Senales de Stop

El agente DEBE detenerse y preguntar cuando:

<!-- LLENAR: Adapta a tu proyecto -->

- [ ] Operaciones destructivas en DB (DROP TABLE, DELETE sin WHERE)
- [ ] Push a main/master
- [ ] Llamadas a APIs externas que cuestan dinero
- [ ] Ambiguedad en los requisitos
- [ ] Test critico falla y el fix no es obvio
- [ ] Crear o modificar tablas en produccion
- [ ] Cambiar configuracion de autenticacion
- [ ] Instalar dependencias grandes o controversiales

---

## Gestion de Sesiones

### Cuando usar la misma sesion
```
- Termine planning, quiero ejecutar → MISMA sesion
- Debug de un bug → MISMA sesion hasta resolverlo
- El historial ayuda al siguiente paso → MISMA sesion
```

### Cuando usar nueva sesion
```
- Cambio de fase (ej: Fase 1 → Fase 2)
- Cambio de dominio (ej: UI → API → DB)
- Contexto saturado (respuestas lentas)
- Inicio del dia
```

---

## Flujo Completo: Implementar un Feature

```
1. [Tu]    "Modo /architect. Quiero implementar {{FEATURE}}."

2. [Agente] Lee docs relevantes, explora codebase, produce plan:
           - Archivos a crear/modificar
           - Dependencias
           - Patron a seguir
           - Preguntas si hay ambiguedad

3. [Tu]    "Apruebo el plan. Modo /execute."

4. [Agente] Implementa paso a paso:
           - Crea/modifica archivos
           - Verifica tipos (tsc)
           - Verifica build

5. [Tu]    Revisas los cambios, das feedback

6. [Agente] Ajusta segun feedback

7. [Agente] Actualiza documentacion
           - Estado de fase en CLAUDE.md
           - Nuevas decisiones en MEMORY.md

8. [Tu]    "Commit y push" (cuando estes satisfecho)
```

---

## Memoria del Agente

### MEMORY.md

Si tu agente soporta memoria persistente (como Claude Code), usa este formato:

```markdown
# {{NOMBRE_DEL_PROYECTO}} — Memoria del Proyecto

## Estado Actual
- Fase: {{FASE_ACTUAL}}
- Ultima sesion: {{FECHA}}
- Ultimo commit: {{HASH}}

## Decisiones Tecnicas
- {{DECISION}}: {{QUE_ELEGIMOS}} porque {{POR_QUE}}
- {{DECISION}}: {{QUE_ELEGIMOS}} porque {{POR_QUE}}

## Patrones Establecidos
- {{PATRON}}: {{DESCRIPCION}}

## Problemas Conocidos
- {{PROBLEMA}}: {{ESTADO}}

## Preferencias del Usuario
- {{PREFERENCIA}}
```

### Como el Agente Actualiza la Memoria

```
Al final de cada sesion significativa:
1. ¿Hubo decisiones tecnicas? → Agregar a "Decisiones Tecnicas"
2. ¿Se establecio un nuevo patron? → Agregar a "Patrones Establecidos"
3. ¿Se descubrio un problema? → Agregar a "Problemas Conocidos"
4. ¿Cambio el estado del proyecto? → Actualizar "Estado Actual"
```

---

## Validacion Post-Ejecucion

Despues de cada sesion de codigo, verificar:

```bash
# <!-- LLENAR: Tus comandos de validacion -->
{{COMANDO_BUILD}}         # Build exitoso
{{COMANDO_TYPES}}          # Tipos limpios (si aplica)
{{COMANDO_TESTS}}          # Tests pasan (si aplica)
{{COMANDO_LINT}}           # Lint limpio (si aplica)
```
