# Branding, Diseño y Stack Tecnológico (UI/UX)

## 1. Stack Tecnológico Requerido
- **Framework Front-end / Back-end:** Next.js (App Router recomendado).
- **Estilos:** Tailwind CSS.
- **Despliegue final:** Vercel.
- **Regla estricta:** NO utilizar archivos .html estáticos. Todo debe estar componentizado en React/Next.js.

## 2. Adaptabilidad (Responsive Design)
- La plataforma debe ser **Desktop-First** (optimizada principalmente para uso en laptops y computadoras de oficina, ya que es una herramienta de trabajo y carga de evidencias).
- **Obligatorio:** Debe ser completamente funcional y adaptable a pantallas de tablets y celulares (Mobile Responsive), permitiendo a los consultores hacer "check-in" o subir fotos de evidencia desde su móvil sin que la interfaz se rompa.

## 3. Identidad Visual (APM Group)

**A. Paleta de Colores Corporativa (Tailwind):**
- **Color Principal (Primary):** Verde `#b4c307`. Se utilizará para botones principales de acción (ej. "Iniciar Sesión", "Subir Evidencia"), enlaces activos, barras de progreso y elementos a resaltar.
- **Color de Fondo y Tarjetas (Background/Cards):** Blanco `#FFFFFF`. Para mantener un aspecto corporativo, limpio y ordenado tipo dashboard. Se pueden usar fondos grises muy sutiles (ej. `#F3F4F6`) para diferenciar el fondo general de las tarjetas blancas de contenido.
- **Textos (Text):** Negro `#000000` (o un gris carbón muy oscuro como `#111827` para suavizar la lectura prolongada).

**B. Tipografía (Google Fonts):**
- **Fuente Única:** Poppins.
- **Títulos y Subtítulos (Headings):** Poppins en formato **Negrita (Bold)**.
- **Cuerpo de texto y Párrafos (Body):** Poppins en formato Normal (Regular), sin negrita, para asegurar una lectura cómoda en tablas de datos y formularios.

**C. Logotipo y Ubicación Estratégica:**
- El archivo del logo se encuentra en la ruta: `public/imágenes/LOGO APM` (asegurar compatibilidad con la extensión que se suba, ej. .png o .svg).
- **Ubicaciones requeridas:** 1. Centrado en la parte superior del formulario de Login.
  2. En la esquina superior izquierda del menú de navegación (Sidebar o Navbar) del Dashboard, visible en todo momento para los 3 tipos de roles.