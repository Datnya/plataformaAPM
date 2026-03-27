export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const supabase = await createClient();
    const { projectId } = await params;

    const { data: allGoals, error } = await supabase
      .from("goals")
      .select("id, description, type, status, due_date, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const goals = (allGoals || []).map((g: any) => ({
      id: g.id, description: g.description, type: g.type, status: g.status,
      dueDate: g.due_date, createdAt: g.created_at,
    }));

    const total = goals.length;
    const completed = goals.filter((g: any) => g.status === "COMPLETADO").length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return NextResponse.json({ goals, progress, completed, total });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener objetivos del proyecto." }, { status: 500 });
  }
}
