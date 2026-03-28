import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

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

    // Transform to camelCase
    const transformed = (contents || []).map((c: any) => ({
      id: c.id,
      networks: c.networks, // already JSONB, comes as native array/object
      contentType: c.content_type,
      format: c.format,
      publishDate: c.publish_date,
      status: c.status,
      title: c.title,
      description: c.description,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

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
    const { networks, contentType, format, publishDate, status, title, description } = body;

    const { data: newContent, error } = await supabase
      .from("social_contents")
      .insert({
        networks: Array.isArray(networks) ? networks : JSON.parse(networks || "[]"),
        content_type: contentType,
        format,
        publish_date: new Date(publishDate).toISOString(),
        status: status || "PENDIENTE",
        title,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, content: newContent });
  } catch (error: any) {
    console.error("Error creating social content:", error);
    return NextResponse.json({ error: error?.message || "Error creating content" }, { status: 500 });
  }
}
