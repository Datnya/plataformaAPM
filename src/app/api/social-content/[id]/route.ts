import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    const { networks, contentType, format, publishDate, status, title, description } = body;

    const { data: updated, error } = await supabase
      .from("social_contents")
      .update({
        networks: Array.isArray(networks) ? networks : JSON.parse(networks || "[]"),
        content_type: contentType,
        format,
        publish_date: new Date(publishDate).toISOString(),
        status,
        title,
        description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    console.error("Social Content PUT Error:", error);
    return NextResponse.json({ error: "Error updating content" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("social_contents").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social Content DELETE Error:", error);
    return NextResponse.json({ error: "Error deleting content" }, { status: 500 });
  }
}
