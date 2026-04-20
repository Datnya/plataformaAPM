import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

// GET: Fetch adhoc service for current consultant
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN", "ESPECIALISTA"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId") || auth.userId;

    const { data, error } = await supabase
      .from("adhoc_services")
      .select("*")
      .eq("consultant_id", consultantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching adhoc service:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service: data });
  } catch (error) {
    console.error("Adhoc services GET error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// POST: Create a new adhoc service (admin only)
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
      reportDeadline,
      estimatedPaymentDate,
      clientCompany,
    } = body;

    if (!consultantId) {
      return NextResponse.json(
        { error: "Se requiere un consultor." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("adhoc_services")
      .insert({
        consultant_id: consultantId,
        step1_admin_doc_url: step1AdminDocUrl || null,
        step1_admin_doc_name: step1AdminDocName || null,
        step2_template_url: step2TemplateUrl || null,
        step3_template_url: step3TemplateUrl || null,
        service_start_date: serviceStartDate || null,
        service_end_date: serviceEndDate || null,
        service_days: serviceDays || 0,
        report_deadline: reportDeadline || null,
        estimated_payment_date: estimatedPaymentDate || null,
        client_company: clientCompany || null,
        status: "PENDIENTE",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating adhoc service:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service: data }, { status: 201 });
  } catch (error) {
    console.error("Adhoc services POST error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// PATCH: Update adhoc service (consultant uploads docs or admin updates)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN", "ESPECIALISTA"]);
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const { serviceId, updates } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "Se requiere el ID del servicio." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build update object with snake_case keys
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      step1ConsultantDocUrl: "step1_consultant_doc_url",
      step1ConsultantDocName: "step1_consultant_doc_name",
      step1CompletedAt: "step1_completed_at",
      step2ConsultantDocUrl: "step2_consultant_doc_url",
      step2ConsultantDocName: "step2_consultant_doc_name",
      step2CompletedAt: "step2_completed_at",
      step3ConsultantDocUrl: "step3_consultant_doc_url",
      step3ConsultantDocName: "step3_consultant_doc_name",
      step3CompletedAt: "step3_completed_at",
      auditReportUrl: "audit_report_url",
      auditReportName: "audit_report_name",
      auditReportUploadedAt: "audit_report_uploaded_at",
      status: "status",
      // Admin fields
      step1AdminDocUrl: "step1_admin_doc_url",
      step1AdminDocName: "step1_admin_doc_name",
      step2TemplateUrl: "step2_template_url",
      step3TemplateUrl: "step3_template_url",
      serviceStartDate: "service_start_date",
      serviceEndDate: "service_end_date",
      serviceDays: "service_days",
      reportDeadline: "report_deadline",
      estimatedPaymentDate: "estimated_payment_date",
      clientCompany: "client_company",
    };

    for (const [key, value] of Object.entries(updates || {})) {
      const dbField = fieldMap[key];
      if (dbField) {
        updateData[dbField] = value;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("adhoc_services")
      .update(updateData)
      .eq("id", serviceId)
      .select()
      .single();

    if (error) {
      console.error("Error updating adhoc service:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service: data });
  } catch (error) {
    console.error("Adhoc services PATCH error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
