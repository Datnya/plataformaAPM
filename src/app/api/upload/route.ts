import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Límite estricto de 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "xlsx", "xls", "zip"];

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo." }, { status: 400 });
    }

    // 1. Validar Tamaño Libre (Límite 25MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo supera el límite de 25MB. Por favor comprímelo en un .zip o súbelo en partes." },
        { status: 413 } // Payload Too Large
      );
    }

    // 2. Validar Formatos (Extensiones permitidas)
    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Formato de archivo no permitido (.${extension}). Solo se permite: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 415 } // Unsupported Media Type
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Mover archivo a public/uploads/
    const uploadDir = join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre seguro y único
    const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
    const path = join(uploadDir, uniqueName);

    await writeFile(path, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url: fileUrl, name: fileName });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el archivo." },
      { status: 500 }
    );
  }
}
