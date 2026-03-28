export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { safeJsonParse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");

    if (!consultantId) {
      return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    // Calendar notes stored as admin_notes with title = 'CONS_NOTE'
    const { data: notes, error } = await supabase
      .from("admin_notes")
      .select("*")
      .eq("title", "CONS_NOTE")
      .order("date", { ascending: true });

    if (error) throw error;

    const userNotes = (notes || []).map((n: any) => {
      const data = safeJsonParse<{ consultantId?: string; description?: string }>(n.description, {});
      if (data.consultantId === consultantId) {
        return { id: n.id, date: n.date, description: data.description };
      }
      return null;
    }).filter((n: any) => n !== null);

    return NextResponse.json({ notes: userNotes });
  } catch (error) {
    console.error("Consultant Calendar GET Error:", error);
    return NextResponse.json({ error: "Error fetching consultant notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const body = await req.json();
    const { date, description, consultantId } = body;

    const { data: newNote, error } = await supabase
      .from("admin_notes")
      .insert({
        title: "CONS_NOTE",
        date: new Date(date + "T00:00:00").toISOString(),
        description: JSON.stringify({ consultantId, description }),
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, note: { id: newNote.id, date, description } });
  } catch (error) {
    console.error("Consultant Calendar POST Error:", error);
    return NextResponse.json({ error: "Error creating consultant note" }, { status: 500 });
  }
}
