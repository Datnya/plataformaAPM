import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    const body = await req.json();

    const allowedUpdates: any = {};
    if (body.title) allowedUpdates.title = body.title;
    if (body.description !== undefined) allowedUpdates.description = body.description;
    if (body.date) allowedUpdates.date = new Date(body.date);
    if (body.emails) allowedUpdates.emails = JSON.stringify(body.emails);

    const updated = await prisma.activity.update({
      where: { id },
      data: allowedUpdates
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error editing activity" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;

    await prisma.activity.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting activity" }, { status: 500 });
  }
}
