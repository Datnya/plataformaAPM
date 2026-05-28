"use client";

import { useState, useCallback } from "react";
import { FileText, Download, X, Eye, Image as ImageIcon, ChevronLeft, Loader2, Search } from "lucide-react";

// Helper to convert File to ArrayBuffer
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export default function AdminGeneradorPropuestas() {
  const [selectedType, setSelectedType] = useState<"iso" | "auditoria" | null>(null);
  
  // Form State
  const [razonSocial, setRazonSocial] = useState("");
  const [ruc, setRuc] = useState("");
  const [norma, setNorma] = useState(""); // Or tipo de auditoría
  const [fecha, setFecha] = useState("");
  const [montoBasic, setMontoBasic] = useState("");
  const [montoPlus, setMontoPlus] = useState("");
  const [montoPremium, setMontoPremium] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Preview State
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);

  const handleReset = () => {
    setRazonSocial("");
    setRuc("");
    setNorma("");
    setFecha("");
    setMontoBasic("");
    setMontoPlus("");
    setMontoPremium("");
    setLogoFile(null);
    setPreviewUrl(null);
    setFinalBlob(null);
    setSelectedType(null);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setFinalBlob(null);
    handleReset();
  };

  const handleGenerate = async () => {
    if (!razonSocial || !ruc || !norma || !fecha || !montoBasic || !montoPlus || !montoPremium) {
      alert("Por favor completa todos los campos de texto.");
      return;
    }

    setIsGenerating(true);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");

      const fileName = selectedType === "iso" 
        ? "Propuesta implementación ISO.pdf" 
        : "Propuesta auditoría externa.pdf";
      
      const res = await fetch(`/propuestas/${fileName}`);
      if (!res.ok) throw new Error("No se pudo cargar la plantilla base.");
      const templateBytes = await res.arrayBuffer();

      const doc = await PDFDocument.load(templateBytes);
      const pages = doc.getPages();

      const drawTextWithBg = (page: any, text: string, x: number, y: number, w: number, h: number, size: number, font: any) => {
        // Draw white background
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1) });
        // Draw new text
        page.drawText(text, { x, y: y + (h - size) / 2 + 2, size, font, color: rgb(0.2, 0.2, 0.2) });
      };

      const fontBold = await doc.embedFont("Helvetica-Bold");
      const fontNormal = await doc.embedFont("Helvetica");

      // --- COMMON REPLACEMENTS ---
      // These coordinates are approximations and might need fine-tuning.
      // pdf-lib origin (0,0) is BOTTOM-LEFT.
      const p1 = pages[0]; 
      
      // Cover Page Replacements
      // Client name (around y=364 from bottom in ISO, wait, PDF.js y is from bottom too?)
      // We will draw a generous white box
      drawTextWithBg(p1, razonSocial, 240, 360, 300, 15, 11, fontBold);
      // Date
      drawTextWithBg(p1, fecha, 240, 267, 150, 15, 11, fontNormal);
      // Norma
      drawTextWithBg(p1, norma, 80, 425, 450, 15, 12, fontBold);
      // Add RUC on cover (custom addition since it wasn't there before)
      p1.drawText(`RUC: ${ruc}`, { x: 240, y: 345, size: 10, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });

      // Embed Logo if provided
      if (logoFile) {
        try {
          const logoBytes = await fileToArrayBuffer(logoFile);
          const logoImg = await doc.embedPng(logoBytes);
          const dims = logoImg.scale(0.5); // Adjust scale as needed
          // Place logo at top right of cover
          p1.drawImage(logoImg, {
            x: 400,
            y: 700,
            width: dims.width,
            height: dims.height,
          });
        } catch (e) {
          console.error("Error embedding logo (must be valid PNG):", e);
        }
      }

      // --- TEMPLATE SPECIFIC REPLACEMENTS ---
      if (selectedType === "iso") {
        // Replace prices on their respective pages (Pages 16, 18, 20 are indices 15, 17, 19)
        // Basic (Essential) - Page 16 (index 15)
        if (pages[15]) drawTextWithBg(pages[15], `S/ ${montoBasic}`, 250, 400, 100, 20, 11, fontBold);
        // Plus (Strategic) - Page 18 (index 17)
        if (pages[17]) drawTextWithBg(pages[17], `S/ ${montoPlus}`, 250, 400, 100, 20, 11, fontBold);
        // Premium (Transformation) - Page 20 (index 19)
        if (pages[19]) drawTextWithBg(pages[19], `S/ ${montoPremium}`, 250, 400, 100, 20, 11, fontBold);

        // Resumen Final - Page 30 (index 29)
        if (pages[29]) {
           drawTextWithBg(pages[29], razonSocial, 310, 240, 250, 15, 10, fontBold);
           drawTextWithBg(pages[29], `S/ ${montoBasic}`, 150, 432, 80, 12, 9, fontNormal);
           drawTextWithBg(pages[29], `S/ ${montoPlus}`, 310, 432, 80, 12, 9, fontNormal);
           drawTextWithBg(pages[29], `S/ ${montoPremium}`, 470, 432, 80, 12, 9, fontNormal);
        }
      } else {
        // Auditoria
        // Pricing usually on page 10 (index 9) for Auditoria based on typical APM proposals
        if (pages[9]) {
          drawTextWithBg(pages[9], `S/ ${montoBasic}`, 100, 350, 100, 20, 12, fontBold);
          drawTextWithBg(pages[9], `S/ ${montoPlus}`, 250, 350, 100, 20, 12, fontBold);
          drawTextWithBg(pages[9], `S/ ${montoPremium}`, 400, 350, 100, 20, 12, fontBold);
        }
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setFinalBlob(blob);
      setPreviewUrl(url);

    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al generar la propuesta. Verifica la consola.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!finalBlob) return;
    const { saveAs } = await import("file-saver");
    const name = selectedType === "iso" ? "Implementacion_ISO" : "Auditoria_Externa";
    saveAs(finalBlob, `Propuesta_${name}_${razonSocial.replace(/\s+/g, '_')}.pdf`);
    closePreview(); // Resets form as requested
  };

  // 1. Selector de Tipo
  if (!selectedType) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[80vh] flex flex-col">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <FileText className="text-primary" size={32} />
              Generador de Propuestas
            </h1>
            <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
              Selecciona el modelo de propuesta que deseas generar para el cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto flex-1 content-center pb-20">
            {/* Tarjeta ISO */}
            <button
              onClick={() => setSelectedType("iso")}
              className="group relative flex flex-col items-center p-12 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary hover:shadow-xl transition-all duration-300 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-6 shadow-sm border border-primary/20 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <FileText size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10">
                Implementación ISO
              </h3>
              <p className="text-gray-500 leading-relaxed relative z-10">
                Genera propuestas comerciales completas para la implementación de Sistemas Integrados de Gestión.
              </p>
            </button>

            {/* Tarjeta Auditoría */}
            <button
              onClick={() => setSelectedType("auditoria")}
              className="group relative flex flex-col items-center p-12 bg-white rounded-2xl border-2 border-gray-100 hover:border-secondary hover:shadow-xl transition-all duration-300 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-secondary/10 text-secondary mb-6 shadow-sm border border-secondary/20 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <Search size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10">
                Auditoría Externa
              </h3>
              <p className="text-gray-500 leading-relaxed relative z-10">
                Genera propuestas enfocadas en servicios de auditoría, diagnóstico y levantamiento de hallazgos.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Formulario
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium mb-2"
          >
            <ChevronLeft size={16} /> Volver a selección
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-primary" /> 
            Propuesta: {selectedType === "iso" ? "Implementación ISO" : "Auditoría Externa"}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Columna Izquierda: Datos del Cliente */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">1. Datos del Cliente</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Razón Social</label>
              <input 
                type="text" 
                className="input-field w-full" 
                placeholder="Ej. APM Contratistas Generales S.A.C."
                value={razonSocial}
                onChange={e => setRazonSocial(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">RUC</label>
                <input 
                  type="text" 
                  className="input-field w-full" 
                  placeholder="Ej. 20548072281"
                  value={ruc}
                  onChange={e => setRuc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
                <input 
                  type="text" 
                  className="input-field w-full" 
                  placeholder="Ej. 25/05/2026"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {selectedType === "iso" ? "Norma(s) ISO a implementar" : "Tipo de Auditoría"}
              </label>
              <input 
                type="text" 
                className="input-field w-full" 
                placeholder={selectedType === "iso" ? "Ej. ISO 9001, ISO 14001, ISO 45001" : "Ej. Auditoría Interna Trinorma"}
                value={norma}
                onChange={e => setNorma(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logo del Cliente (Opcional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                <ImageIcon className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="font-semibold text-sm mb-1 text-gray-700">Subir imagen PNG</p>
                <p className="text-xs text-gray-500 mb-3">Recomendado: Fondo transparente</p>
                <input 
                  type="file" 
                  accept=".png" 
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {logoFile && (
                  <div className="bg-primary/10 text-primary text-sm font-medium py-1 px-3 rounded-full inline-block">
                    {logoFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Precios */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">2. Oferta Económica</h3>
            <p className="text-sm text-gray-500 mb-4">Ingresa únicamente el número (los montos se formatearán con "S/ " automáticamente en el PDF).</p>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-400">1</div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-800 mb-1">Paquete Basic (Essential)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">S/</span>
                    <input 
                      type="text" 
                      className="input-field w-full pl-9" 
                      placeholder="Ej. 110,000"
                      value={montoBasic}
                      onChange={e => setMontoBasic(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600">2</div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-800 mb-1">Paquete Plus (Strategic)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">S/</span>
                    <input 
                      type="text" 
                      className="input-field w-full pl-9 border-blue-200 focus:border-blue-500 focus:ring-blue-500" 
                      placeholder="Ej. 132,000"
                      value={montoPlus}
                      onChange={e => setMontoPlus(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-600">3</div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-800 mb-1">Paquete Premium (Transformation)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">S/</span>
                    <input 
                      type="text" 
                      className="input-field w-full pl-9 border-amber-200 focus:border-amber-500 focus:ring-amber-500" 
                      placeholder="Ej. 150,000"
                      value={montoPremium}
                      onChange={e => setMontoPremium(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-70 transition-all"
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin" size={20} /> Generando Propuesta...</>
                ) : (
                  <><Eye size={20} /> Generar Previsualización</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modal de Previsualización */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header del Modal */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Eye className="text-primary" size={20} />
                Previsualización de Propuesta
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownload}
                  className="btn-primary py-2 px-6 flex items-center gap-2 shadow-md"
                >
                  <Download size={18} /> Descargar PDF
                </button>
                <button 
                  onClick={() => setPreviewUrl(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Visor PDF */}
            <div className="flex-1 bg-gray-100 relative">
              <iframe 
                src={`${previewUrl}#toolbar=0`} 
                className="w-full h-full border-none"
                title="Previsualización PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
