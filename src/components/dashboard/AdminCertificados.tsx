"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, CheckCircle2, Loader2, Award, Printer,
  Trash2, Plus, X, Download, FileDown, Star, Eye, Save
} from "lucide-react";
import * as XLSX from "xlsx";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

/* ─── Types ─────────────────────────────────────────────── */
interface Signature {
  id: string;
  name: string;
  cargo: string;
  signature_url: string;
  is_gerente: boolean;
}

interface Project {
  id: string | number;
  name: string;
  client: { companyName: string } | null;
}

interface CertResult {
  name: string;
  code: string;
  accessKey: string;
  pdfBlob?: Blob;
}

/* ─── Helpers ────────────────────────────────────────────── */

/** Load an image URL and compress it via canvas. Returns a JPEG data-URL. */
async function loadAndCompressImage(
  url: string,
  maxW = 1200,
  quality = 0.6,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Load an image URL as a data-URL (for small images like signatures) */
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Converts a Blob to a base64 string (without the data: prefix) */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

/* ─── PDF Layout constants (A4 landscape = 297 × 210 mm) ─── */
// Background image zones to avoid:
//   • APM GROUP logo  → x ≈ 119–166 mm,  y ≈ 8–36 mm   (top-center)
//   • Seal "APM GROUP CERTIFICADO" → x ≈ 9–67 mm, y ≈ 79–147 mm (left-mid)
//   • Decorative frame → ~11 mm in from all edges

const CX_BODY = 172;   // X center for body text (avoids left seal)
const CX_FULL = 148.5; // X center for top elements (above seal zone)

/* ─── Component ──────────────────────────────────────────── */
export default function AdminCertificados() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);

  // Form fields
  const [selectedProject, setSelectedProject] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [normasText, setNormasText] = useState(
    "ISO 9001:2015 – Gestión de la Calidad\n" +
    "ISO 14001:2015 – Gestión Ambiental\n" +
    "ISO 45001:2018 – Seguridad y Salud en el Trabajo\n" +
    "ISO 37001:2016 – Antisoborno"
  );
  const [gerenteSigId, setGerenteSigId] = useState("");
  const [consultorSigId, setConsultorSigId] = useState("");

  // Excel
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CertResult[]>([]);

  // Modals
  const [showResultModal, setShowResultModal] = useState(false);
  const [showSigsModal, setShowSigsModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Guardar a proyecto
  const [savingToProject, setSavingToProject] = useState(false);
  const [isSavedToProject, setIsSavedToProject] = useState(false);
  const [isZipping, setIsZipping] = useState(false); // Added for ZIP building state
  // New signature form
  const [newSigName, setNewSigName] = useState("");
  const [newSigCargo, setNewSigCargo] = useState("");
  const [newSigFile, setNewSigFile] = useState<File | null>(null);
  const [newSigGerente, setNewSigGerente] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  // Cache compressed background (only compress once)
  const bgCacheRef = useRef<string | null>(null);

  /* ── Load data ──────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    const [projRes, sigRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/admin/signatures"),
    ]);
    const projData = await projRes.json();
    const sigData = await sigRes.json();

    if (!Array.isArray(projData)) console.error("Projects API error:", projData);
    if (!Array.isArray(sigData)) console.error("Signatures API error:", sigData);

    const projs = Array.isArray(projData) ? projData : [];
    const sigs = Array.isArray(sigData) ? sigData : [];

    setProjects(projs);
    setSignatures(sigs);

    const gerente = sigs.find((s: Signature) => s.is_gerente);
    const consultor = sigs.find((s: Signature) => !s.is_gerente);
    if (gerente) setGerenteSigId(gerente.id);
    if (consultor) setConsultorSigId(consultor.id);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Excel upload ───────────────────────────────────────── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" });

      // Prefer the sheet named "Certificados" (case-insensitive), otherwise use the first sheet
      const certSheetName = wb.SheetNames.find(
        (name) => name.toLowerCase().trim() === "certificados"
      );
      const sheetName = certSheetName || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      
      // Read as 2D array to find where the actual headers are
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      const normalize = (s: string) => s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLowerCase().trim() : "";
      
      let headerRowIndex = 0;
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || !Array.isArray(row)) continue;
        
        const strRow = row.map(v => normalize(String(v)));
        if (strRow.includes("nombres") || strRow.includes("apellido paterno") || strRow.includes("codigos") || strRow.includes("apellidos")) {
          headerRowIndex = i;
          break;
        }
      }

      // Parse data starting exactly from the header row
      const dataObjects = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });
      setExcelData(dataObjects as Record<string, unknown>[]);
    };
    reader.readAsBinaryString(file);
  };

  /* ── PDF generation (pdf-lib) ────────────────────────── */
  const generatePDF = useCallback(async (
    participantName: string,
    participantCode: string,
    accessKey: string,
  ): Promise<Blob | null> => {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const QRCode = await import("qrcode");

    try {
      const bgRes = await fetch("/bg-certificado.pdf");
      if (!bgRes.ok) throw new Error("No se pudo cargar el PDF de fondo");
      const bgBytes = await bgRes.arrayBuffer();

      // Use the new background PDF directly (it already has correct A4 dimensions)
      const doc = await PDFDocument.load(bgBytes);
      const page = doc.getPages()[0];
      const { width: pageWidthPt, height: pageHeightPt } = page.getSize();

      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await doc.embedFont(StandardFonts.Helvetica);
      const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

      const mm2pt = (mm: number) => mm * 2.83465;
      const pt2mm = (pt: number) => pt / 2.83465;

      const PAGE_W_MM = pt2mm(pageWidthPt);
      const PAGE_H_MM = pt2mm(pageHeightPt);
      const CX = PAGE_W_MM / 2;

      console.log(`PDF page: ${PAGE_W_MM.toFixed(1)}mm x ${PAGE_H_MM.toFixed(1)}mm — center at ${CX.toFixed(1)}mm`);

      const toColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      const drawText = (
        text: string,
        xMmCenter: number,
        yMmFromTop: number,
        sizePt: number,
        colorHex: string,
        fontId: any
      ) => {
        const textStr = text || "";
        const textWidthPt = fontId.widthOfTextAtSize(textStr, sizePt);
        const xPt = mm2pt(xMmCenter) - (textWidthPt / 2);
        page.drawText(textStr, {
          x: xPt,
          y: pageHeightPt - mm2pt(yMmFromTop),
          size: sizePt,
          font: fontId,
          color: toColor(colorHex),
        });
      };

      const drawLine = (x1Mm: number, y1Mm: number, x2Mm: number, y2Mm: number, hex: string, thicknessPt: number) => {
        page.drawLine({
          start: { x: mm2pt(x1Mm), y: pageHeightPt - mm2pt(y1Mm) },
          end: { x: mm2pt(x2Mm), y: pageHeightPt - mm2pt(y2Mm) },
          thickness: thicknessPt,
          color: toColor(hex)
        });
      };

      const drawImageCenter = (img: any, xMmCenter: number, yMmCenter: number, wMm: number) => {
        const hMm = wMm * (img.height / img.width);
        page.drawImage(img, {
          x: mm2pt(xMmCenter - wMm / 2),
          y: pageHeightPt - mm2pt(yMmCenter + hMm / 2),
          width: mm2pt(wMm),
          height: mm2pt(hMm)
        });
      };

      // ══════════════════════════════════════════════════════
      // FIXED POSITIONS (mm from top) — calibrated to A4 landscape reference
      // ══════════════════════════════════════════════════════

      /* ── LOGO APM at Top Center ── */
      try {
        const logoRes = await fetch("/logo-apm.png");
        if (logoRes.ok) {
          const logoImage = await doc.embedPng(await logoRes.arrayBuffer());
          drawImageCenter(logoImage, CX, 16, 35);
        }
      } catch (err) { console.error("Error drawing Logo:", err); }

      // Title
      drawText(courseTitle.toUpperCase(), CX, 54, 19, "#1e293b", fontBold);

      // "Se otorga a:"
      drawText("Se otorga a:", CX, 64, 13, "#6b7280", fontItalic);

      // Participant name
      drawText(participantName.toUpperCase(), CX, 73, 22, "#111827", fontBold);

      // "Por haber completado..."
      drawText("Por haber completado satisfactoriamente el programa de:", CX, 83, 12, "#4b5563", fontNormal);

      // Program description
      const progDesc = programDescription || courseTitle;
      drawText(progDesc, CX, 92, 15, "#1e293b", fontBold);

      // Decorative line
      drawLine(CX - 40, 99, CX + 40, 99, "#d1d5db", 0.8);

      // "Basado en las normas:"
      drawText("Basado en las normas:", CX, 105, 12, "#6b7280", fontItalic);

      // Norma lines
      const normaLines = normasText.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 6);
      normaLines.forEach((line, i) => {
        drawText(line, CX, 112 + i * 7, 11, "#374151", fontNormal);
      });

      // Data line: "Duración: XX horas | Fecha: ..."
      const afterNormasY = 112 + Math.max(normaLines.length, 1) * 7;
      const dataLineY = Math.max(afterNormasY + 4, 150);
      const dataText = `Duración: ${duration}     |     Fecha: ${issueDate}`;
      drawText(dataText, CX, dataLineY, 11, "#374151", fontItalic);

      // ── Sello APM on the LEFT (bigger, 2cm higher) ──
      const SELLO_CX = 45;
      const SELLO_CY = 90;
      const SELLO_W = 55;
      try {
        const selloRes = await fetch("/sello-apm-v2.png");
        if (selloRes.ok) {
          const selloImage = await doc.embedPng(await selloRes.arrayBuffer());
          drawImageCenter(selloImage, SELLO_CX, SELLO_CY, SELLO_W);
        }
      } catch (err) { console.error("Error drawing Sello:", err); }

      // ── QR Code on the RIGHT (bigger, 2cm higher, same height as sello) ──
      const QR_SIZE_MM = 40;
      const QR_CX = PAGE_W_MM - SELLO_CX;
      const QR_CY = SELLO_CY;
      const qrUrl = `${window.location.origin}/certificados/validar/${accessKey}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 512 });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBytes = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0));
      const qrImage = await doc.embedPng(qrBytes);
      drawImageCenter(qrImage, QR_CX, QR_CY, QR_SIZE_MM);

      // ── Signatures (lines/names/cargos tight below signature image) ──
      const SIG_W_MM = 35;
      const SIG_CENTER_Y = 168;
      const sigLineY = 176;
      const sigNameY = 179;
      const sigCargoY = 183;
      const SIG_LEFT_CX = CX - 45;
      const SIG_RIGHT_CX = CX + 45;

      const gerenteSig = signatures.find((s:any) => s.id === gerenteSigId);
      const consultorSig = signatures.find((s:any) => s.id === consultorSigId);

      const makeTransparent = (srcBytes: ArrayBuffer): Promise<Uint8Array | null> => {
        return new Promise((resolve) => {
          const blob = new Blob([srcBytes]);
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              if (d[i] > 200 && d[i+1] > 200 && d[i+2] > 200) {
                d[i+3] = 0;
              } else if (d[i] > 160 && d[i+1] > 160 && d[i+2] > 160) {
                d[i+3] = Math.max(0, d[i+3] - 150);
              }
            }
            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            URL.revokeObjectURL(url);
            const base64 = dataUrl.split(',')[1];
            resolve(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      const embedSigImage = async (url: string) => {
        try {
          const res = await fetch(url);
          const bytes = await res.arrayBuffer();
          const cleanPngBytes = await makeTransparent(bytes);
          if (cleanPngBytes) {
            return await doc.embedPng(cleanPngBytes).catch(() => doc.embedJpg(bytes));
          }
          return await doc.embedPng(bytes).catch(() => doc.embedJpg(bytes));
        } catch { return null; }
      };

      if (gerenteSig?.signature_url) {
        const img = await embedSigImage(gerenteSig.signature_url);
        if (img) drawImageCenter(img, SIG_LEFT_CX, SIG_CENTER_Y, SIG_W_MM + 20);
      }

      if (consultorSig?.signature_url) {
        const img = await embedSigImage(consultorSig.signature_url);
        if (img) drawImageCenter(img, SIG_RIGHT_CX, SIG_CENTER_Y, SIG_W_MM);
      }

      // Signature lines
      drawLine(SIG_LEFT_CX - 22, sigLineY, SIG_LEFT_CX + 22, sigLineY, "#6b7280", 1.0);
      drawLine(SIG_RIGHT_CX - 22, sigLineY, SIG_RIGHT_CX + 22, sigLineY, "#6b7280", 1.0);

      // Signature names
      if (gerenteSig) drawText(gerenteSig.name, SIG_LEFT_CX, sigNameY, 12, "#1e293b", fontBold);
      if (consultorSig) drawText(consultorSig.name, SIG_RIGHT_CX, sigNameY, 12, "#1e293b", fontBold);

      // Signature cargos
      if (gerenteSig) drawText(gerenteSig.cargo || "Gerente General", SIG_LEFT_CX, sigCargoY, 10, "#6b7280", fontNormal);
      if (consultorSig) drawText(consultorSig.cargo || "Consultor", SIG_RIGHT_CX, sigCargoY, 10, "#6b7280", fontNormal);

      // Código at bottom right
      drawText(`Código: ${participantCode}`, PAGE_W_MM - 50, sigCargoY, 10, "#374151", fontNormal);

      const pdfBytesFinal = await doc.save();
      return new Blob([pdfBytesFinal.buffer as ArrayBuffer], { type: "application/pdf" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  }, [courseTitle, programDescription, duration, issueDate, normasText, signatures, gerenteSigId, consultorSigId]);

  /* ── Generation handler ─────────────────────────────────── */
  const handleGenerate = async () => {
    if (!selectedProject || !courseTitle || !duration || !issueDate || excelData.length === 0) {
      alert("Completa todos los campos obligatorios y sube el Excel.");
      return;
    }

    setGenerating(true);
    setProgress(0);
    const generated: CertResult[] = [];
    let errorCount = 0;

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      // Flexible column matching: normalize keys to compare without accents/case
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLowerCase().trim();

      const getVal = (row: Record<string, unknown>, ...candidates: string[]) => {
        for (const key of Object.keys(row)) {
          const nk = normalize(key);
          for (const c of candidates) {
            if (nk === normalize(c)) return String(row[key] ?? "").trim();
          }
        }
        return "";
      };

      const apPaterno = getVal(row, "Apellido Paterno", "Apellido paterno", "APELLIDO PATERNO", "Primer Apellido");
      const apMaterno = getVal(row, "Apellido Materno", "Apellido materno", "APELLIDO MATERNO", "Segundo Apellido");
      const nombres = getVal(row, "Nombres", "Nombre", "NOMBRES", "NOMBRE");
      const code = getVal(row, "Códigos", "Codigo", "Código", "Codigos", "CÓDIGOS", "CODIGO", "CODIGOS", "código", "codigos");

      // Also support old format: "Apellidos" (single column) for backwards compatibility
      const apellidosSingle = getVal(row, "Apellidos", "Apellido", "APELLIDOS", "APELLIDO");

      let fullName = "";
      if (apPaterno || apMaterno) {
        // New format: APELLIDO PATERNO APELLIDO MATERNO, NOMBRES
        const apellidos = [apPaterno, apMaterno].filter(Boolean).join(" ");
        fullName = nombres ? `${apellidos}, ${nombres}` : apellidos;
      } else if (apellidosSingle) {
        // Legacy format: APELLIDOS, NOMBRES
        fullName = nombres ? `${apellidosSingle}, ${nombres}` : apellidosSingle;
      } else if (nombres) {
        fullName = nombres;
      }

      if (!fullName) continue;

      const accessKey = crypto.randomUUID();
      const pdfBlob = await generatePDF(fullName, code, accessKey);
      if (!pdfBlob) { errorCount++; continue; }

      generated.push({ name: fullName, code, accessKey, pdfBlob });
      setProgress(Math.round(((i + 1) / excelData.length) * 100));
    }

    setGenerating(false);
    setResults(generated);
    setIsSavedToProject(false);
    setShowResultModal(true);

    if (errorCount > 0) {
      alert(`${generated.length} certificados pre-generados. ${errorCount} con errores de creación técnica.`);
    }
  };

  /* ── Save to Project (Mass upload) ───────────────────────── */
  const handleSaveToProject = async () => {
    setSavingToProject(true);
    let errorCount = 0;
    let lastError = "";
    const supabaseClient = createBrowserSupabase();

    for (let i = 0; i < results.length; i++) {
      const cert = results[i];
      try {
        // Step 1: Ensure we have a PDF blob
        let blobToUpload = cert.pdfBlob;
        if (!blobToUpload) {
          blobToUpload = await generatePDF(cert.name, cert.code, cert.accessKey) || undefined;
          if (!blobToUpload) { errorCount++; lastError = "No se pudo generar el PDF"; continue; }
        }

        // Step 2: Upload PDF directly to Supabase Storage (bypasses Vercel 4.5MB limit)
        const filePath = `pdfs/${selectedProject}/${cert.accessKey}.pdf`;
        const { error: storageError } = await supabaseClient.storage
          .from("certificados")
          .upload(filePath, blobToUpload, { contentType: "application/pdf", upsert: true });

        if (storageError) {
          lastError = `Storage: ${storageError.message}`;
          console.error(`Error subiendo PDF ${i + 1}:`, storageError);
          errorCount++;
          continue;
        }

        // Step 3: Get the public URL
        const { data: urlData } = supabaseClient.storage
          .from("certificados")
          .getPublicUrl(filePath);

        // Step 4: Save metadata via API (lightweight JSON, no file)
        const res = await fetch("/api/admin/certificates/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProject,
            courseTitle,
            duration,
            issueDate,
            normas: normasText,
            participantName: cert.name,
            participantCode: cert.code,
            accessKey: cert.accessKey,
            pdfUrl: urlData.publicUrl,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          lastError = data.error || `HTTP ${res.status}`;
          console.error(`Error guardando metadata ${i + 1}/${results.length}:`, data);
          errorCount++;
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Error de conexión";
        console.error(`Error cert ${i + 1}:`, e);
        errorCount++;
      }
    }

    setSavingToProject(false);
    if (errorCount > 0) {
      alert(`Se guardaron con ${errorCount} errores.\nÚltimo error: ${lastError}`);
    } else {
      setIsSavedToProject(true);
      alert(`✅ ${results.length} certificados guardados exitosamente en el proyecto.`);
    }
  };

  /* ── Download single PDF ────────────────────────────────── */
  const downloadSingle = async (cert: CertResult) => {
    const { saveAs } = await import("file-saver");
    const blob = await generatePDF(cert.name, cert.code, cert.accessKey);
    if (blob) saveAs(blob, `${cert.name} - ${cert.code}.pdf`);
  };

  /* ── Preview single PDF ─────────────────────────────────── */
  const previewSingle = async (cert: CertResult) => {
    const blob = await generatePDF(cert.name, cert.code, cert.accessKey);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  };

  /* ── Download all as ZIP ────────────────────────────────── */
  const downloadZip = async () => {
    setIsZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();

      const formattedDate = issueDate
        ? issueDate.replace(/[/\\:*?"<>|]/g, "-").trim()
        : "sin-fecha";

      const folderName = `Certificados ${formattedDate}`;
      const folder = zip.folder(folderName) ?? zip;

      for (const c of results) {
        const blob = await generatePDF(c.name, c.code, c.accessKey);
        if (blob) folder.file(`${c.name} - ${c.code}.pdf`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
    } finally {
      setIsZipping(false);
    }
  };

  /* ── Signature management ───────────────────────────────── */
  const processSignatureImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("No canvas context");

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Si es blanco o casi blanco, hacerlo transparente
            if (r > 180 && g > 180 && b > 180) {
              data[i + 3] = 0;
            } else {
              // Convertir el resto (la firma) a negro sólido y completamente opaco
              data[i] = 0;     // R
              data[i + 1] = 0; // G
              data[i + 2] = 0; // B
              data[i + 3] = 255; // Alpha
            }
          }

          ctx.putImageData(imageData, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl.split(",")[1]);
        };
        img.onerror = () => reject("Error al cargar imagen en canvas");
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject("Error al leer archivo");
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSig = async () => {
    if (!newSigName || !newSigFile) {
      alert("Ingresa el nombre y selecciona la imagen de la firma.");
      return;
    }
    setUploadingSig(true);
    try {
      const b64 = await processSignatureImage(newSigFile);
      const res = await fetch("/api/admin/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSigName,
          cargo: newSigCargo || (newSigGerente ? "Gerente General" : "Consultor"),
          base64Image: b64,
          isGerente: newSigGerente,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error al guardar firma: ${data.error || "Error desconocido"}`);
      } else {
        setNewSigName("");
        setNewSigCargo("");
        setNewSigFile(null);
        setNewSigGerente(false);
        await loadData();
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al guardar la firma.");
    }
    setUploadingSig(false);
  };

  const handleDeleteSig = async (id: string) => {
    if (!confirm("¿Eliminar esta firma?")) return;
    try {
      const res = await fetch(`/api/admin/signatures?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(`Error al eliminar: ${data.error || "Error desconocido"}`);
      }
    } catch {
      alert("Error de conexión al eliminar firma.");
    }
    await loadData();
  };

  const handleToggleGerente = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/signatures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isGerente: !current }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch {
      alert("Error de conexión.");
    }
    await loadData();
  };

  /* ── JSX ────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-primary" /> Generador de Certificados
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Generación masiva de certificados verificables por QR
          </p>
        </div>
        <button
          onClick={() => setShowSigsModal(true)}
          className="btn-secondary py-2 px-4 text-sm shadow-sm"
        >
          Gestión de Firmas
        </button>
      </div>

      {/* Main form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: certificate data */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">1. Datos del Certificado</h2>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1">Proyecto Vinculado</label>
            <select className="input-field" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              <option value="">Selecciona el Proyecto</option>
              {projects.map(p => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.name}{p.client ? ` — ${p.client.companyName}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1">Título del Certificado</label>
            <input type="text" className="input-field" placeholder="Ej: Certificado de Formación de Auditor"
              value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1">Descripción del Programa</label>
            <input type="text" className="input-field" placeholder="Ej: Auditor interno en Sistema de Gestión Integrados"
              value={programDescription} onChange={e => setProgramDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Duración</label>
              <input type="text" className="input-field" placeholder="Ej: 16 horas"
                value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Fecha(s) de capacitación</label>
              <input type="text" className="input-field" placeholder="Ej: 23, 25, 26 de Febrero / 04, 05 y 11 de Marzo del 2026"
                value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1">Normas (una por línea, máx. 6)</label>
            <textarea className="input-field resize-none text-sm" rows={5} value={normasText}
              onChange={e => setNormasText(e.target.value)}
              placeholder={"ISO 9001:2015 – Gestión de la Calidad\nISO 14001:2015 – Gestión Ambiental"} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="text-xs font-bold text-primary mb-1">Firma Izquierda (Gerente)</p>
              {signatures.filter(s => s.is_gerente).length > 0 ? (
                <select className="input-field bg-white text-sm" value={gerenteSigId}
                  onChange={e => setGerenteSigId(e.target.value)}>
                  {signatures.filter(s => s.is_gerente).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-danger font-medium border border-danger/20 p-2 rounded bg-white">
                  No hay firma de gerente. Agrégala en Gestión de Firmas.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-primary mb-1">Firma Derecha (Consultor)</p>
              {signatures.filter(s => !s.is_gerente).length > 0 ? (
                <select className="input-field bg-white text-sm" value={consultorSigId}
                  onChange={e => setConsultorSigId(e.target.value)}>
                  {signatures.filter(s => !s.is_gerente).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-danger font-medium border border-danger/20 p-2 rounded bg-white">
                  No hay firma de consultor. Agrégala en Gestión de Firmas.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: participants */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">2. Nómina de Participantes</h2>

          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-surface/50 transition-colors">
            <Upload className="mx-auto mb-2 opacity-50 text-text-muted" size={32} />
            <p className="font-semibold text-sm mb-1">Importar archivo Excel (.xlsx / .csv)</p>
            <p className="text-xs text-text-muted mb-4">
              Columnas requeridas: <strong>Apellido Paterno</strong>, <strong>Apellido Materno</strong>, <strong>Nombres</strong>, <strong>Códigos</strong>
              <br /><span className="text-text-muted/70">Si el Excel tiene múltiples hojas, se usará la hoja &quot;Certificados&quot;.</span>
            </p>
            <input type="file" accept=".xlsx,.csv" onChange={handleFileUpload}
              className="block w-full text-sm text-text-muted text-center
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                file:text-sm file:font-semibold file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20 cursor-pointer" />
          </div>

          {excelData.length > 0 && (
            <div className="bg-success/5 border border-success/20 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-success text-white rounded-full"><CheckCircle2 size={16} /></div>
              <div>
                <p className="font-bold text-sm text-success">{excelData.length} participantes detectados</p>
                <p className="text-xs text-text-muted">Revisa los datos y presiona Generar.</p>
              </div>
            </div>
          )}

          {excelData.length > 0 && (
            <div className="overflow-auto max-h-40 rounded-lg border border-border">
              <table className="min-w-full text-xs">
                <thead className="bg-surface sticky top-0">
                  <tr>
                    {Object.keys(excelData[0]).map(k => (
                      <th key={k} className="px-3 py-2 text-left font-bold text-text-muted">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                  {excelData.length > 5 && (
                    <tr className="border-t border-border">
                      <td colSpan={Object.keys(excelData[0]).length} className="px-3 py-2 text-text-muted italic">
                        … y {excelData.length - 5} más
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating || excelData.length === 0}
            className="w-full btn-primary py-3 font-bold text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
            {generating ? (
              <><Loader2 className="animate-spin" size={18} /> Procesando {progress}%</>
            ) : (
              <><Printer size={18} /> Iniciar Generación Masiva</>
            )}
          </button>
        </div>
      </div>

      {/* ── SIGNATURES MODAL ───────────────────────────────── */}
      {showSigsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-in">
            <div className="border-b border-border p-4 flex justify-between items-center bg-surface/30">
              <h2 className="font-bold">Gestión de Firmas</h2>
              <button onClick={() => setShowSigsModal(false)}
                className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-surface/20 border-b border-border space-y-3">
              <p className="text-xs font-bold text-text-muted">Agregar Nueva Firma</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nombre completo" className="input-field text-sm"
                  value={newSigName} onChange={e => setNewSigName(e.target.value)} />
                <input type="text" placeholder="Cargo (Ej: Gerente General)" className="input-field text-sm"
                  value={newSigCargo} onChange={e => setNewSigCargo(e.target.value)} />
              </div>
              <input type="file" accept="image/png,image/jpeg"
                className="text-xs w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                  file:text-xs file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20"
                onChange={e => setNewSigFile(e.target.files?.[0] || null)} />
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input type="checkbox" checked={newSigGerente} onChange={e => setNewSigGerente(e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span>Marcar como <strong>Firma de Gerente General</strong> (aparece en el lado izquierdo)</span>
              </label>
              <button onClick={handleUploadSig} disabled={!newSigName || !newSigFile || uploadingSig}
                className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2 disabled:opacity-50">
                {uploadingSig ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Agregar Firma
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto">
              <p className="text-xs font-bold text-text-muted mb-3">Firmas Guardadas</p>
              {signatures.length === 0 ? (
                <p className="text-sm text-text-muted italic">No hay firmas guardadas aún.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {signatures.map(s => (
                    <div key={s.id}
                      className={`border rounded-xl p-3 flex flex-col items-center relative group bg-white
                        ${s.is_gerente ? "border-primary/40" : "border-border"}`}>
                      {s.is_gerente && (
                        <span className="absolute top-2 left-2 flex items-center gap-0.5 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          <Star size={8} fill="currentColor" /> Gerente
                        </span>
                      )}
                      <div className="h-12 flex items-center justify-center mt-2 mb-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.signature_url} alt={s.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="text-xs font-bold text-center truncate w-full">{s.name}</p>
                      <p className="text-[10px] text-text-muted text-center">{s.cargo}</p>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleToggleGerente(s.id, s.is_gerente)}
                          title={s.is_gerente ? "Quitar rol de gerente" : "Marcar como gerente"}
                          className="text-primary bg-primary/10 p-1 rounded text-[10px]">
                          <Star size={12} fill={s.is_gerente ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => handleDeleteSig(s.id)} className="text-danger bg-danger/10 p-1 rounded">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT MODAL ───────────────────────────────────── */}
      {showResultModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

            {/* Header */}
            <div className="border-b border-border p-4 flex justify-between items-center bg-surface/50">
              <div>
                <h2 className="font-bold flex items-center gap-2 text-lg">
                  <CheckCircle2 className="text-success" /> Emisión Completada
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  {results.length} certificados emitidos correctamente
                </p>
              </div>
              <button onClick={() => setShowResultModal(false)}
                className="text-text-muted hover:text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Download all button */}
            <div className="px-6 pt-4 pb-2 flex gap-3 justify-start items-center">
              <button 
                onClick={downloadZip}
                disabled={isZipping}
                className="btn-secondary py-2.5 px-5 text-sm font-bold flex items-center gap-2 shadow-sm bg-white hover:bg-surface transition-all disabled:opacity-75 disabled:cursor-wait">
                {isZipping ? <Loader2 size={18} className="text-primary animate-spin" /> : <FileDown size={18} className="text-primary" />}
                {isZipping ? "Empaquetando..." : "Descargar ZIP"}
              </button>
              
              {isSavedToProject ? (
                <button className="bg-success/10 text-success border border-success/20 font-bold py-2.5 px-5 text-sm rounded-lg flex items-center gap-2 cursor-default shrink-0">
                  <CheckCircle2 size={18} /> ✅ Certificados Vinculados
                </button>
              ) : (
                <button 
                  onClick={handleSaveToProject} 
                  disabled={savingToProject}
                  className="btn-primary py-2.5 px-6 font-bold flex items-center gap-2 shadow-md shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {savingToProject ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  {savingToProject ? "Guardando en Base de Datos..." : "Guardar en el Proyecto"}
                </button>
              )}
            </div>

            {/* File list */}
            <div className="px-6 pb-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {results.map((c, idx) => (
                  <div key={idx}
                    className="border border-border bg-white rounded-lg px-4 py-3 flex items-center gap-4 hover:bg-surface/30 transition-colors">
                    {/* PDF icon */}
                    <div className="w-10 h-10 bg-danger/10 text-danger rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award size={20} />
                    </div>
                    {/* Name + code */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" title={`${c.name} - ${c.code}`}>
                        {c.name} — <span className="font-mono text-text-muted">{c.code}</span>
                      </p>
                      <p className="text-[11px] text-text-muted">{courseTitle}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => previewSingle(c)}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Previsualizar PDF">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => downloadSingle(c)}
                        className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                        title="Descargar PDF">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF PREVIEW MODAL ──────────────────────────────── */}
      {previewUrl && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-in">
            <div className="border-b border-border p-3 flex justify-between items-center">
              <h3 className="font-bold text-sm">Vista Previa del Certificado</h3>
              <button onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-2">
              <iframe src={previewUrl} className="w-full h-full min-h-[75vh] rounded-lg border border-border" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
