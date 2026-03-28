export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR", "CLIENTE"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("project_id", projectId)
      .order("date", { ascending: true });

    if (error) throw error;

    // Transform to camelCase
    const transformed = (activities || []).map((a: any) => ({
      id: a.id,
      projectId: a.project_id,
      title: a.title,
      description: a.description,
      date: a.date,
      emails: a.emails, // already JSONB
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    return NextResponse.json({ activities: transformed });
  } catch (error) {
    console.error("Calendar GET Error:", error);
    return NextResponse.json({ error: "Error retrieving activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { projectId, title, description, date, emails } = await req.json();

    if (!projectId || !title || !date || !emails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: newActivity, error } = await supabase
      .from("activities")
      .insert({
        project_id: projectId,
        title,
        description,
        date: new Date(date).toISOString(),
        emails: Array.isArray(emails) ? emails : JSON.parse(emails),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error("Calendar POST Error:", error);
    return NextResponse.json({ error: "Error creating activity" }, { status: 500 });
  }
}
