import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    const body = await req.json();

    const allowedUpdates: any = {};
    if (body.description) allowedUpdates.description = body.description;
    if (body.status) allowedUpdates.status = body.status;
    if (body.dueDate !== undefined) allowedUpdates.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    const updated = await prisma.goal.update({
      where: { id },
      data: allowedUpdates
    });

    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error editing goal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting goal" }, { status: 500 });
  }
}
