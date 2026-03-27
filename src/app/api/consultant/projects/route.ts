export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");

    if (!consultantId) {
      return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    // Get projects for consultant with goals and time_logs
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        id, name, client_id, consultant_id, created_at,
        clients ( id, company_name ),
        project_client_users ( user_id, users ( id, name, email ) ),
        goals ( id, description, type, status, due_date, created_at ),
        time_logs ( id, date, check_in_time, check_out_time, modality, areas_visited, people_met, evidence_urls, created_at )
      `)
      .eq("consultant_id", consultantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const enriched = (projects || []).map((p: any) => {
      const g = p.goals || [];
      const totalGoals = g.length;
      const completedGoals = g.filter((x: any) => x.status === "COMPLETADO").length;
      const progress = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

      let totalHours = 0;
      let remoteDays = 0;
      let presencialDays = 0;
      (p.time_logs || []).forEach((t: any) => {
        if (t.check_in_time && t.check_out_time) {
          const diffMs = new Date(t.check_out_time).getTime() - new Date(t.check_in_time).getTime();
          totalHours += diffMs / (1000 * 60 * 60);
        }
        if (t.modality === "REMOTO") remoteDays++;
        if (t.modality === "PRESENCIAL") presencialDays++;
      });

      const clientUsers = (p.project_client_users || []).map((pcu: any) => pcu.users).filter(Boolean);
      const clientName = clientUsers.length > 0 
        ? clientUsers.map((u: any) => u.name).join(", ")
        : "Sin cliente asignado";

      return {
        id: p.id,
        name: p.name,
        clientName,
        clientUsers,
        progress,
        totalGoals,
        completedGoals,
        goals: g.map((goal: any) => ({
          id: goal.id, description: goal.description, type: goal.type,
          status: goal.status, dueDate: goal.due_date, createdAt: goal.created_at,
        })),
        timeLogs: (p.time_logs || []).map((t: any) => ({
          id: t.id, date: t.date, checkInTime: t.check_in_time, checkOutTime: t.check_out_time,
          modality: t.modality, areasVisited: JSON.stringify(t.areas_visited),
          peopleMet: JSON.stringify(t.people_met), createdAt: t.created_at,
        })),
        totalHours: Math.round(totalHours * 10) / 10,
        remoteDays,
        presencialDays,
      };
    });

    return NextResponse.json({ projects: enriched });
  } catch (error) {
    console.error("Consultant projects error:", error);
    return NextResponse.json({ error: "Error fetching projects" }, { status: 500 });
  }
}
