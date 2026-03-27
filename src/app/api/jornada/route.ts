import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const data = await req.json();
    const { projectId, consultantId, date, modality, checkInTime, checkOutTime, areasVisited, peopleMet, description, fileUrls } = data;

    if (!projectId || !consultantId || !checkInTime || !checkOutTime) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para registrar la jornada." },
        { status: 400 }
      );
    }

    const baseDate = date ? new Date(date + "T00:00:00") : new Date();

    const [inHours, inMins] = checkInTime.split(':');
    const [outHours, outMins] = checkOutTime.split(':');

    const checkInDate = new Date(baseDate);
    checkInDate.setHours(parseInt(inHours), parseInt(inMins), 0, 0);

    const checkOutDate = new Date(baseDate);
    checkOutDate.setHours(parseInt(outHours), parseInt(outMins), 0, 0);

    const areasData = [areasVisited, description];
    const peopleData = [peopleMet];

    const { data: timeLog, error } = await supabase
      .from("time_logs")
      .insert({
        project_id: projectId,
        consultant_id: consultantId,
        date: baseDate.toISOString().split('T')[0],
        check_in_time: checkInDate.toISOString(),
        check_out_time: checkOutDate.toISOString(),
        modality,
        areas_visited: areasData,
        people_met: peopleData,
        evidence_urls: fileUrls || [],
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, logId: timeLog.id });
  } catch (error) {
    console.error("Jornada Error:", error);
    return NextResponse.json(
      { error: "Error al registrar la jornada en la base de datos." },
      { status: 500 }
    );
  }
}
