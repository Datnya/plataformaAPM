import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, name, password } = body;

    const supabase = await createClient();

    // 1. You CAN update public profile data via standard Client with RLS Admin privileges!
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
      
      // If there's a password, we would need Service Role Key to update auth.users
      if (password) {
        return NextResponse.json({ 
          success: true, 
          user: data, 
          warning: "Nombre/Estado actualizados, pero cambio de PASSWORD requiere Service Role Key (no configurado)." 
        });
      }

      return NextResponse.json({ success: true, user: data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updates:", error);
    return NextResponse.json({ error: "Error al actualizar al usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Hard deleting a user requires deleting them from auth.users (which cascades to public.users).
    // Doing this requires auth.admin.deleteUser() with Service Role Key.
    
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseKey) {
      return NextResponse.json({ 
        error: "Se requiere SUPABASE_SERVICE_ROLE_KEY en .env.local para eliminar cuentas." 
      }, { status: 501 });
    }

    // Si tuvieras el Key:
    // const supabaseAdmin = createClient(URL, KEY);
    // await supabaseAdmin.auth.admin.deleteUser(id);
    
    return NextResponse.json({ error: "Funcionalidad pausada hasta tener Service Role." }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar el usuario." }, { status: 400 });
  }
}
