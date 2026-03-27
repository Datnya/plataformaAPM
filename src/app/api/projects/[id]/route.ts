export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        id, name, client_id, consultant_id, start_date, end_date, created_at,
        consultant:users!projects_consultant_id_fkey ( id, name, email ),
        project_client_users ( user_id, users ( id, name, email ) ),
        goals ( id, description, type, status, due_date, created_at ),
        time_logs ( id, date, check_in_time, check_out_time, modality, areas_visited, people_met, evidence_urls, created_at ),
        certificates ( id, course_title, participant_name, pdf_url )
      `)
      .eq("id", id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Transform to camelCase
    const transformed = {
      id: project.id,
      name: project.name,
      consultantId: project.consultant_id,
      clientId: project.client_id,
      startDate: project.start_date,
      endDate: project.end_date,
      createdAt: project.created_at,
      consultant: project.consultant,
      clientUsers: (project.project_client_users || []).map((pcu: any) => pcu.users),
      certificates: project.certificates || [],
      goals: (project.goals || []).map((g: any) => ({
        id: g.id, description: g.description, type: g.type, status: g.status,
        dueDate: g.due_date, createdAt: g.created_at,
      })),
      timeLogs: (project.time_logs || []).map((t: any) => ({
        id: t.id, date: t.date, checkInTime: t.check_in_time, checkOutTime: t.check_out_time,
        modality: t.modality, areasVisited: JSON.stringify(t.areas_visited),
        peopleMet: JSON.stringify(t.people_met), evidenceUrls: t.evidence_urls,
        createdAt: t.created_at,
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Project GET error:", error);
    return NextResponse.json({ error: "Error fetching project detail" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Delete related records first (FK constraints)
    await supabase.from("time_logs").delete().eq("project_id", id);
    await supabase.from("goals").delete().eq("project_id", id);
    await supabase.from("activities").delete().eq("project_id", id);
    await supabase.from("project_client_users").delete().eq("project_id", id);

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project DELETE error:", error);
    return NextResponse.json({ error: "Error al eliminar el proyecto." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    const { name, consultantId, clientUserIds } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (consultantId) updateData.consultant_id = consultantId;

    let updated = null;
    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      updated = data;
    }

    // Update client users junction table
    if (clientUserIds) {
      await supabase.from("project_client_users").delete().eq("project_id", id);
      if (clientUserIds.length > 0) {
        const junctionRows = clientUserIds.map((uid: string) => ({
          project_id: id,
          user_id: uid,
        }));
        await supabase.from("project_client_users").insert(junctionRows);
      }
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Project PUT error:", error);
    return NextResponse.json({ error: "Error al actualizar el proyecto" }, { status: 500 });
  }
}
