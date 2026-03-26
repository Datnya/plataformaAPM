export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    
    if (!consultantId) {
      return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    const projects = await prisma.project.findMany({
      where: { consultantId },
      include: {
        client: true,
        clientUsers: true,
        goals: true,
        timeLogs: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const enriched = projects.map(p => {
      const g = p.goals || [];
      const totalGoals = g.length;
      const completedGoals = g.filter(x => x.status === "COMPLETADO").length;
      const progress = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

      // calc hours
      let totalHours = 0;
      let remoteDays = 0;
      let presencialDays = 0;
      p.timeLogs.forEach(t => {
        if (t.checkInTime && t.checkOutTime) {
          const diffMs = new Date(t.checkOutTime).getTime() - new Date(t.checkInTime).getTime();
          const hrs = diffMs / (1000 * 60 * 60);
          totalHours += hrs;
        }
        if (t.modality === "REMOTO") remoteDays++;
        if (t.modality === "PRESENCIAL") presencialDays++;
      });

      return {
        id: p.id,
        name: p.name,
        clientName: p.client?.companyName || p.clientUsers?.[0]?.name || "Sin cliente",
        progress,
        totalGoals,
        completedGoals,
        goals: g,
        timeLogs: p.timeLogs,
        totalHours: Math.round(totalHours * 10) / 10,
        remoteDays,
        presencialDays
      };
    });

    return NextResponse.json({ projects: enriched });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching projects" }, { status: 500 });
  }
}
