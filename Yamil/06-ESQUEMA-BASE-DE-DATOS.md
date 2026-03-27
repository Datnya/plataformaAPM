# {{NOMBRE_DEL_PROYECTO}} — Esquema de Base de Datos

> **Version:** 0.1.0 | **Ultima actualizacion:** {{FECHA}}
> **Motor:** {{ej: PostgreSQL 16 (Supabase) / MySQL / MongoDB}}

---

## 1. Diagrama de Relaciones (ERD)

<!-- LLENAR: Dibuja las relaciones entre tus tablas -->
<!-- Usa este formato ASCII o reemplaza con link a diagrama visual -->

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ {{TABLA_1}}  │────<│ {{TABLA_UNION}}   │>────│ {{TABLA_2}}      │
│ ({{DESC}})   │     │ (junction)       │     │ ({{DESC}})       │
└──────┬──────┘     └──────────────────┘     └──────────────────┘
       │
       ├─────────<──── {{TABLA_3}}
       │
       ├─────────<──── {{TABLA_4}}
       │
       └─────────<──── {{TABLA_5}}
```

**Tip:** Puedes pedirle al agente: "Basandote en mis entidades del cuestionario, genera el ERD"

---

## 2. Tipos Personalizados (OPCIONAL)

```sql
-- <!-- LLENAR: Enums o tipos custom que necesites -->
[EJEMPLO]
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'enterprise');
```

```sql
-- {{TUS_TIPOS}}
CREATE TYPE {{NOMBRE}} AS ENUM ({{VALORES}});
CREATE TYPE {{NOMBRE}} AS ENUM ({{VALORES}});
```

---

## 3. Tablas

### 3.1 {{TABLA_PRINCIPAL_1 — ej: "users" o "profiles"}}

<!-- LLENAR: La tabla mas importante de tu sistema -->

```sql
CREATE TABLE {{nombre_tabla}} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- <!-- LLENAR: Columnas de tu tabla -->
  {{columna_1}} {{TIPO}} {{CONSTRAINTS — ej: NOT NULL}},
  {{columna_2}} {{TIPO}} {{CONSTRAINTS}},
  {{columna_3}} {{TIPO}} {{CONSTRAINTS}},
  {{columna_4}} {{TIPO}} {{CONSTRAINTS}} DEFAULT {{VALOR}},

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX idx_{{tabla}}_{{columna}} ON {{tabla}}({{columna}});
```

**Notas:**
```
- {{NOTA — ej: "Se crea automaticamente al registrarse via trigger"}}
- {{NOTA — ej: "El campo email es unico por organizacion, no globalmente"}}
```

### 3.2 {{TABLA_2 — ej: "organizations" o "tenants"}} (si aplica multi-tenant)

```sql
CREATE TABLE {{nombre_tabla}} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  {{columna_1}} {{TIPO}} {{CONSTRAINTS}},
  {{columna_2}} {{TIPO}} {{CONSTRAINTS}},
  {{columna_3}} {{TIPO}} {{CONSTRAINTS}},

  -- Configuracion
  settings JSONB DEFAULT '{}'::jsonb,

  -- Billing (OPCIONAL)
  {{billing_columna}} {{TIPO}},

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 {{TABLA_3 — ej: "products" / "orders" / tu entidad principal}}

```sql
CREATE TABLE {{nombre_tabla}} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  {{org_id}} UUID NOT NULL REFERENCES {{tabla_org}}(id) ON DELETE CASCADE,
  {{user_id}} UUID REFERENCES {{tabla_users}}(id),

  -- Datos
  {{columna_1}} {{TIPO}} {{CONSTRAINTS}},
  {{columna_2}} {{TIPO}} {{CONSTRAINTS}},
  {{columna_3}} {{TIPO}} {{CONSTRAINTS}},

  -- Estado
  status {{TIPO_ENUM_O_TEXT}} DEFAULT '{{VALOR_DEFAULT}}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_{{tabla}}_{{fk}} ON {{tabla}}({{fk}});
CREATE INDEX idx_{{tabla}}_status ON {{tabla}}(status);
```

### 3.4 - 3.X {{TABLAS_ADICIONALES}}

<!-- LLENAR: Repite el patron para cada tabla -->
<!-- Tip: Puedes pedirle al agente que genere las tablas basandose en tus entidades -->

```sql
-- {{TABLA_4}}
CREATE TABLE {{nombre}} (
  -- {{COLUMNAS}}
);

-- {{TABLA_5}}
CREATE TABLE {{nombre}} (
  -- {{COLUMNAS}}
);
```

---

## 4. Seguridad de Datos (CRITICO)

### 4.1 Row Level Security (RLS) — Para Supabase/PostgreSQL

<!-- LLENAR si usas Supabase o PostgreSQL con RLS -->

```sql
-- <!-- LLENAR: Tu patron de RLS -->
[EJEMPLO — Patron basico multi-tenant]

-- Funcion helper para obtener el org_id del usuario
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Aplicar a cada tabla con org_id
ALTER TABLE {{tabla}} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_select" ON {{tabla}}
  FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id());

CREATE POLICY "org_isolation_insert" ON {{tabla}}
  FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "org_isolation_update" ON {{tabla}}
  FOR UPDATE TO authenticated
  USING (org_id = public.get_user_org_id());

CREATE POLICY "org_isolation_delete" ON {{tabla}}
  FOR DELETE TO authenticated
  USING (org_id = public.get_user_org_id());
```

### 4.2 Datos Sensibles

<!-- LLENAR: Como proteges datos sensibles en tu DB -->

| Columna | Tabla | Proteccion |
|---------|-------|-----------|
| {{ej: password}} | {{tabla}} | {{ej: "Hash bcrypt, nunca texto plano"}} |
| {{ej: api_key}} | {{tabla}} | {{ej: "AES-256-GCM cifrado, salt por registro"}} |
| {{ej: credit_card}} | {{tabla}} | {{ej: "NO se almacena — solo token de Stripe"}} |

---

## 5. Funciones y Triggers (OPCIONAL)

```sql
-- <!-- LLENAR: Funciones de base de datos que necesites -->
[EJEMPLO — Auto-crear perfil al registrarse]
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

```sql
-- {{TUS_FUNCIONES}}
```

---

## 6. Migraciones

<!-- LLENAR: Como manejas cambios al schema -->

```
Estrategia: {{ej: "Archivos SQL numerados en /migrations"}}
             {{ej: "Prisma Migrate"}}
             {{ej: "Drizzle Kit"}}
             {{ej: "Supabase CLI migrations"}}

Reglas:
- {{ej: "Nunca eliminar columnas en produccion sin migracion de datos primero"}}
- {{ej: "Siempre agregar columnas como nullable o con default"}}
- {{ej: "Toda migracion debe ser reversible"}}
```

---

## 7. Indices de Performance (OPCIONAL)

<!-- LLENAR: Indices que necesitas para queries frecuentes -->

```sql
-- Indices para queries mas comunes
-- {{DESCRIBIR_QUERY}}
CREATE INDEX {{nombre}} ON {{tabla}}({{columnas}});

-- {{DESCRIBIR_QUERY}}
CREATE INDEX {{nombre}} ON {{tabla}}({{columnas}}) WHERE {{CONDICION}};
```

---

## 8. Datos Iniciales / Seeds (OPCIONAL)

```sql
-- <!-- LLENAR: Datos iniciales que tu app necesita -->
[EJEMPLO]
-- Planes disponibles
INSERT INTO plans (name, price, limits) VALUES
  ('free', 0, '{"users": 3, "items": 100}'),
  ('pro', 29, '{"users": 25, "items": 10000}'),
  ('enterprise', 99, '{"users": -1, "items": -1}');

-- Categorias default
INSERT INTO categories (name, slug) VALUES
  ('General', 'general'),
  ('Soporte', 'soporte');
```

---

## 9. Constraints Criticos (CRITICO)

<!-- LLENAR: Constraints que si se violan causan errores en la app -->
<!-- El agente DEBE conocer estos para no escribir codigo que los viole -->

```
TABLA: {{nombre}}
  - {{columna}}.status SOLO acepta: {{VALORES_VALIDOS}}
  - {{columna}}.tipo SOLO acepta: {{VALORES_VALIDOS}}
  - NUNCA usar: {{VALORES_INVALIDOS_COMUNES}}

TABLA: {{nombre}}
  - {{columna}} es UNIQUE dentro de {{SCOPE}}
  - {{columna}} NO puede ser NULL cuando {{CONDICION}}
```
