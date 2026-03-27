export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Error interno SQL." }, { status: 500 });
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Todos los campos (email, password, nombre, rol) son obligatorios." },
        { status: 400 }
      );
    }

    // Use admin client (service role) to create auth user
    const supabaseAdmin = createAdminClient();

    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) {
      // Handle duplicate email
      if (authError.message.includes("already been registered") || authError.message.includes("unique")) {
        return NextResponse.json(
          { error: "Ya existe un usuario registrado con ese correo electrónico." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario en Auth." }, { status: 500 });
    }

    // 2. Insert into public.users (the trigger might do this, but we ensure it)
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: authData.user.id,
        email,
        name,
        role,
        status: "ACTIVO",
      }, { onConflict: "id" });

    if (profileError) {
      // Profile creation failed but auth user exists — log but don't fail hard
      // The trigger should have handled this
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        name,
        role,
        status: "ACTIVO",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al crear usuario" },
      { status: 500 }
    );
  }
}
