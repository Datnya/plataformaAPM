# Product Requirements Document (PRD) - Plataforma de Control de Proyectos APM Group

## 1. Descripción del Proyecto
Plataforma web corporativa para APM Group diseñada para el control de proyectos, registro de horas facturables (presenciales y remotas), seguimiento de objetivos y gestión de prospectos comerciales. El despliegue final se realizará en Vercel.

## 2. Autenticación y Accesos
- Login con correo/contraseña y opción de Google OAuth.
- Creación de cuentas de clientes gestionada exclusivamente por APM Group.

## 3. Tipos de Usuarios y Permisos

### A. Administrador (Admin APM Group)
- Acceso total a la plataforma.
- Crea y gestiona cuentas de clientes (máximo 3 cuentas por empresa cliente: ej. Gerente General, RRHH, Asistente).
- Asigna consultores a proyectos/clientes (un consultor puede tener múltiples clientes asignados).
- Define y marca objetivos semanales y mensuales para los consultores.
- Acceso al módulo "Control de Prospectos" (CRM).
- Visualiza reportes de horas, evidencias, informes PDF/Excel y calendarios de todos.

### B. Consultor / Auditor (Trabajador APM Group)
- Acceso a su calendario de actividades y reuniones.
- Registra jornada: hora de entrada, hora de salida, modalidad (presencial/remota).
- Registra interacciones: áreas visitadas, personas con las que se reunió (Nombre, Apellido, Cargo).
- Sube evidencias diarias (fotos, capturas, documentos).
- Sube informes semanales y mensuales.
- Visualiza sus objetivos asignados y su porcentaje de avance.

### C. Cliente
- Visualiza el formulario de evidencia diaria de su consultor asignado.
- Descarga informes semanales y mensuales (PDF/Excel).
- Visualiza el calendario de actividades (días presenciales, remotos y áreas a auditar).
- Visualiza los objetivos del proyecto, las tareas completadas y el porcentaje de avance general.