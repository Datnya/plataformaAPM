import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date) updateData.date = new Date(body.date).toISOString();
    if (body.emails) updateData.emails = Array.isArray(body.emails) ? body.emails : JSON.parse(body.emails);

    const { data: updated, error } = await supabase
      .from("activities")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, activity: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error editing activity" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting activity" }, { status: 500 });
  }
}
