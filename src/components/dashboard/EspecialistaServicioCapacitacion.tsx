"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  FileText,
  Upload,
  Download,
  Eye,
  X,
  CheckCircle2,
  Lock,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  PartyPopper,
  ShieldCheck,
  HardHat,
  FileSignature,
  AlertCircle,
  Video,
  Users,
  Presentation,
  CheckCircle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface SessionRecord {
  id: string;
  dateCompleted: string;
  attendanceDocUrl?: string;
  attendanceDocName?: string;
}

interface PresentationRecord {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface TrainingService {
  id: number;
  consultant_id: string;
  step1_admin_doc_url: string | null;
  step1_admin_doc_name: string | null;
  step1_consultant_doc_url: string | null;
  step1_consultant_doc_name: string | null;
  step1_completed_at: string | null;
  step2_template_url: string | null;
  step2_consultant_doc_url: string | null;
  step2_consultant_doc_name: string | null;
  step2_completed_at: string | null;
  step3_template_url: string | null;
  step3_consultant_doc_url: string | null;
  step3_consultant_doc_name: string | null;
  step3_completed_at: string | null;
  step4_completed_at: string | null;
  step5_completed_at: string | null;
  service_start_date: string | null;
  service_end_date: string | null;
  service_days: string;
  estimated_payment_date: string | null;
  presentations: PresentationRecord[];
  sessions: SessionRecord[];
  status: string;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmtDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const calcProgress = (svc: TrainingService | null): number => {
  if (!svc) return 0;
  let steps = 0;
  if (svc.step1_completed_at) steps++;
  if (svc.step2_completed_at) steps++;
  if (svc.step3_completed_at) steps++;
  if (svc.step4_completed_at) steps++;
  if (svc.step5_completed_at) steps++;
  return Math.round((steps / 5) * 100);
};

/* ─── Component ──────────────────────────────────────────────────── */
export default function EspecialistaServicioCapacitacion() {
  const { userId } = useAuth();
  const [service, setService] = useState<TrainingService | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchService = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `/api/training-services?consultantId=${userId}`
      );
      const data = await res.json();
      setService(data.service || null);
    } catch {
      setService(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const patchService = async (updates: Record<string, unknown>, stepType: string) => {
    if (!service) return;
    try {
      const res = await fetch("/api/training-services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, updates }),
      });
      const patchData = await res.json();
      if (!res.ok) throw new Error(patchData.error);
      setService(patchData.service);
      setSuccessMsg(`¡${stepType} actualizado exitosamente!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red.";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  /* Upload a document for step 1,2,3 or PPTs */
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    step: "step1" | "step2" | "step3" | "ppt"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!service) {
      setErrorMsg("El administrador debe iniciar el servicio primero asignándote un contrato.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }
    setUploading(step);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const now = new Date().toISOString();
      let updates: Record<string, unknown> = {};

      if (step === "step1") {
        updates = {
          step1ConsultantDocUrl: uploadData.url,
          step1ConsultantDocName: file.name,
          step1CompletedAt: now,
        };
      } else if (step === "step2") {
        updates = {
          step2ConsultantDocUrl: uploadData.url,
          step2ConsultantDocName: file.name,
          step2CompletedAt: now,
        };
      } else if (step === "step3") {
        updates = {
          step3ConsultantDocUrl: uploadData.url,
          step3ConsultantDocName: file.name,
          step3CompletedAt: now,
        };
      } else if (step === "ppt") {
        // Append to presentations
        const newPres: PresentationRecord = {
          id: crypto.randomUUID(),
          name: file.name,
          url: uploadData.url,
          uploadedAt: now,
        };
        updates = {
          presentations: [...(service.presentations || []), newPres],
        };
      }

      await patchService(updates, step === "ppt" ? "Presentación subida" : "Documento");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir el archivo.";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleUploadAttendance = async (e: React.ChangeEvent<HTMLInputElement>, sessionId: string) => {
    const file = e.target.files?.[0];
    if (!file || !service) return;

    setUploading(`attendance-${sessionId}`);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // Update that specific session
      const updatedSessions = (service.sessions || []).map(s => {
        if (s.id === sessionId) {
          return { ...s, attendanceDocUrl: uploadData.url, attendanceDocName: file.name };
        }
        return s;
      });

      await patchService({ sessions: updatedSessions }, "Ficha de asistencia subida");
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Error al subir ficha.";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleMarkStepDone = async (stepKey: "step4" | "step5") => {
    if (!service) return;
    const updates = stepKey === "step4" 
      ? { step4CompletedAt: new Date().toISOString() } 
      : { step5CompletedAt: new Date().toISOString() };
    await patchService(updates, stepKey === "step4" ? "Paso 4" : "Paso 5");
  };

  const handleRegisterSession = async () => {
    if (!service) return;
    const newSession: SessionRecord = {
      id: crypto.randomUUID(),
      dateCompleted: new Date().toISOString()
    };
    await patchService({
      sessions: [...(service.sessions || []), newSession]
    }, "Sesión registrada");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const activeService = service || {
    id: 0,
    consultant_id: userId,
    step1_admin_doc_url: null,
    step1_admin_doc_name: null,
    step1_consultant_doc_url: null,
    step1_consultant_doc_name: null,
    step1_completed_at: null,
    step2_template_url: null,
    step2_consultant_doc_url: null,
    step2_consultant_doc_name: null,
    step2_completed_at: null,
    step3_template_url: null,
    step3_consultant_doc_url: null,
    step3_consultant_doc_name: null,
    step3_completed_at: null,
    step4_completed_at: null,
    step5_completed_at: null,
    service_start_date: null,
    service_end_date: null,
    service_days: "",
    estimated_payment_date: null,
    presentations: [],
    sessions: [],
    status: "PENDIENTE",
  };

  // Convert empty structures missing from fallback correctly
  if (!Array.isArray(activeService.presentations)) activeService.presentations = [];
  if (!Array.isArray(activeService.sessions)) activeService.sessions = [];

  const step1Done = !!activeService.step1_completed_at;
  const step2Done = !!activeService.step2_completed_at;
  const step3Done = !!activeService.step3_completed_at;
  const step4Done = !!activeService.step4_completed_at;
  const step5Done = !!activeService.step5_completed_at;
  
  const allStepsDone = step1Done && step2Done && step3Done && step4Done && step5Done;
  const progress = calcProgress(service);

  const step1HasAdminDoc = !!activeService.step1_admin_doc_url;
  const step2Unlocked = step1Done;
  const step3Unlocked = step2Done;
  const step4Unlocked = step3Done;
  const step5Unlocked = step4Done;

  const renderStepWithUpload = (
    stepNum: number,
    title: string,
    description: string,
    icon: React.ReactNode,
    isCompleted: boolean,
    isUnlocked: boolean,
    docUrl: string | null,
    docName: string | null,
    uploadedDocUrl: string | null,
    uploadedDocName: string | null,
    stepKey: "step1" | "step2" | "step3",
    noDocMessage?: string
  ) => {
    const isCurrentlyUploading = uploading === stepKey;

    return (
      <div className="relative flex flex-col" style={{ opacity: isUnlocked ? 1 : 0.45, pointerEvents: isUnlocked ? "auto" : "none" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: isCompleted ? "rgba(34,197,94,0.15)" : isUnlocked ? "rgba(180,195,7,0.15)" : "rgba(100,100,100,0.1)",
              border: `2px solid ${isCompleted ? "rgba(34,197,94,0.5)" : isUnlocked ? "rgba(180,195,7,0.5)" : "rgba(100,100,100,0.2)"}`
            }}
          >
            {isCompleted ? <CheckCircle2 size={20} className="text-green-500" /> : !isUnlocked ? <Lock size={16} className="text-gray-400" /> : <span className="text-sm font-bold" style={{ color: "#b4c307" }}>{stepNum}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{title}</h3>
            <p className="text-xs text-text-muted truncate">{description}</p>
          </div>
        </div>

        <div className="rounded-xl p-4 border transition-all duration-300"
          style={{ background: isCompleted ? "rgba(34,197,94,0.03)" : "rgba(255,255,255,0.02)", borderColor: isCompleted ? "rgba(34,197,94,0.15)" : "rgba(200,200,200,0.12)" }}
        >
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 text-xs font-semibold">
                <CheckCircle2 size={14} /> Completado el {fmtDate(activeService[`${stepKey}_completed_at` as keyof TrainingService] as string)}
              </div>
              {uploadedDocName && (
                <div className="flex items-center gap-2 text-xs text-text-muted bg-surface/50 px-3 py-2 rounded-lg">
                  <FileText size={14} className="text-primary flex-shrink-0" />
                  <span className="truncate flex-1">{uploadedDocName}</span>
                  {uploadedDocUrl && (
                    <button onClick={() => setPreviewUrl(uploadedDocUrl)} className="text-primary hover:text-primary-hover flex-shrink-0" title="Ver">
                      <Eye size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : !isUnlocked ? (
            <div className="text-center py-4">
              <Lock size={20} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">Completa el paso anterior para desbloquear</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stepKey === "step1" && !step1HasAdminDoc && noDocMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 font-medium">{noDocMessage}</p>
                </div>
              )}
              {docUrl && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setPreviewUrl(docUrl)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg hover:scale-[1.02] transition-transform" style={{ background: "rgba(180,195,7,0.1)", color: "#b4c307", border: "1px solid rgba(180,195,7,0.25)" }}><Eye size={14} /> Previsualizar</button>
                  <a href={docUrl} download={docName || "documento"} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg hover:scale-[1.02] transition-transform" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)" }}><Download size={14} /> Descargar</a>
                </div>
              )}
              {(stepKey !== "step1" || step1HasAdminDoc) && (
                <label className="block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 group transition-all" style={{ borderColor: "rgba(200,200,200,0.2)" }}>
                  <input type="file" className="hidden" onChange={(e) => handleUpload(e, stepKey)} disabled={isCurrentlyUploading} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.zip" />
                  {isCurrentlyUploading ? (
                    <div className="flex items-center justify-center gap-2 py-1"><Loader2 size={18} className="animate-spin text-primary" /><span className="text-xs font-medium text-text-muted">Subiendo...</span></div>
                  ) : (
                    <><Upload size={20} className="mx-auto mb-1 text-text-muted group-hover:text-primary transition-colors" /><p className="text-xs font-medium text-text-muted">Sube aquí tu documento firmado</p></>
                  )}
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSimpleDownloadStep = (
    stepNum: number,
    title: string,
    description: string,
    icon: React.ReactNode,
    isCompleted: boolean,
    isUnlocked: boolean,
    docUrl: string | null,
    stepKey: "step4" | "step5",
    importantWarning?: string
  ) => {
    return (
       <div className="relative flex flex-col" style={{ opacity: isUnlocked ? 1 : 0.45, pointerEvents: isUnlocked ? "auto" : "none" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: isCompleted ? "rgba(34,197,94,0.15)" : isUnlocked ? "rgba(180,195,7,0.15)" : "rgba(100,100,100,0.1)",
              border: `2px solid ${isCompleted ? "rgba(34,197,94,0.5)" : isUnlocked ? "rgba(180,195,7,0.5)" : "rgba(100,100,100,0.2)"}`
            }}
          >
            {isCompleted ? <CheckCircle2 size={20} className="text-green-500" /> : !isUnlocked ? <Lock size={16} className="text-gray-400" /> : <span className="text-sm font-bold" style={{ color: "#b4c307" }}>{stepNum}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{title}</h3>
            <p className="text-xs text-text-muted truncate">{description}</p>
          </div>
        </div>

        <div className="rounded-xl p-4 border transition-all duration-300"
          style={{ background: isCompleted ? "rgba(34,197,94,0.03)" : "rgba(255,255,255,0.02)", borderColor: isCompleted ? "rgba(34,197,94,0.15)" : "rgba(200,200,200,0.12)" }}
        >
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 text-xs font-semibold">
                <CheckCircle2 size={14} /> Formato descargado correctamente
              </div>
              {docUrl && (
                  <div className="flex items-center gap-2 text-xs font-semibold mt-2">
                    <a href={docUrl} download className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:scale-[1.02] transition-transform" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)" }}><Download size={14} /> Volver a Descargar</a>
                  </div>
              )}
            </div>
          ) : !isUnlocked ? (
            <div className="text-center py-4">
              <Lock size={20} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">Completa el paso anterior para desbloquear</p>
            </div>
          ) : (
            <div className="space-y-3">
              {importantWarning && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg animate-pulse-subtle" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium leading-relaxed">{importantWarning}</p>
                </div>
              )}
              {docUrl ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={docUrl} download onClick={() => {
                      setTimeout(() => handleMarkStepDone(stepKey), 1000); // give it time to trigger native download
                    }}
                    className="flex w-full items-center justify-center gap-1.5 text-xs font-bold px-3 py-3 rounded-lg hover:scale-[1.02] transition-transform" 
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", border: "none" }}
                  >
                    <Download size={16} /> Descargar Archivo para Completar Paso
                  </a>
                </div>
              ) : (
                <button onClick={() => handleMarkStepDone(stepKey)} className="flex w-full items-center justify-center gap-1.5 text-xs font-bold px-3 py-3 rounded-lg hover:scale-[1.02] transition-transform" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", border: "none" }}>
                   <CheckCircle2 size={16} /> Marcar como Completado
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold border-none">
          Servicio de Capacitación
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Completa todos los pasos antes de iniciar las presentaciones de sesión
        </p>
      </div>

      {successMsg && <div className="bg-success/10 border border-success/30 text-success text-sm font-semibold p-3 rounded-lg text-center animate-fade-in">{successMsg}</div>}
      {errorMsg && <div className="bg-danger/10 border border-danger/20 text-danger text-sm font-semibold p-3 rounded-lg text-center animate-fade-in">{errorMsg}</div>}

      {/* ──────── Progress Bar (5 milestones now) ──────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ClipboardCheck size={16} style={{ color: "#b4c307" }} />
            Progreso de Preparación
          </h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: progress === 100 ? "rgba(34,197,94,0.15)" : "rgba(180,195,7,0.15)", color: progress === 100 ? "#22c55e" : "#b4c307" }}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "rgba(200,200,200,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: progress === 100 ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #b4c307, #d4e300)" }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-text-muted font-medium">
          <span>Paso 1</span><span>Paso 2</span><span>Paso 3</span><span>Paso 4</span>
          {progress === 100 ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> Listo</span> : <span>Paso 5</span>}
        </div>
      </div>

      {/* ──────── Timeline Steps ──────── */}
      <div className="card">
        <h2 className="text-base font-bold mb-5 flex items-center gap-2">
          <FileSignature size={18} style={{ color: "#b4c307" }} />
          Documentación Requerida
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {renderStepWithUpload(
              1, "Contrato de Locación de Servicios", "Debe adjuntarse contrato base firmado.", <FileSignature size={18} />, step1Done, true, 
              activeService.step1_admin_doc_url, activeService.step1_admin_doc_name, activeService.step1_consultant_doc_url, activeService.step1_consultant_doc_name, "step1",
              "Aún no se ha agregado ningún documento. El administrador debe subir el contrato primero."
            )}
            
            {renderStepWithUpload(
              2, "Acuerdo de Confidencialidad", "Revisa, firma y sube el acuerdo.", <ShieldCheck size={18} />, step2Done, step2Unlocked, 
              activeService.step2_template_url || "/assets/acuerdo-confidencialidad.pdf", "Acuerdo de Confidencialidad", activeService.step2_consultant_doc_url, activeService.step2_consultant_doc_name, "step2"
            )}
            
            {renderStepWithUpload(
              3, "Recepcion de EPPS", "Confirma la recepción.", <HardHat size={18} />, step3Done, step3Unlocked, 
              activeService.step3_template_url || "/assets/recepcion-epps.pdf", "Formato EPPS", activeService.step3_consultant_doc_url, activeService.step3_consultant_doc_name, "step3"
            )}
            
            {renderSimpleDownloadStep(
              4, "Formato de Presentación", "Descarga el formato PPT de la empresa.", <Presentation size={18} />, step4Done, step4Unlocked,
              "/assets/formato-presentacion.pptx", "step4"
            )}
            
            {renderSimpleDownloadStep(
              5, "Lista de Participantes", "Hoja de asistencia presencial requerida.", <Users size={18} />, step5Done, step5Unlocked,
              "/assets/lista-participantes.xlsx", "step5",
              "IMPORTANTE: Es obligatorio que este formato se imprima y se llene en cada una de las sesiones que se realicen presencialmente con el cliente. TODOS los participantes deben firmarlo, sin ello la participación no contará para la acreditación."
            )}
        </div>
      </div>

      {/* ──────── Service General Specs ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ opacity: allStepsDone ? 1 : 0.4, transition: "opacity 0.4s ease" }}>
         <div className="card text-center group bg-surface">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(59,130,246,0.1)" }}>
            <CalendarDays size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Fechas de Servicio</p>
          <p className="text-sm font-bold" style={{ color: "#3b82f6" }}>{activeService.service_days || "—"}</p>
        </div>

        <div className="card text-center group bg-surface">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(34,197,94,0.1)" }}>
            <CircleDollarSign size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Fecha Estimada de Pago</p>
          <p className="text-2xl font-black" style={{ color: "#22c55e" }}>{fmtDate(activeService.estimated_payment_date)}</p>
          <p className="text-[10px] text-text-muted mt-1">Sujeto a culminación de sesiones</p>
        </div>
      </div>

      {/* ──────── Sessions Management (Unlocked after step 5) ──────── */}
      <div className="card relative transition-all duration-300"
        style={{
          border: allStepsDone ? "1px solid rgba(180,195,7,0.3)" : "1px solid rgba(200,200,200,0.2)",
          opacity: allStepsDone ? 1 : 0.45,
          pointerEvents: allStepsDone ? "auto" : "none"
        }}
      >
        {!allStepsDone && (
           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 rounded-xl backdrop-blur-[2px]">
             <Lock size={32} className="text-text-muted/60 mb-2" />
             <p className="text-sm font-semibold text-text-muted/80">Completa los 5 pasos superiores para gestionar las sesiones</p>
           </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
           {/* Upload PPT Area */}
           <div className="w-full md:w-1/2 border-r border-border pr-0 md:pr-8">
             <h2 className="text-base font-bold mb-4 flex items-center gap-2">
               <Presentation size={18} style={{ color: "#b4c307" }} />
               Presentaciones (PPT)
             </h2>
             <p className="text-xs text-text-muted mb-4">
               Sube la presentación que elaboraste para utilizar en esta(s) sesión(es) de capacitación. Utiliza el formato descargado en el Paso 4.
             </p>
             <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 group transition-all" style={{ borderColor: "rgba(200,200,200,0.2)" }}>
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, "ppt")} disabled={uploading === "ppt"} accept=".ppt,.pptx,.pdf" />
                {uploading === "ppt" ? (
                  <div className="flex items-center justify-center gap-2"><Loader2 size={24} className="animate-spin text-primary" /><span className="text-sm font-medium">Subiendo PPT...</span></div>
                ) : (
                  <><Upload size={24} className="mx-auto mb-2 text-text-muted group-hover:text-primary transition-colors" /><p className="text-sm font-semibold">Adjuntar PowerPoint</p></>
                )}
             </label>

             {/* PPT List */}
             {activeService.presentations.length > 0 && (
               <div className="mt-4 space-y-2">
                 {activeService.presentations.map((p) => (
                   <div key={p.id} className="flex flex-row items-center justify-between p-3 rounded-lg border border-border bg-surface text-xs font-medium">
                     <span className="flex items-center gap-2 truncate text-primary"><Presentation size={14}/> {p.name}</span>
                     <button onClick={() => setPreviewUrl(p.url)} className="text-text-muted hover:text-primary"><Eye size={14}/></button>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Completion Sessions Area */}
           <div className="w-full md:w-1/2">
             <h2 className="text-base font-bold mb-4 flex items-center gap-2">
               <Video size={18} style={{ color: "#b4c307" }} />
               Registro de Sesiones
             </h2>
             <p className="text-xs text-text-muted mb-4">
               Una vez finalizada una dictada de capacitación con el cliente exitosamente, registra la sesión aquí abajo.
             </p>

             <button
                onClick={handleRegisterSession}
                className="w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.15))", border: "1px dashed rgba(34,197,94,0.4)" }}
             >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.2)", color: "#16a34a" }}>
                  <CheckCircle size={20} />
                </div>
                <span className="text-sm font-bold text-green-700">Sesión Completada Exitosamente</span>
             </button>

             <div className="mt-6 flex flex-col gap-2">
               {activeService.sessions.map((sess, idx) => (
                  <div key={sess.id} className="flex flex-col gap-2 bg-surface p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex justify-center items-center text-green-600 font-bold text-xs">{idx + 1}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-text-light">Sesión {idx + 1} finalizada</p>
                        <p className="text-[10px] text-text-muted">Fecha: {fmtDate(sess.dateCompleted)}</p>
                      </div>
                    </div>
                    {sess.attendanceDocUrl ? (
                      <div className="flex items-center justify-between text-xs font-medium pl-11 bg-white/50 py-1.5 px-2 rounded">
                        <span className="truncate text-primary flex items-center gap-1.5"><FileText size={12}/> {sess.attendanceDocName}</span>
                        <div className="flex gap-2">
                           <button onClick={() => setPreviewUrl(sess.attendanceDocUrl!)} className="text-text-muted hover:text-primary"><Eye size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <div className="pl-11 mt-1">
                         <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover bg-primary/5 px-3 py-1.5 rounded-md border border-primary/20 transition-all">
                           <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleUploadAttendance(e, sess.id)} disabled={uploading === `attendance-${sess.id}`} />
                           {uploading === `attendance-${sess.id}` ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                           {uploading === `attendance-${sess.id}` ? "Subiendo..." : "Subir Lista de Asistencia (Firmada)"}
                         </label>
                      </div>
                    )}
                  </div>
               ))}
               {activeService.sessions.length === 0 && (
                 <p className="text-xs text-text-muted italic text-center mt-2">Aún no has registrado ninguna sesión.</p>
               )}
             </div>
           </div>
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 min-h-screen" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2"><Eye size={18} className="text-primary" /> Previsualización</h2>
              <button onClick={() => setPreviewUrl(null)} className="text-text-muted hover:text-danger p-1 rounded-lg"><X size={20}/></button>
            </div>
            <div className="flex-1 bg-surface"><iframe src={previewUrl} className="w-full h-full border-none" /></div>
          </div>
        </div>
      )}
    </div>
  );
}
