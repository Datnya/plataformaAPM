import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, name, password } = body;

    const supabase = await createClient();

    // 1. Update public.users profile data via RLS (Admin role)
    let updateData: any = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id)
        .select("id, name, role, status")
        .single();

      if (error) throw error;

      // 2. If password change requested, use admin client
      if (password) {
        try {
          const supabaseAdmin = createAdminClient();
          const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            password,
          });
          if (pwError) {
            return NextResponse.json({
              success: true,
              user: data,
              warning: "Perfil actualizado, pero hubo un error cambiando la contraseña: " + pwError.message,
            });
          }
        } catch {
          return NextResponse.json({
            success: true,
            user: data,
            warning: "Perfil actualizado. Service Role Key no configurada para cambio de contraseña.",
          });
        }
      }

      return NextResponse.json({ success: true, user: data });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al actualizar al usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const supabaseAdmin = createAdminClient();

    // Delete from auth.users (cascades to public.users via FK)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Se requiere SUPABASE_SERVICE_ROLE_KEY en .env.local para eliminar cuentas." },
        { status: 501 }
      );
    }
    return NextResponse.json({ error: "No se pudo eliminar el usuario." }, { status: 400 });
  }
}
