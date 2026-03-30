export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ accessKey: string }> }
) {
  try {
    const { accessKey } = await params;

    if (!accessKey) {
      return NextResponse.json({ error: "Clave de acceso requerida" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("access_key", accessKey)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      certificate: {
        id: data.id,
        participant_name: data.participant_name,
        participant_code: data.participant_code,
        course_title: data.course_title,
        duration: data.duration,
        issue_date: data.issue_date,
        normas: data.normas,
        pdf_url: data.pdf_url,
      },
    });
  } catch (error) {
    console.error("Certificate validation error:", error);
    return NextResponse.json(
      { error: "Error al validar el certificado" },
      { status: 500 }
    );
  }
}
