import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    const { status } = await req.json();

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // Update goal
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: { status },
    });

    const projectId = updatedGoal.projectId;

    // Recalculate progress: (Objetivos Completados / Total de Objetivos) * 100
    const allProjectGoals = await prisma.goal.findMany({
      where: { projectId },
    });

    const total = allProjectGoals.length;
    const completed = allProjectGoals.filter((g) => g.status === 'COMPLETADO').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return NextResponse.json({
      success: true,
      goal: updatedGoal,
      projectProgress: percentage,
      completed,
      total
    });

  } catch (error) {
    console.error("Goal Update Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el objetivo y recalcular progreso." },
      { status: 500 }
    );
  }
}
