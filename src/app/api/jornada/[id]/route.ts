import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    await prisma.timeLog.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting timeLog" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const { id } = p;
    const body = await req.json();
    const { checkInTime, checkOutTime, areasVisited, description, peopleMet, modality } = body;

    const existingLog = await prisma.timeLog.findUnique({ where: { id } });
    if (!existingLog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const checkInDate = new Date(existingLog.checkInTime);
    if (checkInTime) {
      const [inHours, inMins] = checkInTime.split(':');
      checkInDate.setHours(parseInt(inHours), parseInt(inMins), 0, 0);
    }
    const checkOutDate = new Date(existingLog.checkOutTime || existingLog.checkInTime);
    if (checkOutTime) {
      const [outHours, outMins] = checkOutTime.split(':');
      checkOutDate.setHours(parseInt(outHours), parseInt(outMins), 0, 0);
    }

    const updatedAreasData = areasVisited !== undefined ? JSON.stringify([areasVisited, description || ""]) : existingLog.areasVisited;
    const updatedPeopleData = peopleMet !== undefined ? JSON.stringify([peopleMet]) : existingLog.peopleMet;

    const updatedLog = await prisma.timeLog.update({
      where: { id },
      data: {
        checkInTime: checkInDate,
        checkOutTime: checkOutDate,
        areasVisited: updatedAreasData,
        peopleMet: updatedPeopleData,
        modality: modality || existingLog.modality
      }
    });

    return NextResponse.json({ success: true, log: updatedLog });
  } catch (error) {
    console.error("Jornada PUT error:", error);
    return NextResponse.json({ error: "Error updating timeLog" }, { status: 500 });
  }
}
