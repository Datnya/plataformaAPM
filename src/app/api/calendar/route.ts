export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
       return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const activities = await prisma.activity.findMany({
      where: { projectId },
      orderBy: { date: "asc" }
    });

    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json({ error: "Error retrieving activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, title, description, date, emails } = await req.json();

    if (!projectId || !title || !date || !emails) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newActivity = await prisma.activity.create({
      data: {
        projectId,
        title,
        description,
        date: new Date(date),
        emails: JSON.stringify(emails)
      }
    });

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    return NextResponse.json({ error: "Error creating activity" }, { status: 500 });
  }
}
