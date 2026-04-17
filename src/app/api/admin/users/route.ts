export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

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
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const { email, password, name, role } = body;

    const supabaseAdmin = getSupabaseAdmin();
    
    // Create the user in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ 
      email, 
      password, 
      email_confirm: true, 
      user_metadata: { role, name } 
    });
    
    if (error) {
      console.error("Auth Admin Create Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Since we created the user, the database triggers or subsequent hooks should insert it into public.users.
    // Assuming the Supabase trigger takes care of public.users insertion upon auth.users creation.
    return NextResponse.json({ success: true, user: data.user });

  } catch (error) {
    console.error("Admin Users POST Error:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
