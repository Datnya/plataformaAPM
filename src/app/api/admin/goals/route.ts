export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get('consultantId');

    if (!consultantId) {
       return NextResponse.json({ error: "consultantId is required" }, { status: 400 });
    }

    // Find goals related to projects belonging to this consultant
    // Since goals belong to project, we find projects by consultant
    const projects = await prisma.project.findMany({
      where: { consultantId },
      include: {
        goals: { orderBy: { createdAt: "desc" } }
      }
    });

    const goals = projects.flatMap(p => p.goals.map(g => ({ ...g, projectName: p.name })));

    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: "Error retrieving goals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, description, type, dueDate } = await req.json();

    const newGoal = await prisma.goal.create({
      data: {
        projectId,
        description,
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDIENTE"
      }
    });

    return NextResponse.json({ success: true, goal: newGoal });
  } catch (error) {
    return NextResponse.json({ error: "Error creating goal" }, { status: 500 });
  }
}
