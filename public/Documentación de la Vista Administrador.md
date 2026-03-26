# Documentación de la Vista Administrador (Rol: ADMIN) - APM Group
**Versión:** 1.0 | **Fase Actual:** Cierre de Panel Admin

Este documento contiene las reglas estrictas de UI/UX, lógica de negocio y estructura de base de datos para el rol `ADMIN` en la plataforma de APM Group. Debe usarse como referencia absoluta para evitar regresiones.

## 1. Reglas Globales de UI/UX y Estabilidad
- **Iconografía Estricta:** Prohibido el uso de emojis genéricos o imágenes desentonadas. Toda la plataforma (menú lateral, tarjetas del dashboard, botones de acción) debe usar una única librería profesional y minimalista (ej. `lucide-react` o `heroicons`) para mantener la continuidad corporativa.
- **Gestión de Ventanas Emergentes (Modales):** Todos los modales deben estar centrados y nunca cortarse. 
  - *Clases Tailwind obligatorias para el overlay:* `fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4`.
  - *Clases para el contenedor del modal:* `max-h-[90vh] overflow-y-auto w-full max-w-lg bg-white rounded-lg`.
- **Interacciones y Formularios (Prevención de Bugs):** - Prohibido el uso de `alert()` nativos. Utilizar animaciones dinámicas en los botones (spinners de carga, cambios de color a verde con texto "¡Guardado!").
  - Todos los formularios deben incluir `e.preventDefault()` en el `onSubmit` para evitar recargas de página completas que destruyan la sesión de NextAuth y expulsen al usuario.

## 2. Autenticación y Accesos
- **Login Único:** Solo mediante Correo y Contraseña (encriptada con Bcrypt). Sin botones de Google ni accesos de demostración.
- **Protección de Rutas:** El rol `ADMIN` tiene acceso total. Si un `CONSULTOR` o `CLIENTE` intenta acceder a rutas de `/admin/...`, el middleware debe bloquearlos.

## 3. Módulos del Panel de Navegación (Solo Admin)

### 3.1. Dashboard Principal
- **Tarjetas de Resumen:** Visualización de Proyectos Activos, Consultores, Clientes Activos y Prospectos Nuevos con iconografía premium.
- **Rendimiento de Consultores:** Lista clickeable de consultores. Al hacer clic, el Admin gestiona sus objetivos.
  - *CRUD de Objetivos:* Crear, Leer, Editar (descripción/fecha) y Eliminar.
  - *Estados del Objetivo:* `Pendiente`, `En Proceso`, `Revisión`, `Completado`. El progreso del consultor se calcula sobre los completados.

### 3.2. Gestión de Usuarios
- Vista unificada en una sola pantalla (no hay rutas separadas para crear usuarios).
- **Filtros:** Botón superior para filtrar la tabla por roles (Todos, Administradores, Consultores, Clientes).
- **Creación/Edición:** Mediante Modal estandarizado. Campos obligatorios: Nombre, Correo, Contraseña, Rol.
- **Acciones en Tabla:** Botones para Editar (nombre/rol/contraseña), Inhabilitar (suspender acceso) y Borrar.

### 3.3. Proyectos
- **Creación de Proyectos:** Botón "Añadir Nuevo Proyecto" que abre un Modal.
- **Asignación Estricta:** No se pueden inventar correos. El formulario tiene menús desplegables que hacen *fetch* a la base de datos para seleccionar únicamente usuarios activos con rol `CLIENTE` (hasta 3) y `CONSULTOR`.
- **Sincronización Global:** Al crear un proyecto, este se refleja inmediatamente en los selectores del Calendario, Objetivos y demás vistas.

### 3.4. Control de Clientes (Exclusivo Admin)
- Lista de todos los usuarios con rol `CLIENTE`.
- **Vista de Detalle del Cliente:**
  - *Progreso:* Estado de los objetivos de su proyecto.
  - *Informes:* Panel para previsualizar/descargar informes Semanales y Mensuales. Si no hay, muestra el "Empty State": *'No hay ningún informe cargado'*.
  - *Horas Trabajadas:* Sumatoria total automática de las horas del mes (Cálculo dinámico: `hora_de_salida` - `hora_de_entrada` extraído de los TimeLogs/Evidencias del consultor).

### 3.5. CRM Prospectos
- Tablero Kanban para gestionar leads.
- **Acción:** Capacidad de añadir nuevos prospectos y botón de papelera para eliminarlos definitivamente (con confirmación visual).

### 3.6. Calendario APM
- Sin el año "2026" explícito en el título de la sección.
- **Selector de Proyecto:** Para ver actividades específicas de consultores/clientes.
- **Calendario Interno de Administradores:** Visible debajo del selector de proyectos. Exclusivo para tareas internas de gerencia (fecha, título, descripción). Permite múltiples eventos por día, sin necesidad de vincular correos.
- **CRUD de Actividades:** - Cada actividad muestra: Fecha, Título, Descripción y Asistentes.
  - Íconos de Editar y Eliminar (tamaño grande y clickeable). Al editar, se puede modificar cualquier dato y añadir/quitar asistentes.
- **Automatización de Correos:** Botón "Notificar por correo".
  - *Remitente:* consultas@apmgroup.pe
  - *Asunto:* APM Group - Notificación de Actividad Programada
  - *Cuerpo:* "APM Group te notifica que el día [fecha] se realizará la siguiente actividad: [descripción]".

## 4. Usuarios Semilla de Referencia (Base de Datos)
- **Admin:** `dmonzon@apmgroup.pe` | Nombre: Datnya
- **Consultor:** `datnyamonzon1@gmail.com` | Nombre: Tatiana
- **Cliente:** `consultas@lograconsulting.com` | Nombre: Logra Consulting
- *Nota:* Todos comparten la misma contraseña semilla encriptada para pruebas.