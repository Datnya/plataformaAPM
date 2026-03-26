import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const body = await req.json();
    const { networks, contentType, format, publishDate, status, title, description } = body;

    const parsedNetworks = Array.isArray(networks) ? JSON.stringify(networks) : networks;

    const updated = await prisma.socialContent.update({
      where: { id: p.id },
      data: {
        networks: parsedNetworks,
        contentType,
        format,
        publishDate: new Date(publishDate),
        status,
        title,
        description
      }
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error updating content" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    await prisma.socialContent.delete({ where: { id: p.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting content" }, { status: 500 });
  }
}
