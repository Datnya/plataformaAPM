# 🚀 Implementación Base de Datos & Roles — PlataformaAPM (Supabase)

Este documento detalla la infraestructura backend completa y las cuentas de prueba creadas exitosamente usando el stack y directrices de _Supabase Best Practices_ y el perfil de desarrollo de _Senior Architect_.

---

## 🏗️ 1. Arquitectura y Tablas Migradas (PostgreSQL)

Se implementaron de forma nativa en la base de datos **10 tablas fundamentales** con estructura `BigInt Generated Identity` y protección nativa, vinculadas lógicamente a las capacidades del software:

### Entidades Core
* `public.clients`: Empresas clientes del sistema.
* `public.users`: Reflejo público de las cuentas de `auth.users` conectadas mediante FK.
* `public.projects`: Los proyectos asignados. Relacionan clientes con un usuario de tipo Consultor.
* `public.project_client_users`: Tabla pivot (N:N) que asocia clientes (usuarios finales) a proyectos específicos de su compañía.

### Entidades Operativas
* `public.time_logs`: Registro de jornadas laborales de consultores (presencial/remoto, location visits, upload URLs, check-in times).
* `public.goals`: Objetivos semanales/mensuales medibles y su status.
* `public.activities`: Actividades y tracking calendarizado.

### Administración Interna (Pipeline & Marketing)
* `public.prospects`: Tabla CRM para trazabilidad comercial y ventas.
* `public.admin_notes`: Registro interno de gerencia.
* `public.social_contents`: Calendario y control de redes sociales de la empresa.

---

## 🛡️ 2. Seguridad e Identidad (RLS & Triggers)

Se configuró el entorno de máxima seguridad (**Row Level Security - RLS**) directamente en la capa de la base de datos. Nadie (ni atacantes ni el mismo frontend) puede pedir datos fuera de su jerarquía o jurisdicción:

1. **Jerarquía Definida (Constraints)** 
   El sistema respeta estrictamente 3 roles de negocio a nivel de SQL Check Constraints en la columna `role` (`'ADMIN'`, `'CONSULTOR'`, `'CLIENTE'`).

2. **Funciones en Caché (Security Definer)**
   Se construyó `get_user_role()` y `get_user_company_id()`, mejorando drásticamente el _Query Performance_ para validar los permisos de cada row insertado, borrado, actualizado o leído.

3. **Ejemplos de RLS Dinámico aplicados:**
   - **Super Admin**: CRUD completo global (`using (get_user_role() = 'ADMIN')`).
   - **Consultor**: Solo tiene control de inserción/lectura (`select`, `update`) para los `projects` que su `consultant_id` matchee, y sus respectivos `time_logs`, `goals`, y `activities`.
   - **Cliente APM**: Únicamente puede leer proyectos, time_logs asociadas a su propia empresa filial (`client_id`). Y tiene visibilidad controlada.

4. **Trigger de Sincronización Automática**
   El trigger de base datos (`handle_new_user`) está en vivo interceptando cualquier nuevo Auth (`SignUp`) creando instantáneamente a los nuevos miembros en `public.users`, traspasando los metadatos dinámicamente.

---

## 🗂️ 3. Storage Configurado

Se creó el cubo o **bucket privado de Supabase**: `evidencias`.

**Políticas Inyectadas:**
* **Admins & Consultores**: Tienen permisos de subida garantizados (`for insert restricted check bucket`).
* **Usuarios logueados**: Tienen permisos de validación y extracción de archivos del bucket (`for select` sobre storage.objects).

---

## 🧪 4. Cuentas Oficiales Requeridas (Pruebas)

He aprovisionado la base de datos insertando localmente passwords cifrados vía `pgcrypto` con las cuentas que solicitaste listas para probar el login desde Supabase Auth.

| Rol | Rango DB / Función | Correo | Contraseña |
| --- | --- | --- | --- |
| **Rol 1** | `ADMIN` (Dashboard general y KPIs) | **admin@plataformaapm.com** | `admin123` |
| **Rol 2** | `CONSULTOR` (Trabajador de campo) | **consultor@plataformaapm.com** | `admin123` |
| **Rol 3** | `CLIENTE` (Cliente que visualiza) | **cliente@plataformaapm.com** | `admin123` |

---

## ⏭️ 5. Siguientes Pasos (Next.js Application)

Con todo en orden detrás de escenas, los siguientes pasos directos para la plataforma web son:

1. Instalar las dependencias de SSR en Node/React: `npm i @supabase/supabase-js @supabase/ssr`
2. Configurar las variables en `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Instanciar y crear el cliente de conexión (_Browser Client_ & _Server Client_).
4. Proceder a limpiar las API Routes costosas de prisma, inyectando llamadas directas a Supabase usando el cliente oficial (Las funciones de RLS ya se encargarán del filtrado y seguridad).
