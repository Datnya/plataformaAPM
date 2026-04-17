import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assigned_to");

    let query = supabase
      .from("weekly_tasks")
      .select(`
        *,
        usuario:users!weekly_tasks_assigned_to_fkey(id, name, role)
      `)
      .order("due_date", { ascending: true });

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }

    const { data: tasks, error } = await query;
    if (error) throw error;

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    
    // Provide a default status if missing
    if (!body.status) {
      body.status = "PENDIENTE";
    }

    const { data: task, error } = await supabase
      .from("weekly_tasks")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: "Tarea creada", task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
