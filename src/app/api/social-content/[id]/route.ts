import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

// Helper to map UI status to DB allowed list to bypass check constraints
// DB constraint: status IN ('PENDIENTE', 'EN_PROCESO', 'LANZADO')
function getDbStatus(uiStatus: string) {
  if (uiStatus === "SUBIDO") return "LANZADO";
  if (uiStatus === "PROGRAMADO") return "PENDIENTE";
  return "EN_PROCESO";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    const {
      networks, contentType, format, publishDate, status, title, description,
      month, platform, contentPillar, topic, postType, objectiveKpi, calendarBrand, canvaLink,
    } = body;

    const uiStatus = status || "EN DESARROLLO";
    const packedKpi = `${objectiveKpi || ""}|||${uiStatus}`;

    // Safely resolve networks to a JSON array
    let resolvedNetworks: string[] = [];
    if (Array.isArray(networks)) {
      resolvedNetworks = networks;
    } else if (typeof networks === "string" && networks.length > 0) {
      try { resolvedNetworks = JSON.parse(networks); } catch { resolvedNetworks = []; }
    }

    const updateData: Record<string, any> = {
      // Legacy fields
      networks: resolvedNetworks,
      content_type: contentPillar || contentType,
      format: postType || format,
      publish_date: new Date(publishDate).toISOString(),
      status: getDbStatus(uiStatus),
      title: topic || title,
      description,
      // New schema columns
      month: month || "",
      platform: platform || "",
      content_pillar: contentPillar || contentType || "",
      topic: topic || title || "",
      post_type: postType || format || "",
      objective_kpi: packedKpi,
      calendar_brand: calendarBrand || "APM",
      canva_link: canvaLink || "",
    };

    const { data: updated, error } = await supabase
      .from("social_contents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    console.error("Social Content PUT Error:", error);
    return NextResponse.json({ error: "Error updating content" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("social_contents").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social Content DELETE Error:", error);
    return NextResponse.json({ error: "Error deleting content" }, { status: 500 });
  }
}
