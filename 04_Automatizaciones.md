# Reglas de Negocio, Automatizaciones y Restricciones

## 1. Notificaciones por Correo (Reuniones)
- **Trigger:** A las 08:00 AM del día que exista un evento en el calendario del proyecto.
- **Acción:** Enviar correo automático a los `email` del Admin, del Consultor asignado y de los Clientes vinculados al proyecto.
- **Remitente:** consultas@apmgroup.pe
- **Contenido del correo:** Fecha, hora, modalidad (Remota/Presencial), nombre del consultor, y áreas de la empresa cliente con las que se reunirá.

## 2. Gestión de Archivos y Almacenamiento
- **Restricciones de subida:** Límite de tamaño de archivo fijado en 25MB (para permitir documentos extensos de hasta 30+ páginas).
- **Formatos permitidos:** `.jpg`, `.png`, `.pdf`, `.xlsx`, `.xls`, `.zip`.
- **Regla:** Si la evidencia consta de múltiples archivos pesados, sugerir al usuario desde la interfaz agruparlos en un `.zip` antes de subir.

## 3. Cálculo de Progreso
- **Trigger:** Cada vez que el Admin marca un objetivo en la tabla `Goals` como `is_completed = true`.
- **Acción:** Recalcular automáticamente el porcentaje de avance del proyecto basándose en (Objetivos Completados / Total de Objetivos del Mes) * 100 y actualizar la interfaz en tiempo real para el Cliente y el Consultor.