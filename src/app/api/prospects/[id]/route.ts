import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const body = await req.json();
    
    // parse dates if present
    if (body.firstContactDate) body.firstContactDate = new Date(body.firstContactDate);
    if (body.lastInteractionDate) body.lastInteractionDate = new Date(body.lastInteractionDate);

    // allow partial updates
    const updated = await prisma.prospect.update({
      where: { id: p.id },
      data: body
    });
    
    return NextResponse.json({ success: true, prospect: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error updating prospect" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    await prisma.prospect.delete({ where: { id: p.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting prospect" }, { status: 500 });
  }
}
