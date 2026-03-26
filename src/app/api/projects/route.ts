export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    
    const projects = await prisma.project.findMany({
      where: consultantId ? { consultantId } : {},
      include: {
        client: true,
        consultant: true,
        clientUsers: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, consultantId, clientUserIds } = body;

    // We make a robust default for date since UI doesn't specify it right now maybe
    const newProject = await prisma.project.create({
      data: {
        name,
        consultantId,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year default
        clientUsers: {
          connect: clientUserIds.map((id: string) => ({ id }))
        }
      },
      include: {
        consultant: true,
        clientUsers: true
      }
    });

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating project" }, { status: 500 });
  }
}
