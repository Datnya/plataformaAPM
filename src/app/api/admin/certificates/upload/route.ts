export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const formData = await req.formData();

    const projectId       = formData.get("projectId") as string;
    const courseTitle      = formData.get("courseTitle") as string;
    const duration         = formData.get("duration") as string;
    const issueDate        = formData.get("issueDate") as string;
    const normas           = formData.get("normas") as string | null;
    const participantName  = formData.get("participantName") as string;
    const participantCode  = formData.get("participantCode") as string;
    const accessKey        = formData.get("accessKey") as string;
    const pdfFile          = formData.get("pdf") as File | null;

    if (!projectId || !courseTitle || !participantName || !accessKey || !pdfFile) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Upload PDF to Supabase Storage
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const filePath = `pdfs/${projectId}/${accessKey}.pdf`;

    const { error: uploadError } = await getSupabaseAdmin().storage
      .from("certificados")
      .upload(filePath, buffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = getSupabaseAdmin().storage
      .from("certificados")
      .getPublicUrl(filePath);

    // Save certificate record to DB
    const { data, error } = await supabaseAdmin
      .from("certificates")
      .insert({
        id: accessKey,
        project_id: Number(projectId),
        course_title: courseTitle,
        participant_name: participantName,
        participant_code: participantCode,
        duration,
        issue_date: issueDate,
        normas: normas || null,
        pdf_url: urlData.publicUrl,
        access_key: accessKey,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, certificate: data });
  } catch (error) {
    console.error("Certificate upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error saving certificate" },
      { status: 500 }
    );
  }
}
