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
    const consultantId = searchParams.get("consultantId");

    if (!consultantId) {
      return NextResponse.json({ error: "consultantId is required" }, { status: 400 });
    }

    // Get projects for this consultant with their goals
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, name, goals ( id, description, type, status, due_date, created_at )")
      .eq("consultant_id", consultantId);

    if (error) throw error;

    const goals = (projects || []).flatMap((p: any) =>
      (p.goals || []).map((g: any) => ({
        id: g.id,
        description: g.description,
        type: g.type,
        status: g.status,
        dueDate: g.due_date,
        createdAt: g.created_at,
        projectId: p.id,
        projectName: p.name,
      }))
    );

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Admin Goals GET Error:", error);
    return NextResponse.json({ error: "Error retrieving goals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { projectId, description, type, dueDate } = await req.json();

    const { data: newGoal, error } = await supabase
      .from("goals")
      .insert({
        project_id: projectId,
        description,
        type,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status: "PENDIENTE",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, goal: newGoal });
  } catch (error) {
    console.error("Admin Goals POST Error:", error);
    return NextResponse.json({ error: "Error creating goal" }, { status: 500 });
  }
}
