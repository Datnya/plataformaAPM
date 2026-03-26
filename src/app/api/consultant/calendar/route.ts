export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    
    if (!consultantId) {
       return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    const notes = await prisma.adminNote.findMany({
      where: {
         title: "CONS_NOTE",
      },
      orderBy: { date: "asc" }
    });

    // filter parsed description
    const userNotes = notes.map(n => {
       try {
         const data = JSON.parse(n.description || "{}");
         if (data.consultantId === consultantId) {
            return {
               id: n.id,
               date: n.date,
               description: data.description,
            };
         }
       } catch(e) {}
       return null;
    }).filter(n => n !== null);

    return NextResponse.json({ notes: userNotes });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching consultant notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, description, consultantId } = body;

    const newNote = await prisma.adminNote.create({
      data: {
        title: "CONS_NOTE",
        date: new Date(date + "T00:00:00"),
        description: JSON.stringify({ consultantId, description })
      }
    });

    return NextResponse.json({ success: true, note: { id: newNote.id, date, description } });
  } catch (error) {
    return NextResponse.json({ error: "Error creating consultant note" }, { status: 500 });
  }
}
