import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo electrónico y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Supabase Auth Error:", authError.message);

      if (authError.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Credenciales inválidas. Verifica tu correo y contraseña." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Error de autenticación. Intenta de nuevo." },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "No se pudo autenticar el usuario." },
        { status: 401 }
      );
    }

    // 2. Fetch the user profile from public.users (has role, name, status)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, name, role, status, company_id")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile Fetch Error:", profileError?.message);
      return NextResponse.json(
        { error: "No se encontró el perfil del usuario." },
        { status: 404 }
      );
    }

    // 3. Check if the user is active
    if (profile.status === "INACTIVO") {
      // Sign out the user since they shouldn't have access
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "Tu cuenta ha sido suspendida. Contacta con el administrador.",
        },
        { status: 403 }
      );
    }

    // 4. Set the role cookie for backward compatibility
    const cookieStore = await cookies();
    cookieStore.set("auth_role", profile.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // 5. Return user data for the frontend context
    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      companyId: profile.company_id,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
