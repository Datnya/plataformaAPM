# Cuestionario Inicial del Proyecto

> Responde estas preguntas ANTES de llenar las plantillas.
> No necesitas respuestas perfectas — el agente te ayudara a refinarlas.
> Marca con [x] las que ya respondiste.

---

## SECCION A: Vision y Problema (CRITICO)

### A1. El Problema

- [ ] **Que problema resuelve tu producto?**

  ```
  {{RESPUESTA}}
  ```
- [ ] **Quien tiene este problema? (describe a tu usuario ideal)**

  ```
  {{RESPUESTA}}
  ```
- [ ] **Como resuelven este problema HOY (sin tu producto)?**

  ```
  {{RESPUESTA}}
  ```
- [ ] **Por que las soluciones actuales no son suficientes?**

  ```
  {{RESPUESTA}}
  ```

### A2. La Solucion

- [ ] **Describe tu producto en UNA oracion**

  ```
  [EJEMPLO: "Una plataforma SaaS que permite a restaurantes gestionar reservas con IA"]
  {{RESPUESTA}}
  ```
- [ ] **Cuales son las 3-5 funcionalidades principales?**

  ```
  1. {{FUNCIONALIDAD_1}}
  2. {{FUNCIONALIDAD_2}}
  3. {{FUNCIONALIDAD_3}}
  4. {{FUNCIONALIDAD_4 (OPCIONAL)}}
  5. {{FUNCIONALIDAD_5 (OPCIONAL)}}
  ```
- [ ] **Que hace tu producto que NADIE mas hace? (diferenciador clave)**

  ```
  {{RESPUESTA}}
  ```

### A3. El Mercado

- [ ] **Quienes son tus competidores directos? (2-5)**

  ```
  1. {{COMPETIDOR}} — {{QUE_HACEN}} — {{POR_QUE_TU_ERES_DIFERENTE}}
  2. {{COMPETIDOR}} — {{QUE_HACEN}} — {{POR_QUE_TU_ERES_DIFERENTE}}
  3. {{COMPETIDOR}} — {{QUE_HACEN}} — {{POR_QUE_TU_ERES_DIFERENTE}}
  ```
- [ ] **Cual es el tamano estimado de tu mercado?**

  ```
  {{RESPUESTA — puede ser aproximado: "Hay ~50,000 restaurantes en mi ciudad"}}
  ```

---

## SECCION B: Modelo de Negocio (CRITICO)

### B1. Monetizacion

- [ ] **Como vas a ganar dinero?**

  ```
  [ ] Suscripcion mensual/anual (SaaS)
  [ ] Pago por uso (usage-based)
  [ ] Freemium (gratis + premium)
  [ ] Licencia unica
  [ ] Marketplace / comisiones
  [ ] Servicios / consultoria + plataforma
  [ ] Otro: {{DESCRIBIR}}
  ```
- [ ] **Cuanto van a pagar tus usuarios? (pricing tentativo)**

  ```
  Plan 1: {{NOMBRE}} — ${{PRECIO}}/{{PERIODO}} — {{QUE_INCLUYE}}
  Plan 2: {{NOMBRE}} — ${{PRECIO}}/{{PERIODO}} — {{QUE_INCLUYE}}
  Plan 3: {{NOMBRE}} — ${{PRECIO}}/{{PERIODO}} — {{QUE_INCLUYE}}
  ```
- [ ] **Cual es tu costo por usuario/mes estimado? (infra, APIs, etc.)**

  ```
  {{RESPUESTA}}
  ```

### B2. Usuarios y Roles

- [ ] **Que tipos de usuario tiene tu plataforma?**

  ```
  [EJEMPLO: Admin, Manager, Employee, Client]
  1. {{ROL}} — {{QUE_PUEDE_HACER}}
  2. {{ROL}} — {{QUE_PUEDE_HACER}}
  3. {{ROL}} — {{QUE_PUEDE_HACER}}
  ```
- [ ] **Tu plataforma es multi-tenant? (cada empresa tiene su espacio aislado)**

  ```
  [ ] Si — cada organizacion tiene sus propios datos
  [ ] No — todos los usuarios ven los mismos datos
  [ ] No se — necesito ayuda para decidir
  ```
- [ ] **Necesitas un sistema de invitaciones/equipos?**

  ```
  [ ] Si — los admins invitan miembros a su organizacion
  [ ] No — cada usuario es independiente
  ```

---

## SECCION C: Stack Tecnico (ALTA PRIORIDAD)

### C1. Lo que ya sabes

- [ ] **Con que tecnologias tienes experiencia?**

  ```
  Frontend: {{RESPUESTA — ej: React, Vue, Angular, nada}}
  Backend: {{RESPUESTA — ej: Node.js, Python, Go, nada}}
  Base de datos: {{RESPUESTA — ej: PostgreSQL, MongoDB, Firebase, nada}}
  Deploy: {{RESPUESTA — ej: Vercel, AWS, nada}}
  ```
- [ ] **Ya elegiste tu stack? Si es asi, cual?**

  ```
  Framework: {{RESPUESTA — ej: Next.js, Nuxt, SvelteKit, "no he decidido"}}
  Backend/DB: {{RESPUESTA — ej: Supabase, Firebase, custom API}}
  Auth: {{RESPUESTA — ej: Clerk, Auth.js, Supabase Auth, "no se"}}
  Hosting: {{RESPUESTA — ej: Vercel, Railway, VPS, "no se"}}
  ```
- [ ] **Hay alguna tecnologia que DEBES usar? (por restriccion de empresa, etc.)**

  ```
  {{RESPUESTA — ej: "Tenemos que usar AWS porque ya tenemos cuenta enterprise"}}
  ```

### C2. Requisitos Tecnicos

- [ ] **Tu app necesita funcionar en tiempo real? (chat, notificaciones live, etc.)**

  ```
  [ ] Si — {{DESCRIBIR_QUE_NECESITA_SER_REALTIME}}
  [ ] No
  [ ] No se
  ```
- [ ] **Tu app necesita IA/ML? (generacion de texto, analisis, recomendaciones)**

  ```
  [ ] Si — {{DESCRIBIR_QUE_TIPO_DE_IA}}
  [ ] No
  [ ] Tal vez en el futuro
  ```
- [ ] **Tu app necesita procesamiento de archivos? (imagenes, videos, PDFs)**

  ```
  [ ] Si — {{DESCRIBIR_QUE_TIPO}}
  [ ] No
  ```
- [ ] **Tu app necesita integraciones externas? (APIs de terceros)**

  ```
  1. {{SERVICIO}} — {{PARA_QUE}} — {{TIENEN_API?}}
  2. {{SERVICIO}} — {{PARA_QUE}} — {{TIENEN_API?}}
  ```
- [ ] **Volumen esperado de usuarios (primer ano)?**

  ```
  [ ] < 100 usuarios
  [ ] 100 - 1,000
  [ ] 1,000 - 10,000
  [ ] 10,000 - 100,000
  [ ] > 100,000
  ```

---

## SECCION D: Datos y Seguridad (ALTA PRIORIDAD)

### D1. Modelo de Datos

- [ ] **Cuales son las entidades principales de tu sistema? (las "cosas" que manejas)**

  ```
  [EJEMPLO: Para un CRM: Contactos, Empresas, Deals, Actividades, Emails]
  1. {{ENTIDAD}} — {{DESCRIPCION_BREVE}}
  2. {{ENTIDAD}} — {{DESCRIPCION_BREVE}}
  3. {{ENTIDAD}} — {{DESCRIPCION_BREVE}}
  4. {{ENTIDAD}} — {{DESCRIPCION_BREVE}}
  5. {{ENTIDAD}} — {{DESCRIPCION_BREVE}}
  ```
- [ ] **Que relaciones hay entre ellas? (un usuario tiene muchos X, un X pertenece a Y)**

  ```
  {{RESPUESTA — no necesita ser perfecto, el agente ayuda a refinar}}
  ```

### D2. Seguridad

- [ ] **Que datos sensibles manejas?**

  ```
  [ ] Datos personales (nombre, email, telefono)
  [ ] Datos financieros (tarjetas, cuentas bancarias)
  [ ] Datos de salud
  [ ] Credenciales/passwords
  [ ] API keys de terceros
  [ ] Otro: {{DESCRIBIR}}
  [ ] Ninguno particularmente sensible
  ```
- [ ] **Necesitas cumplir alguna regulacion?**

  ```
  [ ] GDPR (Union Europea)
  [ ] HIPAA (salud en EE.UU.)
  [ ] PCI DSS (pagos)
  [ ] SOC 2
  [ ] Ninguna especifica
  [ ] No se
  ```
- [ ] **Necesitas aislamiento de datos entre organizaciones/tenants?**

  ```
  [ ] Si — critico (datos de un cliente NUNCA pueden ser vistos por otro)
  [ ] Deseable pero no critico
  [ ] No aplica
  ```

---

## SECCION E: Diseno y UX (MEDIA PRIORIDAD)

### E1. Apariencia

- [ ] **Como quieres que se vea tu app?**

  ```
  [ ] Minimalista / limpia
  [ ] Profesional / corporativa
  [ ] Divertida / colorida
  [ ] Dark mode / tech / "hacker"
  [ ] Lujosa / premium
  [ ] Otro: {{DESCRIBIR}}
  ```
- [ ] **Tienes marca definida? (logo, colores, tipografia)**

  ```
  [ ] Si — Logo: {{DESCRIPCION}}, Colores: {{COLORES}}, Font: {{FUENTE}}
  [ ] No — necesito crear la marca
  [ ] Solo logo, falta lo demas
  ```
- [ ] **Que apps existentes te inspiran visualmente?**

  ```
  1. {{APP}} — {{QUE_TE_GUSTA_DE_ELLA}}
  2. {{APP}} — {{QUE_TE_GUSTA_DE_ELLA}}
  ```

### E2. Plataformas

- [ ] **En que plataformas debe funcionar?**
  ```
  [ ] Web (navegador de escritorio)
  [ ] Web mobile (responsive)
  [ ] App nativa iOS
  [ ] App nativa Android
  [ ] Desktop (Windows/Mac)
  [ ] Otro: {{DESCRIBIR}}
  ```

---

## SECCION F: Alcance del MVP (CRITICO)

### F1. Minimo Viable

- [ ] **Si solo pudieras lanzar con 3 funcionalidades, cuales serian?**

  ```
  1. {{FUNCIONALIDAD}} — {{POR_QUE_ES_ESENCIAL}}
  2. {{FUNCIONALIDAD}} — {{POR_QUE_ES_ESENCIAL}}
  3. {{FUNCIONALIDAD}} — {{POR_QUE_ES_ESENCIAL}}
  ```
- [ ] **Que funcionalidades puedes dejar para DESPUES del MVP?**

  ```
  1. {{FUNCIONALIDAD}} — {{CUANDO_LA_NECESITAS}}
  2. {{FUNCIONALIDAD}} — {{CUANDO_LA_NECESITAS}}
  3. {{FUNCIONALIDAD}} — {{CUANDO_LA_NECESITAS}}
  ```
- [ ] **Para cuando necesitas el MVP funcionando?**

  ```
  {{FECHA_O_PLAZO — ej: "Marzo 2026", "En 3 meses", "No hay deadline"}}
  ```
- [ ] **Quien va a probar el MVP? (beta testers)**

  ```
  {{RESPUESTA — ej: "5 amigos que tienen restaurantes", "nadie aun"}}
  ```

### F2. Exito

- [ ] **Como sabes si tu MVP fue exitoso? (metricas concretas)**
  ```
  [EJEMPLO: "10 usuarios pagando $50/mes dentro de 3 meses"]
  {{RESPUESTA}}
  ```

---

## SECCION G: Equipo y Recursos (OPCIONAL)

- [ ] **Quien mas trabaja en este proyecto?**

  ```
  [ ] Solo yo
  [ ] Yo + {{NUMERO}} personas — Roles: {{DESCRIBIR}}
  [ ] Equipo remoto de {{NUMERO}} personas
  ```
- [ ] **Cual es tu presupuesto mensual para infraestructura?**

  ```
  [ ] $0 (solo gratuitos)
  [ ] < $50/mes
  [ ] $50 - $200/mes
  [ ] $200 - $500/mes
  [ ] > $500/mes
  ```
- [ ] **Cuantas horas por semana puedes dedicar al proyecto?**

  ```
  [ ] < 10 horas
  [ ] 10-20 horas
  [ ] 20-40 horas (medio tiempo)
  [ ] 40+ horas (tiempo completo)
  ```

---

## Siguiente Paso

Una vez completado este cuestionario:

1. Guardalo en la raiz de tu proyecto
2. Abre una sesion con tu agente IA
3. Pide: "Lee 10-CUESTIONARIO-INICIAL.md y basandote en mis respuestas, ayudame a llenar 01-PROYECTO-CLAUDE.md"
4. Repite para cada plantilla

El agente usara tus respuestas para generar documentacion especifica a tu proyecto.
