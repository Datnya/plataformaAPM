"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, CheckCircle2, Loader2, Award, Printer,
  Trash2, Plus, X, Download, FileDown, Star, Eye,
} from "lucide-react";
import * as XLSX from "xlsx";

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
      const ws = wb.Sheets[wb.SheetNames[0]];
      setExcelData(XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]);
    };
    reader.readAsBinaryString(file);
  };

  /* ── PDF generation (compressed) ────────────────────────── */
  const generatePDF = useCallback(async (
    participantName: string,
    participantCode: string,
    accessKey: string,
  ): Promise<Blob | null> => {
    const { default: jsPDF } = await import("jspdf");
    const QRCode = await import("qrcode");

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    /* color helpers */
    const rgb = (hex: string): [number, number, number] => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const setTxt = (hex: string) => doc.setTextColor(...rgb(hex));
    const setDrw = (hex: string) => doc.setDrawColor(...rgb(hex));

    /* ── Background (compressed via canvas, cached) ── */
    if (!bgCacheRef.current) {
      bgCacheRef.current = await loadAndCompressImage("/cert-bg.jpg", 1400, 0.65);
    }
    if (bgCacheRef.current) {
      doc.addImage(bgCacheRef.current, "JPEG", 0, 0, 297, 210);
    }

    /* ── TITLE ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setTxt("#1e293b");
    doc.text(courseTitle.toUpperCase(), CX_FULL, 47, { align: "center" });

    /* green decorative line */
    setDrw("#86a33b");
    doc.setLineWidth(0.4);
    doc.line(50, 52, 247, 52);

    /* ── "Se otorga a:" ── */
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    setTxt("#6b7280");
    doc.text("Se otorga a:", CX_BODY, 62, { align: "center" });

    /* ── Participant name ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    setTxt("#111827");
    doc.text(participantName.toUpperCase(), CX_BODY, 73, {
      align: "center",
      maxWidth: 185,
    });

    /* ── "Por haber completado..." ── */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setTxt("#4b5563");
    doc.text(
      "Por haber completado satisfactoriamente el programa de:",
      CX_BODY, 84, { align: "center" }
    );

    /* ── Course title (program name) ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTxt("#1e293b");
    doc.text(courseTitle, CX_BODY, 93, { align: "center", maxWidth: 185 });

    /* ── "Basado en las normas:" ── */
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    setTxt("#6b7280");
    doc.text("Basado en las normas:", CX_BODY, 103, { align: "center" });

    /* ── Norma lines ── */
    const normaLines = normasText.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 6);
    const normaLH = normaLines.length > 4 ? 6.5 : 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setTxt("#374151");
    normaLines.forEach((line, i) => {
      doc.text(line, CX_BODY, 111 + i * normaLH, { align: "center" });
    });

    /* ── Dynamic Y after normas ── */
    const afterNormasY = 111 + Math.max(normaLines.length - 1, 0) * normaLH;
    const sep1Y = Math.max(afterNormasY + 9, 148);
    const dataLabelY = sep1Y + 5;
    const dataValY = dataLabelY + 6;
    const sep2Y = dataValY + 7;
    const sigTopY = sep2Y + 3;

    /* ── Separator 1 ── */
    setDrw("#d1d5db");
    doc.setLineWidth(0.2);
    doc.line(70, sep1Y, 272, sep1Y);

    /* ── Data row: DURACIÓN | FECHA | CÓDIGO ── */
    const formattedDate = issueDate
      ? new Date(issueDate).toLocaleDateString("es-PE", {
        day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
      })
      : "";

    const dataCols = [
      { label: "DURACIÓN", value: duration, cx: 97 },
      { label: "FECHA DE EMISIÓN", value: formattedDate, cx: 180 },
      { label: "CÓDIGO", value: participantCode, cx: 258 },
    ];

    dataCols.forEach(({ label, value, cx }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      setTxt("#9ca3af");
      doc.text(label, cx, dataLabelY, { align: "center" });
      doc.setFontSize(8.5);
      setTxt("#1e293b");
      doc.text(value, cx, dataValY, { align: "center" });
    });

    /* column dividers */
    setDrw("#e5e7eb");
    doc.setLineWidth(0.2);
    doc.line(138, sep1Y + 2, 138, dataValY + 2);
    doc.line(219, sep1Y + 2, 219, dataValY + 2);

    /* ── Separator 2 ── */
    setDrw("#d1d5db");
    doc.line(70, sep2Y, 272, sep2Y);

    /* ── Signature section ── */
    const SIG_W = 44;
    const SIG_H = 20;
    const LEFT_CX = 84;
    const RIGHT_CX = 224;
    const QR_CX = 154;
    const QR_SIZE = 18;

    const gerenteSig = signatures.find(s => s.id === gerenteSigId);
    const consultorSig = signatures.find(s => s.id === consultorSigId);

    if (gerenteSig?.signature_url) {
      const b64 = await fetchAsDataUrl(gerenteSig.signature_url);
      if (b64) doc.addImage(b64, "PNG", LEFT_CX - SIG_W / 2, sigTopY, SIG_W, SIG_H);
    }

    if (consultorSig?.signature_url) {
      const b64 = await fetchAsDataUrl(consultorSig.signature_url);
      if (b64) doc.addImage(b64, "PNG", RIGHT_CX - SIG_W / 2, sigTopY, SIG_W, SIG_H);
    }

    /* QR code */
    const qrUrl = `${window.location.origin}/certificados/validar/${accessKey}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 128 });
    doc.addImage(qrDataUrl, "PNG", QR_CX - QR_SIZE / 2, sigTopY + 1, QR_SIZE, QR_SIZE);

    /* signature lines */
    const sigLineY = sigTopY + SIG_H + 2;
    setDrw("#6b7280");
    doc.setLineWidth(0.3);
    doc.line(LEFT_CX - 22, sigLineY, LEFT_CX + 22, sigLineY);
    doc.line(RIGHT_CX - 22, sigLineY, RIGHT_CX + 22, sigLineY);

    /* names */
    const sigNameY = sigLineY + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setTxt("#1e293b");
    if (gerenteSig) doc.text(gerenteSig.name, LEFT_CX, sigNameY, { align: "center" });
    if (consultorSig) doc.text(consultorSig.name, RIGHT_CX, sigNameY, { align: "center" });

    /* cargos */
    const sigCargoY = sigNameY + 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTxt("#6b7280");
    if (gerenteSig) doc.text(gerenteSig.cargo || "Gerente General", LEFT_CX, sigCargoY, { align: "center" });
    if (consultorSig) doc.text(consultorSig.cargo || "Consultor", RIGHT_CX, sigCargoY, { align: "center" });

    /* "Verificar" under QR */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    setTxt("#9ca3af");
    doc.text("Verificar certificado", QR_CX, sigTopY + QR_SIZE + 4, { align: "center" });

    return doc.output("blob");
  }, [courseTitle, duration, issueDate, normasText, signatures, gerenteSigId, consultorSigId]);

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

      const firstName = String(
        row["Nombres"] ?? row["Nombre"] ?? row["NOMBRES"] ?? row["NOMBRE"] ?? ""
      ).trim();
      const lastName = String(
        row["Apellidos"] ?? row["Apellido"] ?? row["APELLIDOS"] ?? row["APELLIDO"] ?? ""
      ).trim();
      const code = String(
        row["Código"] ?? row["Codigo"] ?? row["CÓDIGO"] ?? row["CODIGO"] ?? row["código"] ?? ""
      ).trim();

      const fullName = lastName ? `${lastName}, ${firstName}` : firstName;
      if (!fullName) continue;

      const accessKey = crypto.randomUUID();
      const pdfBlob = await generatePDF(fullName, code, accessKey);
      if (!pdfBlob) { errorCount++; continue; }

      try {
        const formData = new FormData();
        formData.append("projectId", selectedProject);
        formData.append("courseTitle", courseTitle);
        formData.append("duration", duration);
        formData.append("issueDate", issueDate);
        formData.append("normas", normasText);
        formData.append("participantName", fullName);
        formData.append("participantCode", code);
        formData.append("accessKey", accessKey);
        formData.append("pdf", pdfBlob, `${fullName}.pdf`);

        const res = await fetch("/api/admin/certificates/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          generated.push({ name: fullName, code, accessKey });
        } else {
          const errData = await res.json().catch(() => ({ error: "Error desconocido" }));
          console.error(`Error certificado ${fullName}:`, errData.error);
          errorCount++;
        }
      } catch (e) {
        console.error(`Error de red certificado ${fullName}:`, e);
        errorCount++;
      }

      setProgress(Math.round(((i + 1) / excelData.length) * 100));
    }

    setGenerating(false);
    setResults(generated);
    setShowResultModal(true);

    if (errorCount > 0) {
      alert(`${generated.length} certificados generados correctamente. ${errorCount} con errores.`);
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
    const JSZip = (await import("jszip")).default;
    const { saveAs } = await import("file-saver");
    const zip = new JSZip();

    const formattedDate = issueDate
      ? new Date(issueDate).toLocaleDateString("es-PE", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
      }).replace(/\//g, "-")
      : "sin-fecha";

    const folderName = `Certificados ${formattedDate}`;
    const folder = zip.folder(folderName) ?? zip;

    for (const c of results) {
      const blob = await generatePDF(c.name, c.code, c.accessKey);
      if (blob) folder.file(`${c.name} - ${c.code}.pdf`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folderName}.zip`);
  };

  /* ── Signature management ───────────────────────────────── */
  const handleUploadSig = async () => {
    if (!newSigName || !newSigFile) {
      alert("Ingresa el nombre y selecciona la imagen de la firma.");
      return;
    }
    setUploadingSig(true);
    try {
      const b64 = await blobToBase64(newSigFile);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Duración</label>
              <input type="text" className="input-field" placeholder="Ej: 16 horas"
                value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Fecha de Emisión</label>
              <input type="date" className="input-field" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
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
              Columnas requeridas: <strong>Nombres</strong>, <strong>Apellidos</strong>, <strong>Código</strong>
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
            <div className="px-6 pt-4 pb-2 flex justify-start">
              <button onClick={downloadZip}
                className="btn-primary py-2.5 px-5 text-sm font-bold flex items-center gap-2">
                <FileDown size={18} /> Descargar Todos los Certificados
              </button>
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
