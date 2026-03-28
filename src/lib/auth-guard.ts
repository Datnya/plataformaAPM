import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the authenticated user has one of the required roles.
 * Returns null if authorized, or a NextResponse error if not.
 */
export async function requireRole(
  allowedRoles: string[]
): Promise<{ error: NextResponse } | { userId: string; role: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      error: NextResponse.json(
        { error: "Perfil de usuario no encontrado." },
        { status: 404 }
      ),
    };
  }

  if (profile.status === "INACTIVO") {
    return {
      error: NextResponse.json(
        { error: "Cuenta suspendida." },
        { status: 403 }
      ),
    };
  }

  if (!allowedRoles.includes(profile.role)) {
    return {
      error: NextResponse.json(
        { error: "No tienes permisos para esta accion." },
        { status: 403 }
      ),
    };
  }

  return { userId: user.id, role: profile.role };
}
