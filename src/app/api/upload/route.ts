import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "xlsx", "xls", "zip", "ppt", "pptx", "doc", "docx"];
const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  zip: "application/zip",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated and has ADMIN, CONSULTOR or ESPECIALISTA role
    const auth = await requireRole(["ADMIN", "CONSULTOR", "ESPECIALISTA"]);
    if ("error" in auth) return auth.error;

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se subio ningun archivo." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "El archivo supera el limite de 25MB. Por favor comprimelo en un .zip o subelo en partes.",
        },
        { status: 413 }
      );
    }

    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          error: `Formato de archivo no permitido (.${extension}). Solo se permite: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 415 }
      );
    }

    // Sanitize filename: remove path traversal, special chars
    const sanitized = fileName
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${sanitized}`;
    const storagePath = `${auth.userId}/${uniqueName}`;

    const supabase = await createClient();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evidencias")
      .upload(storagePath, file, {
        contentType: MIME_MAP[extension] || file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      return NextResponse.json(
        { error: "Error al subir el archivo al almacenamiento." },
        { status: 500 }
      );
    }

    // Get the public/signed URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("evidencias").getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path,
      name: fileName,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el archivo." },
      { status: 500 }
    );
  }
}
