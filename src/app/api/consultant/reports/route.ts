export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    const projectId = searchParams.get("projectId");
    
    if (!consultantId) {
       return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    const notes = await prisma.adminNote.findMany({
      where: {
         title: "CONS_REPORT",
      },
      orderBy: { createdAt: "desc" }
    });

    const userReports = notes.map(n => {
       try {
         const data = JSON.parse(n.description || "{}");
         if (data.consultantId === consultantId) {
            if (projectId && data.projectId !== projectId) return null;
            return {
               id: n.id,
               ...data
            };
         }
       } catch(e) {}
       return null;
    }).filter(n => n !== null);

    return NextResponse.json({ reports: userReports });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching consultant reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { consultantId, reportData } = body;

    const newReport = await prisma.adminNote.create({
      data: {
        title: "CONS_REPORT",
        date: new Date(),
        description: JSON.stringify({ consultantId, ...reportData })
      }
    });

    return NextResponse.json({ success: true, report: { id: newReport.id, ...reportData } });
  } catch (error) {
    return NextResponse.json({ error: "Error creating consultant report" }, { status: 500 });
  }
}
