import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

// GET: Fetch training service for current consultant
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN", "ESPECIALISTA"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const url = new URL(req.url);
    const consultantId = url.searchParams.get("consultantId");

    if (!consultantId) {
      return NextResponse.json(
        { error: "Falta el parámetro consultantId" },
        { status: 400 }
      );
    }

    const { data: service, error } = await supabase
      .from("training_services")
      .select("*")
      .eq("consultant_id", consultantId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ service: service || null });
  } catch (error) {
    console.error("GET Training Service Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Admin creates a new training service for a consultant
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const {
      consultantId,
      step1AdminDocUrl,
      step1AdminDocName,
      step2TemplateUrl,
      step3TemplateUrl,
      serviceStartDate,
      serviceEndDate,
      serviceDays,
      estimatedPaymentDate,
      clientCompany,
    } = body;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("training_services")
      .insert({
        consultant_id: consultantId,
        step1_admin_doc_url: step1AdminDocUrl || null,
        step1_admin_doc_name: step1AdminDocName || null,
        step2_template_url: step2TemplateUrl || null,
        step3_template_url: step3TemplateUrl || null,
        service_start_date: serviceStartDate || null,
        service_end_date: serviceEndDate || null,
        service_days: serviceDays || 0,
        estimated_payment_date: estimatedPaymentDate || null,
        client_company: clientCompany || null,
        status: "PENDIENTE",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ service: data });
  } catch (error) {
    console.error("POST Training Service Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH: Update training service (consultant uploads docs, marks steps done, or logs a session)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN", "ESPECIALISTA"]);
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const { serviceId, updates } = body;

    if (!serviceId || !updates) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Map frontend camelCase payload to db snake_case if necessary
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.step1ConsultantDocUrl !== undefined) {
      dbUpdates.step1_consultant_doc_url = updates.step1ConsultantDocUrl;
      dbUpdates.step1_consultant_doc_name = updates.step1ConsultantDocName;
      dbUpdates.step1_completed_at = updates.step1CompletedAt;
    }
    if (updates.step2ConsultantDocUrl !== undefined) {
      dbUpdates.step2_consultant_doc_url = updates.step2ConsultantDocUrl;
      dbUpdates.step2_consultant_doc_name = updates.step2ConsultantDocName;
      dbUpdates.step2_completed_at = updates.step2CompletedAt;
    }
    if (updates.step3ConsultantDocUrl !== undefined) {
      dbUpdates.step3_consultant_doc_url = updates.step3ConsultantDocUrl;
      dbUpdates.step3_consultant_doc_name = updates.step3ConsultantDocName;
      dbUpdates.step3_completed_at = updates.step3CompletedAt;
    }
    if (updates.step4CompletedAt !== undefined) {
      dbUpdates.step4_completed_at = updates.step4CompletedAt;
    }
    if (updates.step5CompletedAt !== undefined) {
      dbUpdates.step5_completed_at = updates.step5CompletedAt;
    }

    // Admin updates
    if (updates.step1AdminDocUrl !== undefined) {
      dbUpdates.step1_admin_doc_url = updates.step1AdminDocUrl;
      dbUpdates.step1_admin_doc_name = updates.step1AdminDocName;
    }
    if (updates.clientCompany !== undefined) {
      dbUpdates.client_company = updates.clientCompany;
    }
    if (updates.serviceDays !== undefined) {
      dbUpdates.service_days = updates.serviceDays;
    }
    if (updates.serviceStartDate !== undefined) {
      dbUpdates.service_start_date = updates.serviceStartDate;
    }
    if (updates.serviceEndDate !== undefined) {
      dbUpdates.service_end_date = updates.serviceEndDate;
    }
    if (updates.estimatedPaymentDate !== undefined) {
      dbUpdates.estimated_payment_date = updates.estimatedPaymentDate;
    }
    
    // For arrays (presentations, sessions) we overwrite JSON
    if (updates.presentations !== undefined) {
      dbUpdates.presentations = updates.presentations;
    }
    if (updates.sessions !== undefined) {
      dbUpdates.sessions = updates.sessions;
    }

    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from("training_services")
      .update(dbUpdates)
      .eq("id", serviceId)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error updating service:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ service: data });
  } catch (error) {
    console.error("PATCH Training Service Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
