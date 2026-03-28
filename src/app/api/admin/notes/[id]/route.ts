import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    const { title, description, date } = body;

    const { error } = await supabase
      .from("admin_notes")
      .update({
        title,
        description,
        date: new Date(date).toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Notes PUT Error:", error);
    return NextResponse.json({ error: "Error updating note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("admin_notes").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Notes DELETE Error:", error);
    return NextResponse.json({ error: "Error deleting note" }, { status: 500 });
  }
}
