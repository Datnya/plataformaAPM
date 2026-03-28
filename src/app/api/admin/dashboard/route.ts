export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();

    // Get consultants
    const { data: consultants, error: consError } = await supabase
      .from("users")
      .select("id, name, status")
      .eq("role", "CONSULTOR");

    if (consError) throw consError;

    // Get projects with goals for each consultant
    const { data: projects, error: projError } = await supabase
      .from("projects")
      .select("id, name, consultant_id, goals ( id, status )");

    if (projError) throw projError;

    const transformed = (consultants || []).map((c: any) => {
      const consProjects = (projects || []).filter((p: any) => p.consultant_id === c.id);
      let totalGoals = 0;
      let completedGoals = 0;

      consProjects.forEach((p: any) => {
        const goals = p.goals || [];
        totalGoals += goals.length;
        completedGoals += goals.filter((g: any) => g.status === "COMPLETADO").length;
      });

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        projects: consProjects.length,
        totalGoals,
        completedGoals,
      };
    });

    // Quick stats
    const { count: totalProjects } = await supabase.from("projects").select("id", { count: "exact", head: true });
    const { count: totalClients } = await supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "CLIENTE").eq("status", "ACTIVO");
    const { count: totalConsultants } = await supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "CONSULTOR").eq("status", "ACTIVO");
    const { count: newProspects } = await supabase.from("prospects").select("id", { count: "exact", head: true }).eq("status", "NUEVO");

    return NextResponse.json({
      consultants: transformed,
      stats: {
        totalProjects: totalProjects || 0,
        totalConsultants: totalConsultants || 0,
        totalClients: totalClients || 0,
        newProspects: newProspects || 0,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Error al obtener stats del admin" }, { status: 500 });
  }
}
