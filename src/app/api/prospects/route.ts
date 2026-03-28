export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();

    const { data: prospects, error } = await supabase
      .from("prospects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // Transform to camelCase
    const transformed = (prospects || []).map((p: any) => ({
      id: p.id,
      companyName: p.company_name,
      tradeName: p.trade_name,
      industry: p.industry,
      contactName: p.contact_name,
      contactRole: p.contact_role,
      phone: p.phone,
      ruc: p.ruc,
      email: p.email,
      notes: p.notes,
      firstContactDate: p.first_contact_date,
      lastInteractionDate: p.last_interaction_date,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Prospects GET Error:", error);
    return NextResponse.json({ error: "Error al obtener prospectos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const body = await req.json();
    const {
      companyName, tradeName, industry, contactName,
      contactRole, phone, ruc, email, notes, firstContactDate, status
    } = body;

    const { data: newProspect, error } = await supabase
      .from("prospects")
      .insert({
        company_name: companyName || "Empresa sin nombre",
        trade_name: tradeName || null,
        industry: industry || null,
        contact_name: contactName || "Contacto sin nombre",
        contact_role: contactRole || null,
        phone: phone || null,
        ruc: ruc || null,
        email: email || null,
        notes: notes || null,
        first_contact_date: firstContactDate ? new Date(firstContactDate).toISOString() : new Date().toISOString(),
        last_interaction_date: new Date().toISOString(),
        status: status || "NUEVO",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, prospect: newProspect });
  } catch (error: any) {
    console.error("Error creating prospect:", error);
    return NextResponse.json({ error: error?.message || "Error al crear prospecto" }, { status: 500 });
  }
}
