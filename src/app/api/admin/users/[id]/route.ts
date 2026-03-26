import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    const body = await req.json();
    const { status, password, name } = body;

    let updateData: any = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, role: true, status: true }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar al usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handling foreign key constraint gracefully if needed
    return NextResponse.json({ error: "No se pudo eliminar el usuario porque tiene datos enlazados." }, { status: 400 });
  }
}
