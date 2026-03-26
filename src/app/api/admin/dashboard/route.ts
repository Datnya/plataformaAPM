export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const consultants = await prisma.user.findMany({
      where: { role: "CONSULTOR" },
      include: {
        projects: {
          include: {
            goals: true
          }
        }
      }
    });

    const transformed = consultants.map(c => {
      let totalGoals = 0;
      let completedGoals = 0;
      
      c.projects.forEach(p => {
        totalGoals += p.goals.length;
        completedGoals += p.goals.filter(g => g.status === "COMPLETADO").length;
      });

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        projects: c.projects.length,
        totalGoals,
        completedGoals
      };
    });

    // Also get quick stats
    const totalProjects = await prisma.project.count();
    const totalClients = await prisma.user.count({ where: { role: "CLIENTE", status: "ACTIVO" } });
    const totalConsultants = await prisma.user.count({ where: { role: "CONSULTOR", status: "ACTIVO" } });
    const newProspects = await prisma.prospect.count({ where: { status: "NUEVO" } });

    return NextResponse.json({
      consultants: transformed,
      stats: {
        totalProjects,
        totalConsultants,
        totalClients,
        newProspects
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Error al obtener stats del admin" }, { status: 500 });
  }
}
