export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch users securely via RLS (Admin role will read all)
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error fetching users:", error.message);
      return NextResponse.json({ error: "Error interno SQL." }, { status: 500 });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // INFO: To create actual Auth users securely via API, Supabase requires the Service Role Key.
    // The Anon Key will either reject the request or override the current admin's session.
    // Replace with `auth.admin.createUser()` once you add SUPABASE_SERVICE_ROLE_KEY to your .env
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey) {
      return NextResponse.json({ 
        error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en .env.local para poder crear usuarios en auth.users vía API." 
      }, { status: 501 });
    }

    // This is the architecture pattern to implement once key is added:
    // const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
    // const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role, name } });
    
    return NextResponse.json({ 
      error: "Funcionalidad de creación en pausa hasta configurar Service Role." 
    }, { status: 501 });

  } catch (error) {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
