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

    const updateData: any = {};
    if (body.description) updateData.description = body.description;
    if (body.status) updateData.status = body.status;
    if (body.dueDate !== undefined) updateData.due_date = body.dueDate ? new Date(body.dueDate).toISOString() : null;

    const { data: updated, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    console.error("Admin Goals PUT Error:", error);
    return NextResponse.json({ error: "Error editing goal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Goals DELETE Error:", error);
    return NextResponse.json({ error: "Error deleting goal" }, { status: 500 });
  }
}
