export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const p = await params;
    const projectId = p.projectId;

    const allGoals = await prisma.goal.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    });

    const total = allGoals.length;
    const completed = allGoals.filter(g => g.status === 'COMPLETADO').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return NextResponse.json({
      goals: allGoals,
      progress,
      completed,
      total
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener objetivos del proyecto." }, { status: 500 });
  }
}
