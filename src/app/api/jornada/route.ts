import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { projectId, consultantId, date, modality, checkInTime, checkOutTime, areasVisited, peopleMet, description, fileUrls } = data;

    if (!projectId || !consultantId || !checkInTime || !checkOutTime) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para registrar la jornada." },
        { status: 400 }
      );
    }

    // Use the provided date or fallback to today
    const baseDate = date ? new Date(date + "T00:00:00") : new Date();
    
    const [inHours, inMins] = checkInTime.split(':');
    const [outHours, outMins] = checkOutTime.split(':');
    
    const checkInDate = new Date(baseDate);
    checkInDate.setHours(parseInt(inHours), parseInt(inMins), 0, 0);

    const checkOutDate = new Date(baseDate);
    checkOutDate.setHours(parseInt(outHours), parseInt(outMins), 0, 0);

    // Parse areas and description together
    const areasData = JSON.stringify([areasVisited, description]);
    const peopleData = JSON.stringify([peopleMet]);

    const timeLog = await prisma.timeLog.create({
      data: {
        projectId,
        consultantId,
        date: baseDate,
        checkInTime: checkInDate,
        checkOutTime: checkOutDate,
        modality,
        areasVisited: areasData,
        peopleMet: peopleData,
        evidenceUrls: JSON.stringify(fileUrls || []),
      },
    });

    return NextResponse.json({ success: true, logId: timeLog.id });

  } catch (error) {
    console.error("Jornada Error:", error);
    return NextResponse.json(
      { error: "Error al registrar la jornada en la base de datos." },
      { status: 500 }
    );
  }
}
