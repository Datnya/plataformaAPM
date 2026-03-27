import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const signatures = await prisma.consultantSignature.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(signatures);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, base64Image } = body;

    if (!name || !base64Image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const bucketName = "firmas";
    const buffer = Buffer.from(base64Image, "base64");
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, buffer, { contentType: "image/png", upsert: true });

    if (uploadError && (uploadError.message.includes("does not exist") || uploadError.message.includes("not found"))) {
      await supabaseAdmin.storage.createBucket(bucketName, { public: true });
      const retry = await supabaseAdmin.storage.from(bucketName).upload(fileName, buffer, { contentType: "image/png", upsert: true });
      if (retry.error) throw retry.error;
    } else if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName);
    const signatureUrl = publicUrlData.publicUrl;

    const signature = await prisma.consultantSignature.create({
      data: { name, signatureUrl }
    });

    return NextResponse.json({ success: true, signature });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const signature = await prisma.consultantSignature.findUnique({ where: { id } });
    if (!signature) throw new Error("Signature not found");

    // We can also delete the image from Supabase, but leaving it is fine too, or extracting the filename
    const filename = signature.signatureUrl.split('/').pop();

    if (filename) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
           auth: { autoRefreshToken: false, persistSession: false }
        });
        await supabaseAdmin.storage.from("firmas").remove([filename]);
    }

    await prisma.consultantSignature.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
