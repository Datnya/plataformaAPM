import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, courseTitle, duration, issueDate, participantName, participantCode, accessKey, pdfBase64 } = body;

    if (!projectId || !courseTitle || !participantName || !accessKey || !pdfBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
         auth: {
             autoRefreshToken: false,
             persistSession: false
         }
    });

    const bucketName = "certificados";
    
    // Convert base64 to buffer
    const buffer = Buffer.from(pdfBase64, "base64");
    const filePath = `${projectId}/${accessKey}.pdf`;

    // Attempt to upload
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: true
      });

    // If bucket does not exist, uploadError might complain. In production, Buckets are manually created.
    // If we assume it might not exist, we try to create it:
    if (uploadError && uploadError.message.includes("does not exist") || uploadError?.message.includes("Bucket not found")) {
        await supabaseAdmin.storage.createBucket(bucketName, { public: true });
        // Try again
        const retry = await supabaseAdmin.storage.from(bucketName).upload(filePath, buffer, { contentType: "application/pdf", upsert: true });
        if (retry.error) throw retry.error;
    } else if (uploadError) {
        throw uploadError;
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
    const pdfUrl = publicUrlData.publicUrl;

    // Save to Database
    const certificate = await prisma.certificate.create({
      data: {
        projectId: BigInt(projectId),
        courseTitle,
        participantName,
        participantCode,
        duration,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        accessKey,
        pdfUrl
      }
    });

    return NextResponse.json({ success: true, certificateId: certificate.id });
  } catch (error: any) {
    console.error("Certificate Upload Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate certificate" }, { status: 500 });
  }
}
