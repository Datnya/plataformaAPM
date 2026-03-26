export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notes = await prisma.adminNote.findMany({
      orderBy: { date: "asc" }
    });
    return NextResponse.json({ notes });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, date } = body;

    const note = await prisma.adminNote.create({
      data: {
        title,
        description: description || "",
        date: new Date(date)
      }
    });
    return NextResponse.json({ success: true, note });
  } catch (error) {
    return NextResponse.json({ error: "Error creating note" }, { status: 500 });
  }
}
