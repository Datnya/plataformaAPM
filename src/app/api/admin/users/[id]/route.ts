import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const { status, name, password, email, role } = body;

    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Update public.users profile data
    let updateData: any = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (email) updateData.email = email;

    let warnings: string[] = [];

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id)
        .select("id, name, email, role, status")
        .single();
        
      if (error) throw error;

      // 2. If email changed, also update in auth.users
      if (email) {
        const { error: authEmailError } = await supabaseAdmin.auth.admin.updateUserById(id, { email });
        if (authEmailError) {
          console.error("Auth email update error:", authEmailError);
          warnings.push("El correo no pudo actualizarse en autenticación: " + authEmailError.message);
        }
      }
      
      // 3. If password provided, update in auth.users
      if (password) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
        if (authError) {
          console.error("Auth password update error:", authError);
          warnings.push("La contraseña no pudo cambiarse: " + authError.message);
        }
      }

      return NextResponse.json({ 
        success: true, 
        user: data, 
        ...(warnings.length > 0 ? { warning: warnings.join(". ") } : {})
      });
    } else if (password) {
      // Just updating password
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
      
      if (authError) throw authError;
      return NextResponse.json({ success: true, message: "Contraseña actualizada" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updates:", error);
    return NextResponse.json({ error: "Error al actualizar al usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const supabaseAdmin = require("@/lib/supabase/admin").getSupabaseAdmin();
    
    // Delete from auth.users (cascades to public.users)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (error) {
      console.error("Supabase Admin Delete Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Usuario eliminado" });
  } catch (error: any) {
    console.error("Admin Users DELETE Error:", error);
    return NextResponse.json({ error: error.message || "No se pudo eliminar el usuario." }, { status: 500 });
  }
}
