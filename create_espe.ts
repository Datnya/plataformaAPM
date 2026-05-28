import { getSupabaseAdmin } from "./src/lib/supabase/admin";

async function createEspeUser() {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "espe@gmail.com",
    password: "admin123",
    email_confirm: true,
    user_metadata: { role: "ESPECIALISTA", name: "Especialista Pruebas" },
  });

  if (error) {
    console.error("Error al crear usuario auth:", error.message);
  } else {
    console.log("Usuario creado con éxito (Auth):", data.user.id);
  }
}

createEspeUser();
