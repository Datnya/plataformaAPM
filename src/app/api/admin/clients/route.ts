export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // If a specific client is requested, return detailed data
    if (clientId) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email, status")
        .eq("id", clientId)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      // Get projects where this user is a client user
      const { data: junctions, error: juncError } = await supabase
        .from("project_client_users")
        .select("project_id")
        .eq("user_id", clientId);

      if (juncError) throw juncError;

      const projectIds = (junctions || []).map((j: any) => j.project_id);

      let projectDetails: any[] = [];

      if (projectIds.length > 0) {
        const { data: projects, error: projError } = await supabase
          .from("projects")
          .select(`
            id, name, consultant_id,
            consultant:users!projects_consultant_id_fkey ( id, name ),
            goals ( id, description, type, status, due_date ),
            time_logs ( check_in_time, check_out_time, date, consultant_id )
          `)
          .in("id", projectIds);

        if (projError) throw projError;

        projectDetails = (projects || []).map((proj: any) => {
          const goals = proj.goals || [];
          const totalGoals = goals.length;
          const completedGoals = goals.filter((g: any) => g.status === "COMPLETADO").length;
          const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

          // Calculate hours for current month
          const now = new Date();
          const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthLogs = (proj.time_logs || []).filter((tl: any) => new Date(tl.date) >= firstOfMonth);
          let totalHours = 0;
          monthLogs.forEach((tl: any) => {
            if (tl.check_in_time && tl.check_out_time) {
              const diffMs = new Date(tl.check_out_time).getTime() - new Date(tl.check_in_time).getTime();
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
            goals: goals.map((g: any) => ({
              id: g.id, description: g.description, type: g.type,
              status: g.status, dueDate: g.due_date,
            })),
            hoursThisMonth: Math.round(totalHours * 100) / 100,
            totalLogs: monthLogs.length,
          };
        });
      }

      return NextResponse.json({ client: user, projects: projectDetails });
    }

    // Otherwise return all clients
    const { data: clients, error } = await supabase
      .from("users")
      .select("id, name, email, status")
      .eq("role", "CLIENTE")
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ clients: clients || [] });
  } catch (error) {
    console.error("Admin clients error:", error);
    return NextResponse.json({ error: "Error fetching client data" }, { status: 500 });
  }
}
