export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        clientUsers: true,
        consultant: true,
        goals: { orderBy: { createdAt: "desc" } },
        timeLogs: { orderBy: { checkInTime: "desc" } }
      }
    });

    if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching project detail" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;

    // Delete related records first to avoid FK constraints
    await prisma.timeLog.deleteMany({ where: { projectId: id } });
    await prisma.goal.deleteMany({ where: { projectId: id } });
    
    await prisma.project.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project DELETE error:", error);
    return NextResponse.json({ error: "Error al eliminar el proyecto. Verifica datos enlazados." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    const body = await req.json();
    const { name, consultantId, clientUserIds } = body;

    let updateData: any = {};
    if (name) updateData.name = name;
    if (consultantId) updateData.consultantId = consultantId;
    if (clientUserIds) {
       updateData.clientUsers = {
          set: clientUserIds.map((cId: string) => ({ id: cId }))
       };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: { clientUsers: true, consultant: true }
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Project PUT error:", error);
    return NextResponse.json({ error: "Error al actualizar el proyecto" }, { status: 500 });
  }
}
