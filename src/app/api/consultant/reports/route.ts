export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    const projectId = searchParams.get("projectId");

    if (!consultantId) {
      return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    // Reports are stored as admin_notes with title = 'CONS_REPORT'
    const { data: notes, error } = await supabase
      .from("admin_notes")
      .select("*")
      .eq("title", "CONS_REPORT")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const userReports = (notes || []).map((n: any) => {
      try {
        const data = JSON.parse(n.description || "{}");
        if (String(data.consultantId) === String(consultantId)) {
          if (projectId && String(data.projectId) !== String(projectId)) return null;
          return { id: n.id, ...data };
        }
      } catch (e) {}
      return null;
    }).filter((n: any) => n !== null);

    return NextResponse.json({ reports: userReports });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching consultant reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { consultantId, reportData } = body;

    const { data: newReport, error } = await supabase
      .from("admin_notes")
      .insert({
        title: "CONS_REPORT",
        date: new Date().toISOString(),
        description: JSON.stringify({ consultantId, ...reportData }),
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, report: { id: newReport.id, ...reportData } });
  } catch (error) {
    return NextResponse.json({ error: "Error creating consultant report" }, { status: 500 });
  }
}
