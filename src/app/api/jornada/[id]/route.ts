import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("time_logs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting timeLog" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    const { checkInTime, checkOutTime, areasVisited, description, peopleMet, modality } = body;

    // Get existing log
    const { data: existingLog, error: fetchError } = await supabase
      .from("time_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingLog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const checkInDate = new Date(existingLog.check_in_time);
    if (checkInTime) {
      const [inHours, inMins] = checkInTime.split(':');
      checkInDate.setHours(parseInt(inHours), parseInt(inMins), 0, 0);
    }
    const checkOutDate = new Date(existingLog.check_out_time || existingLog.check_in_time);
    if (checkOutTime) {
      const [outHours, outMins] = checkOutTime.split(':');
      checkOutDate.setHours(parseInt(outHours), parseInt(outMins), 0, 0);
    }

    const updatedAreasData = areasVisited !== undefined ? [areasVisited, description || ""] : existingLog.areas_visited;
    const updatedPeopleData = peopleMet !== undefined ? [peopleMet] : existingLog.people_met;

    const { data: updatedLog, error } = await supabase
      .from("time_logs")
      .update({
        check_in_time: checkInDate.toISOString(),
        check_out_time: checkOutDate.toISOString(),
        areas_visited: updatedAreasData,
        people_met: updatedPeopleData,
        modality: modality || existingLog.modality,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, log: updatedLog });
  } catch (error) {
    console.error("Jornada PUT error:", error);
    return NextResponse.json({ error: "Error updating timeLog" }, { status: 500 });
  }
}
