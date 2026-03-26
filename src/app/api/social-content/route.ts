import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const contents = await prisma.socialContent.findMany({
      orderBy: { publishDate: 'asc' }
    });
    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { networks, contentType, format, publishDate, status, title, description } = body;

    const parsedNetworks = Array.isArray(networks) ? JSON.stringify(networks) : networks;

    const newContent = await prisma.socialContent.create({
      data: {
        networks: parsedNetworks,
        contentType,
        format,
        publishDate: new Date(publishDate),
        status: status || "PENDIENTE",
        title,
        description
      }
    });

    return NextResponse.json({ success: true, content: newContent });
  } catch (error: any) {
    console.error("Error creating social content:", error);
    return NextResponse.json({ error: error?.message || "Error creating content", details: String(error) }, { status: 500 });
  }
}
