export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // If a specific client is requested, return detailed data
    if (clientId) {
      const user = await prisma.user.findUnique({
        where: { id: clientId },
        select: { id: true, name: true, email: true, status: true }
      });

      if (!user) return NextResponse.json({ error: "Client not found" }, { status: 404 });

      // Get projects where this user is a clientUser
      const projects = await prisma.project.findMany({
        where: { clientUsers: { some: { id: clientId } } },
        include: {
          consultant: { select: { id: true, name: true } },
          goals: true,
          timeLogs: {
            select: {
              checkInTime: true,
              checkOutTime: true,
              date: true,
              consultantId: true
            }
          }
        }
      });

      // Calculate goals progress per project
      const projectDetails = projects.map(proj => {
        const totalGoals = proj.goals.length;
        const completedGoals = proj.goals.filter(g => g.status === "COMPLETADO").length;
        const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        // Calculate hours for current month
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthLogs = proj.timeLogs.filter(tl => new Date(tl.date) >= firstOfMonth);
        let totalHours = 0;
        monthLogs.forEach(tl => {
          if (tl.checkInTime && tl.checkOutTime) {
            const diffMs = new Date(tl.checkOutTime).getTime() - new Date(tl.checkInTime).getTime();
            totalHours += diffMs / (1000 * 60 * 60);
          }
        });

        return {
          id: proj.id,
          name: proj.name,
          consultant: proj.consultant,
          progress,
          totalGoals,
          completedGoals,
          goals: proj.goals.map(g => ({
            id: g.id,
            description: g.description,
            type: g.type,
            status: g.status,
            dueDate: g.dueDate
          })),
          hoursThisMonth: Math.round(totalHours * 100) / 100,
          totalLogs: monthLogs.length
        };
      });

      return NextResponse.json({ client: user, projects: projectDetails });
    }

    // Otherwise return all clients
    const clients = await prisma.user.findMany({
      where: { role: "CLIENTE" },
      select: { id: true, name: true, email: true, status: true },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ clients });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching client data" }, { status: 500 });
  }
}
