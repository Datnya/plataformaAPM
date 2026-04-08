export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (envErr: any) {
      console.error("Certificates: supabaseAdmin init failed:", envErr.message);
      return NextResponse.json({ error: envErr.message }, { status: 500 });
    }

    const { id } = await params;
    const { data: certificates, error } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(certificates || []);
  } catch (err: any) {
    console.error("Certificates GET error:", err);
    const msg = err.message || "Error desconocido";
    return NextResponse.json({ error: `Certificates error: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const courseTitle = url.searchParams.get("courseTitle");

    if (!courseTitle) {
      return NextResponse.json({ error: "Falta courseTitle" }, { status: 400 });
    }

    // 1. Fetch certificates to find access keys and paths
    const supabaseAdmin = getSupabaseAdmin();
    const { data: certs, error: fetchError } = await supabaseAdmin
      .from("certificates")
      .select("access_key")
      .eq("project_id", id)
      .eq("course_title", courseTitle);

    if (fetchError) throw fetchError;
    if (!certs || certs.length === 0) {
      return NextResponse.json({ success: true, message: "No certs found" });
    }

    // 2. Remove files from Supabase Storage
    const pathsToRemove = certs.map((c: any) => `pdfs/${id}/${c.access_key}.pdf`);
    
    const { error: storageError } = await supabaseAdmin.storage
      .from("certificados")
      .remove(pathsToRemove);

    if (storageError) {
      console.error("Storage delete error (might be missing files):", storageError);
      // We will continue to delete DB records even if some storage files weren't found
    }

    // 3. Remove records from Database
    const { error: dbError } = await supabaseAdmin
      .from("certificates")
      .delete()
      .eq("project_id", id)
      .eq("course_title", courseTitle);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, count: certs.length });
  } catch (err: any) {
    console.error("Error deleting certificates:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
