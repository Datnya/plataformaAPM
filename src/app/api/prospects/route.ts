export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const prospects = await prisma.prospect.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(prospects);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener prospectos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
       companyName, tradeName, industry, contactName, 
       contactRole, phone, ruc, email, notes, firstContactDate, status
    } = body;

    const newProspect = await prisma.prospect.create({
      data: {
        companyName: companyName || "Empresa sin nombre",
        tradeName: tradeName || null,
        industry: industry || null,
        contactName: contactName || "Contacto sin nombre",
        contactRole: contactRole || null,
        phone: phone || null,
        ruc: ruc || null,
        email: email || null,
        notes: notes || null,
        firstContactDate: firstContactDate ? new Date(firstContactDate) : new Date(),
        lastInteractionDate: new Date(),
        status: status || "NUEVO"
      }
    });

    return NextResponse.json({ success: true, prospect: newProspect });
  } catch (error: any) {
    console.error("Error creating prospect:", error);
    return NextResponse.json({ error: error?.message || "Error al crear prospecto", details: String(error) }, { status: 500 });
  }
}
