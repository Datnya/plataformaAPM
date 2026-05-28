"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Filter,
  X,
  Eye,
  ChevronDown,
  LayoutGrid,
  Video,
  Wrench,
  CalendarClock,
  FileDown,
  Link2,
  ExternalLink
} from "lucide-react";

/* ─── Brand SVG icons (removed from lucide-react ≥ 0.394) ─────────────────── */
const IconInstagram = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const IconFacebook = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconLinkedin = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const IconYoutube = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const IconTwitter = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface SocialPost {
  id: string;
  month: string;
  publishDate: string;
  platform: string;
  contentPillar: string;
  topic: string;
  description: string;
  postType: string;
  status: string;
  objectiveKpi: string;
  calendarBrand: string;
  canvaLink?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields kept for backwards compat
  title?: string;
  networks?: string;
  contentType?: string;
  format?: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PLATFORMS = [
  { value: "Instagram", icon: <IconInstagram size={14} />, color: "#E1306C" },
  { value: "Facebook", icon: <IconFacebook size={14} />, color: "#1877F2" },
  { value: "LinkedIn", icon: <IconLinkedin size={14} />, color: "#0A66C2" },
  { value: "TikTok", icon: <Video size={14} />, color: "#000000" },
  { value: "YouTube", icon: <IconYoutube size={14} />, color: "#FF0000" },
  { value: "X (Twitter)", icon: <IconTwitter size={14} />, color: "#1DA1F2" },
];


const CONTENT_PILLARS = [
  "Educación",
  "Liderazgo",
  "Entretenimiento",
  "Promoción",
  "Detrás de Escena",
  "Inspiración",
  "Testimonios",
  "Noticias",
];

const POST_TYPES = [
  "Reel",
  "Story",
  "Carrusel",
  "Estático",
  "Artículo",
  "Video",
  "Live",
  "Infografía",
];

const STATUSES = [
  { value: "EN DESARROLLO", color: "#6b7280", bgColor: "#f3f4f6", borderColor: "#d1d5db", icon: <Wrench size={12} /> },
  { value: "EN REVISIÓN", color: "#f59e0b", bgColor: "#fef3c7", borderColor: "#fcd34d", icon: <Eye size={12} /> },
  { value: "PROGRAMADO", color: "#3b82f6", bgColor: "#dbeafe", borderColor: "#93c5fd", icon: <CalendarClock size={12} /> },
  { value: "SUBIDO", color: "#22c55e", bgColor: "#dcfce7", borderColor: "#86efac", icon: <CheckCircle size={12} /> },
];

const KPI_OPTIONS = [
  "Alcance",
  "Engagement",
  "Conversiones",
  "Tráfico Web",
  "Generación de Leads",
  "Reconocimiento de Marca",
  "Retención",
];

const BRANDS = [
  { key: "APM", label: "Calendario APM" },
  { key: "LOGRA", label: "Calendario Logra" },
];

/* ─── Helper ────────────────────────────────────────────────────────────────── */
function getPlatformData(platform: string) {
  return PLATFORMS.find((p) => p.value === platform) || { value: platform, icon: "🌐", color: "#6b7280" };
}

function getStatusData(status: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AdminSocialContent() {
  const [contents, setContents] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Active calendar brand
  const [activeBrand, setActiveBrand] = useState<string>("APM");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formMonth, setFormMonth] = useState(MONTHS[new Date().getMonth()]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPlatforms, setFormPlatforms] = useState<string[]>(["Instagram"]);
  const [formPillar, setFormPillar] = useState("Educación");
  const [formTopic, setFormTopic] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPostType, setFormPostType] = useState("Reel");
  const [formStatus, setFormStatus] = useState("EN DESARROLLO");
  const [formKpi, setFormKpi] = useState("Alcance");
  const [formCanvaLink, setFormCanvaLink] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);

  // Filters
  const [filterMonth, setFilterMonth] = useState("Todos");
  const [filterPlatform, setFilterPlatform] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  /* ─── Fetch ────────────────────────────────────────────────────────────────── */
  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/social-content");
      const data = await res.json();
      setContents(Array.isArray(data) ? data : []);
    } catch {
      setContents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  /* ─── Filtered Data ────────────────────────────────────────────────────────── */
  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      // Brand filter
      if ((item.calendarBrand || "APM") !== activeBrand) return false;
      // Month filter
      if (filterMonth !== "Todos" && item.month !== filterMonth) return false;
      // Platform filter
      if (filterPlatform !== "Todas") {
        const itemPlats = (item.platform || "").split(",").map(p => p.trim());
        if (!itemPlats.includes(filterPlatform)) return false;
      }
      // Status filter
      if (filterStatus !== "Todos" && item.status !== filterStatus) return false;
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (item.topic || "").toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q) ||
          (item.contentPillar || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contents, activeBrand, filterMonth, filterPlatform, filterStatus, searchQuery]);

  /* ─── Form handlers ────────────────────────────────────────────────────────── */
  const resetForm = () => {
    setEditId(null);
    setFormMonth(MONTHS[new Date().getMonth()]);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormPlatforms(["Instagram"]);
    setFormPillar("Educación");
    setFormTopic("");
    setFormDescription("");
    setFormPostType("Reel");
    setFormStatus("EN DESARROLLO");
    setFormKpi("Alcance");
    setFormCanvaLink("");
  };

  const openForm = (item?: SocialPost) => {
    if (item) {
      setEditId(item.id);
      setFormMonth(item.month || MONTHS[new Date().getMonth()]);
      setFormDate(
        item.publishDate
          ? new Date(item.publishDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      const plats = item.platform ? item.platform.split(",").map(p => p.trim()).filter(Boolean) : ["Instagram"];
      setFormPlatforms(plats.length > 0 ? plats : ["Instagram"]);
      setFormPillar(item.contentPillar || "Educación");
      setFormTopic(item.topic || "");
      setFormDescription(item.description || "");
      setFormPostType(item.postType || "Reel");
      setFormStatus(item.status || "EN DESARROLLO");
      setFormKpi(item.objectiveKpi || "Alcance");
      setFormCanvaLink(item.canvaLink || "");
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) {
      alert("Ingresa un tema / concepto.");
      return;
    }
    if (formPlatforms.length === 0) {
      alert("Selecciona al menos una plataforma.");
      return;
    }
    setSaving(true);

    try {
      const url = editId ? `/api/social-content/${editId}` : "/api/social-content";
      const method = editId ? "PUT" : "POST";

      const payload = {
        month: formMonth,
        publishDate: formDate,
        platform: formPlatforms.join(", "),
        contentPillar: formPillar,
        topic: formTopic,
        description: formDescription,
        postType: formPostType,
        status: formStatus,
        objectiveKpi: formKpi,
        calendarBrand: activeBrand,
        canvaLink: formCanvaLink,
        // Legacy compat
        title: formTopic,
        networks: formPlatforms,
        contentType: formPillar,
        format: formPostType,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Error al guardar.");
      }

      setShowModal(false);
      resetForm();
      fetchContent();
    } catch (e: any) {
      alert("Error: " + e.message);
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/social-content/${id}`, { method: "DELETE" });
      setDeleteId(null);
      fetchContent();
    } catch (e) {
      console.error(e);
    }
  };

  /* ─── PDF Generation ──────────────────────────────────────────────────────── */
  const generatePdf = () => {
    const sortedByDate = [...filteredContents].sort(
      (a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
    );
    const firstDate = sortedByDate[0]?.publishDate
      ? new Date(sortedByDate[0].publishDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      : "—";
    const lastDate = sortedByDate[sortedByDate.length - 1]?.publishDate
      ? new Date(sortedByDate[sortedByDate.length - 1].publishDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      : "—";
    const title = `Semana desde el ${firstDate} hasta el ${lastDate}`;

    const BRAND_GREEN = "#b4c307";
    const BRAND_DARK = "#1a1a1a";
    const BRAND_GRAY = "#64748b";
    const cols = ["Nro", "Mes", "Fecha", "Plataforma", "Pilar", "Tema / Concepto", "Detalles", "Tipo", "Estado", "KPI"];
    // Proportional weights - will be scaled to fill available width
    const colWeights = [22, 38, 48, 60, 55, 95, 130, 40, 58, 55];
    // A4 Landscape at 2x resolution for crisp text
    const SCALE = 2;
    const pageW = 842 * SCALE; const pageH = 595 * SCALE;
    const margin = Math.round(17 * SCALE); // ~1.5cm
    const availW = pageW - margin * 2;
    const totalWeight = colWeights.reduce((a, b) => a + b, 0);
    const colWidths = colWeights.map(w => (w / totalWeight) * availW);
    const fontSize = 8 * SCALE;
    const headerFontSize = 7 * SCALE;
    const titleFontSize = 30 * SCALE;
    const subTitleFontSize = 20 * SCALE;
    const lineH = fontSize * 1.35;
    const cellPadX = 4 * SCALE;
    const cellPadY = 3 * SCALE;
    const headerH = Math.round(20 * SCALE);
    const minRowH = Math.round(18 * SCALE);

    // Helper: wrap text into lines that fit within maxWidth
    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
      if (!text) return [""];
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines.length ? lines : [""];
    };

    // Pre-calculate row heights
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 1; tmpCanvas.height = 1;
    const tmpCtx = tmpCanvas.getContext("2d")!;
    tmpCtx.font = `${fontSize}px sans-serif`;

    const rowsData = sortedByDate.map((item, idx) => {
      const cells = [
        String(idx + 1),
        item.month || "",
        item.publishDate ? new Date(item.publishDate).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", timeZone: "UTC" }) : "",
        (item.platform || "").replace(/, /g, " / "),
        item.contentPillar || "",
        item.topic || item.title || "",
        item.description || "",
        item.postType || "",
        item.status || "",
        item.objectiveKpi || "",
      ];
      const wrappedCells = cells.map((cell, i) => wrapText(tmpCtx, cell, colWidths[i] - cellPadX * 2));
      const maxLines = Math.max(...wrappedCells.map(lines => lines.length));
      const rowH = Math.max(minRowH, maxLines * lineH + cellPadY * 2);
      return { cells, wrappedCells, rowH };
    });

    // Calculate total height needed
    const titleAreaH = Math.round(100 * SCALE);
    const stripeH = Math.round(3 * SCALE);
    const totalRowsH = rowsData.reduce((sum, r) => sum + r.rowH, 0);
    const neededH = margin + stripeH + titleAreaH + headerH + totalRowsH + stripeH + margin;
    const canvasH = Math.max(pageH, neededH);

    const canvas = document.createElement("canvas");
    canvas.width = pageW; canvas.height = canvasH;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageW, canvasH);

    // Top stripe
    ctx.fillStyle = BRAND_GREEN;
    ctx.fillRect(0, 0, pageW, stripeH);

    // Title
    let y = stripeH + Math.round(16 * SCALE);
    ctx.fillStyle = BRAND_DARK;
    ctx.font = `bold ${titleFontSize}px sans-serif`;
    ctx.fillText(`CALENDARIO DE CONTENIDOS · ${activeBrand === "APM" ? "APM Group" : "Logra"}`, margin, y + titleFontSize);
    y += titleFontSize + Math.round(10 * SCALE);
    ctx.fillStyle = BRAND_GRAY;
    ctx.font = `${subTitleFontSize}px sans-serif`;
    ctx.fillText(title, margin, y + subTitleFontSize);
    y += subTitleFontSize + Math.round(20 * SCALE);

    // Table header row
    ctx.fillStyle = BRAND_GREEN;
    ctx.fillRect(margin, y, availW, headerH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${headerFontSize}px sans-serif`;
    let x = margin;
    cols.forEach((col, i) => {
      const textW = ctx.measureText(col.toUpperCase()).width;
      const cellCenterX = x + (colWidths[i] - textW) / 2;
      const cellCenterY = y + (headerH + headerFontSize * 0.7) / 2;
      ctx.fillText(col.toUpperCase(), cellCenterX, cellCenterY);
      x += colWidths[i];
    });
    y += headerH;

    // Draw rows
    ctx.font = `${fontSize}px sans-serif`;
    rowsData.forEach((row, idx) => {
      x = margin;
      // Row background
      ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      ctx.fillRect(x, y, availW, row.rowH);
      // Horizontal border
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1 * SCALE;
      ctx.beginPath(); ctx.moveTo(x, y + row.rowH); ctx.lineTo(margin + availW, y + row.rowH); ctx.stroke();

      // Draw cells
      ctx.fillStyle = BRAND_DARK;
      ctx.font = `${fontSize}px sans-serif`;
      row.wrappedCells.forEach((lines, i) => {
        const textBlockH = lines.length * lineH;
        const startY = y + (row.rowH - textBlockH) / 2 + lineH * 0.75;
        lines.forEach((line, li) => {
          ctx.fillText(line, x + cellPadX, startY + li * lineH);
        });
        x += colWidths[i];
      });
      y += row.rowH;
    });

    // Bottom stripe
    ctx.fillStyle = BRAND_GREEN;
    ctx.fillRect(0, canvasH - stripeH, pageW, stripeH);

    const dataUrl = canvas.toDataURL("image/png");
    return { dataUrl, title, canvasW: pageW, canvasH: canvasH, scale: SCALE };
  };

  /* ─── Render ───────────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="animate-fade-in relative" style={{ minHeight: "calc(100vh - 120px)" }}>
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: "var(--foreground)" }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
              >
                <LayoutGrid size={20} className="text-white" />
              </div>
              PANEL DE CONTROL - CALENDARIO DE CONTENIDOS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdfPreview(true)}
              className="flex items-center gap-2 shadow-sm whitespace-nowrap"
              style={{
                background: "white",
                border: "1.5px solid var(--border)",
                color: "var(--text-muted)",
                padding: "0.65rem 1.2rem",
                fontSize: "0.875rem",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <FileDown size={16} />
              Descargar contenido semanal
            </button>
            <button
              onClick={() => openForm()}
              className="btn-primary flex items-center gap-2 shadow-md whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                padding: "0.7rem 1.5rem",
                fontSize: "0.875rem",
                borderRadius: "10px",
                letterSpacing: "0.02em",
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Nueva Publicación
            </button>
          </div>
        </div>

        {/* ── Brand Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-5" style={{ borderBottom: "2px solid var(--border)" }}>
          {BRANDS.map((brand) => (
            <button
              key={brand.key}
              onClick={() => setActiveBrand(brand.key)}
              className="relative px-5 py-3 text-sm font-bold transition-colors"
              style={{
                color: activeBrand === brand.key ? "var(--primary-hover)" : "var(--text-muted)",
                borderBottom: activeBrand === brand.key ? "3px solid var(--primary)" : "3px solid transparent",
                marginBottom: "-2px",
                background: "transparent",
                cursor: "pointer",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
              }}
            >
              {brand.label}
            </button>
          ))}
        </div>

        {/* ── Main Layout: Table + Sidebar ────────────────────────────────────── */}
        <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
          {/* ── Table Panel ────────────────────────────────────────────────────── */}
          <div
            className="flex-1 min-w-0"
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="overflow-x-auto w-full" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <table className="w-full text-sm text-left align-middle border-collapse" style={{ minWidth: "1300px" }}>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(135deg, rgba(180,195,7,0.08), rgba(180,195,7,0.03))",
                      borderBottom: "2px solid var(--primary)",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    {[
                      { label: "Nro", width: "50px" },
                      { label: "Mes", width: "90px" },
                      { label: "Fecha", width: "110px" },
                      { label: "Plataforma", width: "140px" },
                      { label: "Pilar de Contenido", width: "140px" },
                      { label: "Tema / Concepto", width: "160px" },
                      { label: "Detalles del Post", width: "200px" },
                      { label: "Tipo de Post", width: "100px" },
                      { label: "Estado", width: "130px" },
                      { label: "Objetivo (KPI)", width: "130px" },
                      { label: "Canva", width: "80px" },
                      { label: "Acciones", width: "90px" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider"
                        style={{
                          color: "var(--foreground)",
                          minWidth: col.width,
                          letterSpacing: "0.06em",
                          borderRight: "none",
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && filteredContents.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin" size={20} /> Cargando publicaciones...
                        </span>
                      </td>
                    </tr>
                  ) : filteredContents.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center" style={{ color: "var(--text-muted)" }}>
                        <div className="flex flex-col items-center gap-3">
                          <Calendar size={40} style={{ color: "var(--border)" }} />
                          <p className="font-semibold">No hay publicaciones registradas</p>
                          <p className="text-xs">Haz clic en &quot;Nueva Publicación&quot; para comenzar.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContents.map((item, idx) => {
                      const statusData = getStatusData(item.status);
                      const isEven = idx % 2 === 0;

                      return (
                        <tr
                          key={item.id}
                          className="transition-colors"
                          style={{
                            borderBottom: "2px solid #cbd5e1",
                            background: isEven ? "white" : "rgba(243,244,246,0.5)",
                            verticalAlign: "top",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(180,195,7,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isEven ? "white" : "rgba(243,244,246,0.5)")}
                        >
                          {/* Nro */}
                          <td className="py-3 px-4 font-bold text-center" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {idx + 1}
                          </td>

                          {/* Mes */}
                          <td className="py-3 px-4 font-medium text-sm" style={{ color: "var(--foreground)", whiteSpace: "nowrap" }}>
                            {item.month || "—"}
                          </td>

                          {/* Fecha */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs" style={{ color: "var(--foreground)" }}>
                                {item.publishDate
                                  ? new Date(item.publishDate).toLocaleDateString("es-ES", {
                                      month: "short",
                                      day: "numeric",
                                      timeZone: "UTC",
                                    }).toUpperCase()
                                  : "—"}
                              </span>
                              <span className="text-[10px]" style={{ color: "var(--text-light)" }}>
                                {item.publishDate
                                  ? new Date(item.publishDate).toLocaleDateString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      timeZone: "UTC",
                                    })
                                  : ""}
                              </span>
                            </div>
                          </td>

                          {/* Plataforma */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap" style={{ maxWidth: '140px' }}>
                              {(item.platform || "").split(",").map(p => p.trim()).filter(Boolean).map(plat => {
                                const pData = getPlatformData(plat);
                                return (
                                  <span
                                    key={plat}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm tooltip-trigger"
                                    style={{
                                      background: `${pData.color}15`,
                                      border: `1px solid ${pData.color}30`,
                                      color: pData.color,
                                    }}
                                    title={plat}
                                  >
                                    {pData.icon}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Pilar de Contenido */}
                          <td className="py-3.5 px-4">
                            <span
                              className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                              style={{
                                background: "var(--primary)",
                                color: "white",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {item.contentPillar || "—"}
                            </span>
                          </td>

                          {/* Tema / Concepto */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                              {item.topic || item.title || "—"}
                            </span>
                          </td>

                          {/* Detalles del Post */}
                          <td className="py-3 px-4">
                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: "var(--text-muted)", maxWidth: "200px", wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                            >
                              {item.description || "Sin detalles"}
                            </p>
                          </td>

                          {/* Tipo de Post */}
                          <td className="py-3.5 px-4">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold"
                              style={{
                                background: "var(--surface)",
                                color: "var(--foreground)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {item.postType || item.format || "—"}
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-4">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                              style={{
                                background: statusData.bgColor,
                                color: statusData.color,
                                border: `1.5px solid ${statusData.borderColor}`,
                              }}
                            >
                              <span style={{ fontSize: "12px" }}>{statusData.icon}</span>
                              {item.status}
                            </span>
                          </td>

                          {/* Objetivo KPI */}
                          <td className="py-3 px-4">
                            <span className="text-xs font-semibold" style={{ color: "var(--foreground)", whiteSpace: "nowrap" }}>
                              {item.objectiveKpi || "—"}
                            </span>
                          </td>

                          {/* Canva Link */}
                          <td className="py-3 px-4">
                            {item.canvaLink ? (
                              <a
                                href={item.canvaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md transition-colors"
                                style={{
                                  color: "#7c3aed",
                                  background: "rgba(124,58,237,0.08)",
                                  border: "1px solid rgba(124,58,237,0.2)",
                                  textDecoration: "none",
                                }}
                              >
                                <ExternalLink size={11} />
                                Ver Canva
                              </a>
                            ) : (
                              <span className="text-xs" style={{ color: "var(--border)" }}>—</span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-4" style={{ whiteSpace: "nowrap" }}>
                            {deleteId === item.id ? (
                              <div
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg"
                                style={{
                                  background: "rgba(239,68,68,0.08)",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                }}
                              >
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="text-xs px-2 font-bold hover:underline"
                                  style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="text-xs px-2 font-bold hover:underline"
                                  style={{
                                    color: "var(--text-muted)",
                                    borderLeft: "1px solid rgba(239,68,68,0.2)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openForm(item)}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{
                                    color: "var(--text-muted)",
                                    background: "transparent",
                                    border: "1.5px solid transparent",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                                    e.currentTarget.style.color = "var(--info)";
                                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.borderColor = "transparent";
                                  }}
                                  title="Editar"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => setDeleteId(item.id)}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{
                                    color: "var(--text-muted)",
                                    background: "transparent",
                                    border: "1.5px solid transparent",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                                    e.currentTarget.style.color = "var(--danger)";
                                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.borderColor = "transparent";
                                  }}
                                  title="Eliminar"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer info */}
            {!loading && filteredContents.length > 0 && (
              <div
                className="px-5 py-3 flex items-center justify-between text-xs"
                style={{
                  borderTop: "1px solid var(--border)",
                  background: "rgba(243,244,246,0.5)",
                  color: "var(--text-muted)",
                }}
              >
                <span>
                  Mostrando <strong style={{ color: "var(--foreground)" }}>{filteredContents.length}</strong> publicación
                  {filteredContents.length !== 1 ? "es" : ""}
                </span>
                <span className="font-semibold" style={{ color: "var(--primary-hover)" }}>
                  {activeBrand === "APM" ? "APM Group" : "Logra"}
                </span>
              </div>
            )}
          </div>

          {/* ── Right Sidebar: Filters ────────────────────────────────────────── */}
          <div
            className="hidden lg:flex flex-col gap-4"
            style={{
              width: "240px",
              flexShrink: 0,
            }}
          >
            {/* Filter Card */}
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "3px solid var(--primary)",
                padding: "1.25rem",
                boxShadow: "0 4px 18px rgba(180,195,7,0.18)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Filter size={16} style={{ color: "var(--primary)" }} />
                <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  Filtros
                </span>
              </div>

              {/* Month Filter */}
              <div className="mb-4">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
                >
                  Mes
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="input-field text-sm"
                    style={{ paddingRight: "2rem", appearance: "none", cursor: "pointer" }}
                  >
                    <option value="Todos">Todos</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Platform Filter */}
              <div className="mb-4">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
                >
                  Plataforma
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className="input-field text-sm"
                    style={{ paddingRight: "2rem", appearance: "none", cursor: "pointer" }}
                  >
                    <option value="Todas">Todas</option>
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-4">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
                >
                  Estado
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field text-sm"
                    style={{ paddingRight: "2rem", appearance: "none", cursor: "pointer" }}
                  >
                    <option value="Todos">Todos</option>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Search */}
              <div>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
                >
                  Buscar
                </label>
                <div style={{ position: "relative" }}>
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-light)",
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="input-field text-sm"
                    style={{ paddingLeft: "2rem" }}
                  />
                </div>
              </div>

              {/* Clear filters */}
              {(filterMonth !== "Todos" || filterPlatform !== "Todas" || filterStatus !== "Todos" || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterMonth("Todos");
                    setFilterPlatform("Todas");
                    setFilterStatus("Todos");
                    setSearchQuery("");
                  }}
                  className="mt-4 w-full text-xs font-bold py-2 rounded-lg transition-colors"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Stats Mini Card */}
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "3px solid var(--primary)",
                padding: "1.25rem",
                boxShadow: "0 4px 18px rgba(180,195,7,0.18)",
              }}
            >
              <span className="font-bold text-sm block mb-3" style={{ color: "var(--foreground)" }}>
                Resumen
              </span>
              <div className="space-y-2">
                {STATUSES.map((s) => {
                  const count = contents.filter(
                    (c) => c.status === s.value && (c.calendarBrand || "APM") === activeBrand
                  ).length;
                  return (
                    <div key={s.value} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {s.value}
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Nueva / Editar Publicación ──────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 min-h-screen"
          style={{ zIndex: 9998, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto animate-scale-in"
            style={{
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "linear-gradient(135deg, rgba(180,195,7,0.06), transparent)",
              }}
            >
              <h2 className="text-lg font-extrabold flex items-center gap-2.5" style={{ color: "var(--foreground)" }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--primary)", color: "white" }}
                >
                  <Calendar size={16} />
                </div>
                {editId ? "Editar Publicación" : "Nueva Publicación"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  color: "var(--text-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Mes *
                  </label>
                  <select className="input-field" value={formMonth} onChange={(e) => setFormMonth(e.target.value)}>
                    {MONTHS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Fecha *
                  </label>
                  <input
                    required
                    type="date"
                    className="input-field"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>

                {/* Plataforma */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Plataforma (Selecciona una o varias) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const isSelected = formPlatforms.includes(p.value);
                      return (
                        <button
                          type="button"
                          key={p.value}
                          onClick={() => {
                            if (isSelected) {
                              setFormPlatforms(formPlatforms.filter(plat => plat !== p.value));
                            } else {
                              setFormPlatforms([...formPlatforms, p.value]);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all hover:opacity-80"
                          style={{
                            background: isSelected ? `${p.color}20` : "var(--surface)",
                            border: `1.5px solid ${isSelected ? p.color : "var(--border)"}`,
                            color: isSelected ? p.color : "var(--text-muted)",
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>{p.icon}</span>
                          {p.value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pilar de Contenido */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Pilar de Contenido *
                  </label>
                  <select className="input-field" value={formPillar} onChange={(e) => setFormPillar(e.target.value)}>
                    {CONTENT_PILLARS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Tema / Concepto */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Tema / Concepto *
                  </label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="Ej. 5 Tips para Reels virales"
                  />
                </div>

                {/* Detalles del Post */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Detalles del Post
                  </label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: "80px" }}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe el contenido, hashtags, notas para el equipo..."
                  />
                </div>

                {/* Tipo de Post */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Tipo de Post *
                  </label>
                  <select className="input-field" value={formPostType} onChange={(e) => setFormPostType(e.target.value)}>
                    {POST_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Estado *
                  </label>
                  <select className="input-field font-bold" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Objetivo KPI */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Objetivo - KPI *
                  </label>
                  <select className="input-field" value={formKpi} onChange={(e) => setFormKpi(e.target.value)}>
                    {KPI_OPTIONS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </div>

                {/* Canva Link */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1.5">
                      <Link2 size={12} />
                      Link del proyecto en Canva
                    </span>
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={formCanvaLink}
                    onChange={(e) => setFormCanvaLink(e.target.value)}
                    placeholder="https://www.canva.com/design/..."
                  />
                  {formCanvaLink && (
                    <a
                      href={formCanvaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs font-semibold"
                      style={{ color: "#7c3aed", textDecoration: "none" }}
                    >
                      <ExternalLink size={11} /> Abrir en Canva
                    </a>
                  )}
                </div>
              </div>

              {/* Brand indicator */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(180,195,7,0.06)",
                  border: "1px solid rgba(180,195,7,0.15)",
                }}
              >
                <span className="text-xs font-bold" style={{ color: "var(--primary-hover)" }}>
                  📌 Calendario:
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {activeBrand === "APM" ? "APM Group" : "Logra"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 py-3 font-bold"
                  disabled={saving}
                  style={{ borderRadius: "10px" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 font-bold flex items-center justify-center gap-2 text-base"
                  disabled={saving}
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                    borderRadius: "10px",
                    boxShadow: "0 4px 14px rgba(180,195,7,0.3)",
                  }}
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PDF Preview Modal ─────────────────────────────────────────────────── */}
      {showPdfPreview && (() => {
        const { dataUrl, title, canvasW, canvasH, scale } = generatePdf();
        return (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 9998, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowPdfPreview(false)}
            />
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => setShowPdfPreview(false)}
            >
              {/* PDF Modal Header */}
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{
                  background: "linear-gradient(135deg, #b4c307, #8fa005)",
                  color: "white",
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <FileDown size={22} />
                  <div>
                    <p className="font-extrabold text-base leading-tight">Vista previa del PDF</p>
                    <p className="text-xs opacity-80 mt-0.5">{title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1" style={{ background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "2px 6px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPdfZoom(Math.max(30, pdfZoom - 20)); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontWeight: 700, fontSize: "18px", padding: "2px 8px" }}
                    >
                      −
                    </button>
                    <span className="text-xs font-bold" style={{ minWidth: "40px", textAlign: "center" }}>
                      {pdfZoom}%
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPdfZoom(Math.min(300, pdfZoom + 20)); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontWeight: 700, fontSize: "18px", padding: "2px 8px" }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const { jsPDF } = await import("jspdf");
                        const pdf = new jsPDF({
                          orientation: "landscape",
                          unit: "pt",
                          format: [canvasW / scale, canvasH / scale]
                        });
                        pdf.addImage(dataUrl, "PNG", 0, 0, canvasW / scale, canvasH / scale);
                        pdf.save(`contenido-semanal-${activeBrand}.pdf`);
                      } catch (err) {
                        console.error("Error generating PDF:", err);
                        alert("Hubo un error al generar el archivo PDF.");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    style={{
                      background: "white",
                      color: "#8fa005",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FileDown size={15} />
                    Descargar PDF
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowPdfPreview(false); setPdfZoom(100); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "white" }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* PDF Image Preview with zoom */}
              <div
                style={{ flex: 1, overflow: "auto", background: "#64748b", padding: "24px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={dataUrl}
                  alt="Vista previa del PDF"
                  style={{
                    width: `${pdfZoom}%`,
                    maxWidth: "none",
                    borderRadius: "4px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
