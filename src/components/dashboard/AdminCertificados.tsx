"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, Loader2, Award, Printer, Trash2, Plus, X, Download, FileDown } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  name: string;
  client: { companyName: string } | null;
  consultant: { id: string; name: string; signatureUrl: string | null } | null;
}

export default function AdminCertificados() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<{id:string, name:string, signatureUrl:string}[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedConsultantId, setSelectedConsultantId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [issueDate, setIssueDate] = useState("");
  
  const [excelData, setExcelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedResults, setGeneratedResults] = useState<{name:string, code:string, accessKey:string}[]>([]);
  const [showExplorerModal, setShowExplorerModal] = useState(false);

  // Signatures Management
  const [showSignaturesModal, setShowSignaturesModal] = useState(false);
  const [newSignatureName, setNewSignatureName] = useState("");
  const [newSignatureFile, setNewSignatureFile] = useState<File | null>(null);
  const [uploadingSig, setUploadingSig] = useState(false);

  const loadSignatures = async () => {
    try {
      const res = await fetch("/api/admin/signatures");
      const data = await res.json();
      setConsultants(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedConsultantId(data[0].id);
      } else {
        setSelectedConsultantId("");
      }
    } catch (e) {}
  };

  useEffect(() => {
    Promise.all([
       fetch("/api/projects").then(res => res.json())
    ]).then(([projData]) => {
       setProjects(Array.isArray(projData) ? projData : []);
       loadSignatures();
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsed = XLSX.utils.sheet_to_json(sheet);
      setExcelData(parsed);
    };
    reader.readAsBinaryString(file);
  };

  const generatePDF = async (participantName: string, participantCode: string, accessKey: string) => {
    const project = projects.find(p => String(p.id) === selectedProjectId);
    if (!project) return null;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Determine domain for QR
    const domain = window.location.origin;
    const qrUrl = `${domain}/certificados/validar/${accessKey}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1 });

    // Try to load base template image
    // Background image must be in public/certificados-bg.jpg
    const baseImageUrl = "/certificados-bg.jpg";
    const baseImage = new Image();
    baseImage.src = baseImageUrl;
    await new Promise((resolve) => {
      baseImage.onload = resolve;
      baseImage.onerror = resolve; // Continue even if missing
    });

    if (baseImage.width) {
       doc.addImage(baseImage, "JPEG", 0, 0, 297, 210);
    } else {
       // Fallback border if no image available for development
       doc.setDrawColor(0);
       doc.setLineWidth(1);
       doc.rect(10, 10, 277, 190);
    }

    // Texts setup (Coordinates adjusted per user spec)
    doc.setFont("helvetica", "bold");
    
    // Título del curso (Liderazgo)
    doc.setFontSize(22);
    doc.setTextColor(50, 50, 50);
    // Positioned normally top
    doc.text(courseTitle.toUpperCase(), 148.5, 75, { align: "center" });

    // Participante
    doc.setFontSize(30);
    doc.setTextColor(0, 0, 0);
    // Positioned below Liderazgo
    doc.text(participantName, 148.5, 95, { align: "center" });

    // Datos Dinámicos (Duración, Fecha, Código)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    
    // Position text precisely over the lines. Assuming A4 width=297, Left=~100, Right=~190
    // Example layout adjustment (You may tweak exact Y to match your line)
    doc.text(duration, 95, 125, { align: "center" }); // Over the Duration line
    
    if (issueDate) {
      const isDate = new Date(issueDate).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
      doc.text(isDate, 148.5, 125, { align: "center" }); // Over the Date line
    }
    
    doc.text(participantCode, 202, 125, { align: "center" }); // Over the Code line

    // Firma del consultor (from selected)
    const selectedCons = consultants.find(c => c.id === selectedConsultantId);
    if (selectedCons && selectedCons.signatureUrl) {
       try {
         const sigImg = new Image();
         sigImg.crossOrigin = "Anonymous";
         sigImg.src = selectedCons.signatureUrl;
         await new Promise((res) => { sigImg.onload = res; sigImg.onerror = res; });
         if (sigImg.width) {
            // Right signature pos over the right line (opuesta a General Manager)
            doc.addImage(sigImg, "PNG", 200, 160, 45, 25);
         }
       } catch (e) {}
    }

    // Consultant Name under Signature
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    if (selectedCons) {
      doc.text(selectedCons.name, 222.5, 192, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Consultor Asociado", 222.5, 197, { align: "center" });
    }

    // Add QR Code (bottom left over Escanee para validar)
    doc.addImage(qrDataUrl, "PNG", 25, 165, 30, 30);
    doc.setFontSize(8);
    // No extra 'Escanee para validar' text because it's already in the JPG!
    
    return doc.output("blob");
  };

  const handleGenerate = async () => {
    if (!selectedProjectId || !courseTitle || !duration || !issueDate || excelData.length === 0) {
      alert("Por favor completa todos los campos obligatorios y sube el Excel.");
      return;
    }

    setGenerating(true);
    setProgress(0);
    const results = [];
    const project = projects.find(p => String(p.id) === selectedProjectId);
    let successCount = 0;

    for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        // Guess column mappings manually based on common names "Nombres, apellidos y código"
        const participantName = row["Nombres"] || row["Nombre"] || row["Participante"];
        let lastName = row["Apellidos"] || row["Apellido"] || "";
        const participantCode = String(row["Código"] || row["codigo"] || row["Codigo"] || "");
        
        const fullName = lastName ? `${participantName} ${lastName}`.trim() : participantName;

        if (!fullName) continue;

        // Generate UUID locally
        const accessKey = crypto.randomUUID();

        // Generate PDF Document
        const pdfBlob = await generatePDF(fullName, participantCode, accessKey);
        
        if (!pdfBlob) continue;

        // Upload to Server (Server acts as proxy to Supabase Storage due to Service Role)
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
               const b64 = (reader.result as string).split(",")[1];
               resolve(b64);
            };
            reader.readAsDataURL(pdfBlob);
        });
        const base64Data = await base64Promise;

        try {
            const res = await fetch("/api/admin/certificates/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    courseTitle,
                    duration,
                    issueDate,
                    participantName: fullName,
                    participantCode,
                    accessKey,
                    pdfBase64: base64Data
                })
            });

            if (res.ok) {
                const data = await res.json();
                successCount++;
                // Get URL roughly since API doesn't return URL, just true.
                results.push({ name: fullName, code: participantCode, accessKey });
            }
        } catch (e) {
            console.error(e);
        }

        setProgress(Math.round(((i + 1) / excelData.length) * 100));
    }

    setGenerating(false);
    setGeneratedResults(results);
    setShowExplorerModal(true);
  };

  // Signatures Modal Handlers
  const handleUploadSignature = async () => {
    if (!newSignatureName || !newSignatureFile) return;
    setUploadingSig(true);
    try {
       const reader = new FileReader();
       const base64Promise = new Promise<string>((resolve) => {
           reader.onloadend = () => {
              const b64 = (reader.result as string).split(",")[1];
               resolve(b64);
           };
           reader.readAsDataURL(newSignatureFile);
       });
       const b64 = await base64Promise;
       const res = await fetch("/api/admin/signatures", {
         method: "POST", headers: {"Content-Type":"application/json"},
         body: JSON.stringify({ name: newSignatureName, base64Image: b64 })
       });
       if(res.ok) {
         setNewSignatureName("");
         setNewSignatureFile(null);
         loadSignatures();
       }
    } catch(e) {}
    setUploadingSig(false);
  };

  const handleDeleteSignature = async (id: string) => {
     if(!confirm("¿Eliminar esta firma?")) return;
     try {
       await fetch(`/api/admin/signatures?id=${id}`, { method: "DELETE" });
       loadSignatures();
     } catch(e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
             <Award className="text-primary" /> Generador de Certificados
          </h1>
          <p className="text-text-muted text-sm mt-1">Generación masiva de certificados verificables por QR</p>
        </div>
        <button 
           onClick={() => setShowSignaturesModal(true)}
           className="btn-secondary py-2 px-4 shadow-sm text-sm"
        >
          Gestión de Firmas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">1. Datos del Certificado</h2>
          
          <div>
             <label className="block text-xs font-bold text-text-muted mb-1">Proyecto Vinculado</label>
             <select 
               className="input-field"
               value={selectedProjectId}
               onChange={e => setSelectedProjectId(e.target.value)}
             >
               <option value="">Selecciona el Proyecto</option>
               {projects.map(p => (
                 <option key={p.id} value={p.id}>{p.name} - {p.client?.companyName}</option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-text-muted mb-1">Título de la Formación</label>
             <input 
               type="text" 
               className="input-field" 
               placeholder="Ej: Liderazgo Estratégico ISO 9001"
               value={courseTitle}
               onChange={e => setCourseTitle(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Duración</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej: 16 horas académicas"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">Fecha de Emisión</label>
              <input 
                type="date" 
                className="input-field"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm space-y-3">
             <p className="font-semibold text-primary">Firma del Consultor</p>
             {consultants.length > 0 ? (
               <select 
                 className="input-field bg-white"
                 value={selectedConsultantId}
                 onChange={e => setSelectedConsultantId(e.target.value)}
               >
                 {consultants.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
             ) : (
                <p className="text-xs text-danger font-medium border border-danger/20 p-2 rounded bg-white">No hay consultores con firma registrada en el sistema.</p>
             )}
          </div>
        </div>

        <div className="card space-y-4">
           <h2 className="text-lg font-bold">2. Nómina de Participantes</h2>
           
           <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-surface/50 transition-colors">
              <Upload className="mx-auto mb-2 opacity-50 text-text-muted" size={32} />
              <p className="font-semibold text-sm mb-1">Importar archivo Excel</p>
              <p className="text-xs text-text-muted mb-4">Columnas exactas: Nombres, Apellidos, Código</p>
              <input 
                type="file" 
                accept=".xlsx, .csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-center text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
           </div>

           {excelData.length > 0 && (
              <div className="bg-success/5 border border-success/20 p-3 rounded-lg flex items-center gap-3">
                 <div className="p-2 bg-success text-white rounded-full"><CheckCircle2 size={16} /></div>
                 <div>
                   <p className="font-bold text-sm text-success">{excelData.length} participantes detectados</p>
                   <p className="text-xs text-text-muted">Revise la plantilla y proceda a generar.</p>
                 </div>
              </div>
           )}

           <button 
             onClick={handleGenerate} 
             disabled={generating || excelData.length === 0}
             className="w-full btn-primary py-3 font-bold text-sm flex items-center justify-center gap-2 mt-4"
           >
              {generating ? (
                <><Loader2 className="animate-spin" size={18} /> Procesando {progress}%</>
              ) : (
                <><Printer size={18} /> Iniciar Generación Masiva</>
              )}
           </button>
        </div>
      </div>

      {/* SIGNATURES MODAL */}
      {showSignaturesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-in">
              <div className="border-b border-border p-4 flex justify-between items-center bg-surface/30">
                 <h2 className="font-bold">Gestión de Firmas</h2>
                 <button onClick={() => setShowSignaturesModal(false)} className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors"><X size={18} /></button>
              </div>
              
              <div className="p-4 bg-surface/20 border-b border-border space-y-3">
                 <p className="text-xs font-bold text-text-muted">Agregar Nueva Firma</p>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <input 
                      type="text" 
                      placeholder="Nombre del Consultor" 
                      className="input-field text-sm"
                      value={newSignatureName}
                      onChange={e => setNewSignatureName(e.target.value)}
                   />
                   <input 
                      type="file"
                      accept="image/png"
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20 w-full"
                      onChange={e => setNewSignatureFile(e.target.files?.[0] || null)}
                   />
                 </div>
                 <button 
                    onClick={handleUploadSignature}
                    disabled={!newSignatureName || !newSignatureFile || uploadingSig}
                    className="btn-primary py-1.5 px-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {uploadingSig ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Agregar Firma
                 </button>
              </div>

              <div className="p-4 max-h-[300px] overflow-y-auto">
                 <p className="text-xs font-bold text-text-muted mb-3">Firmas Guardadas</p>
                 {consultants.length === 0 ? (
                    <p className="text-sm text-text-muted italic">No hay firmas guardadas aún.</p>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {consultants.map(c => (
                          <div key={c.id} className="border border-border rounded-xl p-3 bg-white flex flex-col items-center relative group">
                             <div className="h-12 flex items-center justify-center mb-2">
                                <img src={c.signatureUrl} alt={c.name} className="max-h-full max-w-full object-contain" />
                             </div>
                             <p className="text-xs font-bold flex-1 text-center truncate w-full">{c.name}</p>
                             <button
                               onClick={() => handleDeleteSignature(c.id)}
                               className="absolute top-2 right-2 text-danger opacity-0 group-hover:opacity-100 bg-danger/10 p-1.5 rounded transition-all"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* RESULT EXPLORER MODAL */}
      {showExplorerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
           <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
              <div className="border-b border-border p-4 flex justify-between items-center bg-surface/50">
                 <div>
                   <h2 className="font-bold flex items-center gap-2 text-lg"><CheckCircle2 className="text-success" /> Emisión Completada</h2>
                   <p className="text-xs text-text-muted mt-1">{generatedResults.length} certificados emitidos correctamente</p>
                 </div>
                 <button onClick={() => setShowExplorerModal(false)} className="text-text-muted hover:text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-6 bg-surface/20 flex-1 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <p className="font-bold text-sm">Explorador de Archivos</p>
                    <button
                        onClick={async () => {
                           try {
                             const zip = new JSZip();
                             const folder = zip.folder(courseTitle);
                             if (!folder) return;
                             
                             // Download precisely using the same generation function because we only have access key, otherwise we'd need public URL from API.
                             // Wait, we have accessKey, we can just fetch the PDF via the public supabase URL or regenerate it locally?
                             // Regenerating locally is faster!
                             await Promise.all(generatedResults.map(async (c: any) => {
                                const pdfBlob = await generatePDF(c.name, c.code, c.accessKey);
                                if (pdfBlob) folder.file(`${c.name.trim()}.pdf`, pdfBlob);
                             }));
                             
                             const content = await zip.generateAsync({ type: "blob" });
                             saveAs(content, `${courseTitle}_certificados.zip`);
                           } catch (e) {
                             alert("Error al armar el ZIP");
                           }
                        }}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                       <FileDown size={16} /> Descargar ZIP Masivo
                    </button>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generatedResults.map((c: any, idx: number) => (
                       <div key={idx} className="border border-border bg-white rounded-xl p-3 flex flex-col justify-between">
                          <div className="flex items-start gap-3 mb-3">
                             <div className="w-10 h-10 bg-danger/10 text-danger rounded flex items-center justify-center flex-shrink-0">
                                <FileText size={20} />
                             </div>
                             <div className="overflow-hidden">
                                <p className="font-bold text-xs truncate" title={c.name}>{c.name}</p>
                                <p className="text-[10px] text-text-muted font-mono">{c.code}</p>
                             </div>
                          </div>
                          <button
                             onClick={async () => {
                                const pdfBlob = await generatePDF(c.name, c.code, c.accessKey);
                                if (pdfBlob) saveAs(pdfBlob, `${c.name}.pdf`);
                             }}
                             className="w-full bg-surface hover:bg-surface-hover text-foreground/80 font-bold text-xs py-1.5 rounded transition-colors flex justify-center items-center gap-2"
                          >
                             <Download size={12} /> Descargar PDF
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
