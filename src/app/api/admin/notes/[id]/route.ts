import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const body = await req.json();
    const { title, description, date } = body;
    await prisma.adminNote.update({
      where: { id: p.id },
      data: {
        title,
        description,
        date: new Date(date)
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error updating note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    await prisma.adminNote.delete({ where: { id: p.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting note" }, { status: 500 });
  }
}
