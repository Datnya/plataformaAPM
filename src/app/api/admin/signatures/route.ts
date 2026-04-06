export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("consultant_signatures")
      .select("id, name, cargo, signature_url, is_gerente, created_at")
      .order("is_gerente", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Signatures GET error:", error);
    return NextResponse.json({ error: "Error fetching signatures" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const { name, cargo, base64Image, isGerente } = await req.json();
    if (!name || !base64Image) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, "base64");
    const sigId = crypto.randomUUID();
    const filePath = `firmas/${sigId}.png`;

    // Upload to Supabase Storage (bucket: certificados)
    const { error: uploadError } = await getSupabaseAdmin().storage
      .from("certificados")
      .upload(filePath, buffer, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = getSupabaseAdmin().storage
      .from("certificados")
      .getPublicUrl(filePath);

    // If marking as gerente, unmark previous gerente
    if (isGerente) {
      await supabaseAdmin
        .from("consultant_signatures")
        .update({ is_gerente: false })
        .eq("is_gerente", true);
    }

    // Insert record
    const { data, error } = await supabaseAdmin
      .from("consultant_signatures")
      .insert({
        id: sigId,
        name,
        cargo: cargo || "Consultor",
        signature_url: urlData.publicUrl,
        is_gerente: isGerente ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Signatures POST error:", error);
    return NextResponse.json({ error: "Error saving signature" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    // Delete from storage
    await getSupabaseAdmin().storage
      .from("certificados")
      .remove([`firmas/${id}.png`]);

    // Delete from DB
    const { error } = await supabaseAdmin
      .from("consultant_signatures")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signatures DELETE error:", error);
    return NextResponse.json({ error: "Error deleting signature" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const { id, isGerente } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    // Unmark previous gerente if setting a new one
    if (isGerente) {
      await supabaseAdmin
        .from("consultant_signatures")
        .update({ is_gerente: false })
        .eq("is_gerente", true);
    }

    const { data, error } = await supabaseAdmin
      .from("consultant_signatures")
      .update({ is_gerente: isGerente })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Signatures PATCH error:", error);
    return NextResponse.json({ error: "Error updating signature" }, { status: 500 });
  }
}
