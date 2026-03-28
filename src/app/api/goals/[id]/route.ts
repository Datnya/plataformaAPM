import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;
    const { status } = await req.json();

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // Update goal status
    const { data: updatedGoal, error } = await supabase
      .from("goals")
      .update({ status })
      .eq("id", id)
      .select("id, project_id, description, type, status, due_date")
      .single();

    if (error) throw error;

    const projectId = updatedGoal.project_id;

    // Recalculate progress
    const { data: allGoals, error: goalsError } = await supabase
      .from("goals")
      .select("id, status")
      .eq("project_id", projectId);

    if (goalsError) throw goalsError;

    const total = (allGoals || []).length;
    const completed = (allGoals || []).filter((g: any) => g.status === "COMPLETADO").length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return NextResponse.json({
      success: true,
      goal: {
        ...updatedGoal,
        projectId: updatedGoal.project_id,
        dueDate: updatedGoal.due_date,
      },
      projectProgress: percentage,
      completed,
      total,
    });
  } catch (error) {
    console.error("Goal Update Error:", error);
    return NextResponse.json({ error: "Error al actualizar el objetivo." }, { status: 500 });
  }
}
