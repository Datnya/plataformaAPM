import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo electrónico y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas. Verifica tu correo y contraseña." },
        { status: 401 }
      );
    }

    if (user.status === "INACTIVO") {
      return NextResponse.json(
        { error: "Tu cuenta ha sido suspendida. Contacta con el administrador." },
        { status: 403 }
      );
    }

    // Since we may not have passwords seeded for demo, mock it:
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Credenciales inválidas. Verifica tu correo y contraseña." },
          { status: 401 }
        );
      }
    } else {
      // For demo accounts without password seeded
      if (password !== "123456") {
          return NextResponse.json(
            { error: "Contraseña de demo incorrecta. (Usa: 123456)" },
            { status: 401 }
          );
      }
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
