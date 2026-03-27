export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { projectId, clientId } = await req.json();

    if (!projectId || !clientId) {
      return NextResponse.json({ error: "Missing projectId or clientId" }, { status: 400 });
    }

    // Insert into project_client_users
    const { error } = await supabase
      .from("project_client_users")
      .insert({ project_id: projectId, user_id: clientId });

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "El cliente ya está asignado a este proyecto." }, { status: 400 });
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Client Project POST error:", error);
    return NextResponse.json({ error: "Error al asignar proyecto" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");

    if (!projectId || !clientId) {
      return NextResponse.json({ error: "Missing projectId or clientId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("project_client_users")
      .delete()
      .match({ project_id: projectId, user_id: clientId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Client Project DELETE error:", error);
    return NextResponse.json({ error: "Error al remover proyecto" }, { status: 500 });
  }
}
