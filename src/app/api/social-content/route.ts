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

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();

    const { data: contents, error } = await supabase
      .from("social_contents")
      .select("*")
      .order("publish_date", { ascending: true });

    if (error) throw error;

    // Transform to camelCase — support both old and new schema columns
    const transformed = (contents || []).map((c: any) => {
      // Decode the true status if it was packed into objective_kpi
      let uiStatus = c.status;
      let uiKpi = c.objective_kpi || "";
      if (c.objective_kpi && c.objective_kpi.includes("|||")) {
        const parts = c.objective_kpi.split("|||");
        uiKpi = parts[0];
        uiStatus = parts[1];
      }

      return {
        id: c.id,
        // New schema fields
        month: c.month || "",
        platform: c.platform || "",
        contentPillar: c.content_pillar || c.content_type || "",
        topic: c.topic || c.title || "",
        postType: c.post_type || c.format || "",
        objectiveKpi: uiKpi,
        calendarBrand: c.calendar_brand || "APM",
        canvaLink: c.canva_link || "",
        // Shared fields
        publishDate: c.publish_date,
        status: uiStatus,
        description: c.description,
        // Legacy fields (for backwards compat)
        title: c.title,
        networks: c.networks,
        contentType: c.content_type,
        format: c.format,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN", "CONSULTOR"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();
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

    const insertData: Record<string, any> = {
      // Legacy fields — always populated for backwards compat
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

    const { data: newContent, error } = await supabase
      .from("social_contents")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, content: newContent });
  } catch (error: any) {
    console.error("Error creating social content:", error);
    return NextResponse.json({ error: error?.message || "Error creating content" }, { status: 500 });
  }
}
