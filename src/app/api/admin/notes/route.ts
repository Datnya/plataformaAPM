export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: notes, error } = await supabase
      .from("admin_notes")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { title, description, date } = body;

    const { data: note, error } = await supabase
      .from("admin_notes")
      .insert({
        title,
        description: description || "",
        date: new Date(date).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, note });
  } catch (error) {
    return NextResponse.json({ error: "Error creating note" }, { status: 500 });
  }
}
