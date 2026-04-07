export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const body = await req.json();

    const { projectId, courseTitle, duration, issueDate, normas,
            participantName, participantCode, accessKey, pdfUrl } = body;

    if (!projectId || !courseTitle || !participantName || !accessKey || !pdfUrl) {
      return NextResponse.json(
        { error: "Faltan campos requeridos", detail: { projectId: !!projectId, courseTitle: !!courseTitle, participantName: !!participantName, accessKey: !!accessKey, pdfUrl: !!pdfUrl } },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (e) {
      return NextResponse.json(
        { error: `Config error: ${e instanceof Error ? e.message : "Unknown"}` },
        { status: 500 }
      );
    }

    // Upsert certificate record (handles retries gracefully)
    const { data, error } = await supabase
      .from("certificates")
      .upsert({
        id: accessKey,
        project_id: Number(projectId),
        course_title: courseTitle,
        participant_name: participantName,
        participant_code: participantCode || "",
        duration: duration || "",
        issue_date: issueDate || "",
        normas: normas || null,
        pdf_url: pdfUrl,
        access_key: accessKey,
      }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json(
        { error: `Error guardando en DB: ${error.message}`, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, certificate: data });
  } catch (error) {
    console.error("Certificate save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error saving certificate" },
      { status: 500 }
    );
  }
}
