import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();

    // Map camelCase from frontend to snake_case for Supabase
    const updateData: any = {};
    if (body.companyName !== undefined) updateData.company_name = body.companyName;
    if (body.tradeName !== undefined) updateData.trade_name = body.tradeName;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.contactName !== undefined) updateData.contact_name = body.contactName;
    if (body.contactRole !== undefined) updateData.contact_role = body.contactRole;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.ruc !== undefined) updateData.ruc = body.ruc;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.firstContactDate) updateData.first_contact_date = new Date(body.firstContactDate).toISOString();
    if (body.lastInteractionDate) updateData.last_interaction_date = new Date(body.lastInteractionDate).toISOString();

    const { data: updated, error } = await supabase
      .from("prospects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, prospect: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error updating prospect" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("prospects").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting prospect" }, { status: 500 });
  }
}
