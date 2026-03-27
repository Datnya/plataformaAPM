ESPECIFICACION_GENERADOR_CERTIFICADOS.md (Versión Optimizada)
1. Visión General
Herramienta administrativa para la emisión masiva de certificados PDF con QR único, vinculados a proyectos específicos y gestionados mediante carga de Excel.

2. Requerimientos de Interfaz y UX
A. Gestión de Firmas (Nuevo)
Panel de Firmas: Sección para subir imágenes PNG (fondo transparente) de firmas de consultores.

Acciones: Botón "Agregar Firma", previsualización de firmas guardadas y botón "Eliminar".

Uso: Al generar certificados, el admin selecciona la firma del consultor desde un menú desplegable.

B. Visualización de Resultados (Nuevo)
Explorador Digital: Tras la generación, se abrirá un modal con vista de "Explorador de Archivos" (iconos de PDF con nombre y código).

Descarga: Botón general "Descargar ZIP" y botones individuales por archivo.

3. Arquitectura y Base de Datos (Prisma)
Se requiere actualizar el schema para incluir las firmas y la relación con los proyectos de la plataforma:

Fragmento de código
model ConsultantSignature {
  id        String @id @default(cuid())
  name      String // Nombre del consultor
  signatureUrl String // URL de la imagen transparente
}

model Certificate {
  id              String   @id @default(uuid())
  participantName String
  accessKey       String   @unique
  projectId       String   // VINCULACIÓN CON PROYECTO
  project         Project  @relation(fields: [projectId], references: [id])
  // ... otros campos previos
}
4. Diseño y Maquetación del PDF (Puntos Críticos)
Para evitar la superposición de datos, se debe usar la plantilla Primera imagen.jpg como fondo base y posicionar los elementos según estas coordenadas relativas:

Nombre del Alumno: Debe ir centrado horizontalmente, ubicado justo debajo del texto "Liderazgo" y arriba de "Basado en las normas:".

QR de Validación: Posicionado en la esquina inferior izquierda, sobre el texto "Escanee para validar".

Datos Dinámicos (Duración/Fecha/Código): Deben alinearse exactamente sobre las líneas guía de la plantilla original para que no parezcan "flotando".

Firma del Consultor: Se debe renderizar sobre la línea derecha de firmas (opuesta a la firma de la Gerente General).

5. Acceso Público
El enlace del QR llevará a una ruta pública .../verificar/[accessKey].

Funcionalidad: Visualización del PDF y botón de descarga directa, optimizado para celulares. No requiere inicio de sesión.