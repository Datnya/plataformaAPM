export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");

    let query = supabase
      .from("projects")
      .select(`
        id, name, client_id, consultant_id, start_date, end_date, created_at,
        clients ( id, company_name ),
        consultant:users!projects_consultant_id_fkey ( id, name, email ),
        project_client_users ( user_id, users ( id, name, email ) )
      `)
      .order("created_at", { ascending: false });

    if (consultantId) {
      query = query.eq("consultant_id", consultantId);
    }

    const { data: projects, error } = await query;
    if (error) throw error;

    // Transform to camelCase for frontend compatibility
    const transformed = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      consultantId: p.consultant_id,
      clientId: p.client_id,
      startDate: p.start_date,
      endDate: p.end_date,
      createdAt: p.created_at,
      client: p.clients ? { id: p.clients.id, companyName: p.clients.company_name } : null,
      consultant: p.consultant,
      clientUsers: (p.project_client_users || []).map((pcu: any) => pcu.users),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Error fetching projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const body = await req.json();
    const { name, consultantId, clientUserIds } = body;

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name,
        consultant_id: consultantId,
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      })
      .select("id, name, consultant_id, start_date, end_date")
      .single();

    if (error) throw error;

    // Link client users via junction table
    if (clientUserIds && clientUserIds.length > 0) {
      const junctionRows = clientUserIds.map((uid: string) => ({
        project_id: project.id,
        user_id: uid,
      }));
      await supabase.from("project_client_users").insert(junctionRows);
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Projects POST error:", error);
    return NextResponse.json({ error: "Error creating project" }, { status: 500 });
  }
}
