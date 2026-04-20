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
  Clock,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  PartyPopper,
  ShieldCheck,
  HardHat,
  FileSignature,
  AlertCircle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface AdhocService {
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
  service_start_date: string | null;
  service_end_date: string | null;
  service_days: string;
  report_deadline: string | null;
  estimated_payment_date: string | null;
  audit_report_url: string | null;
  audit_report_name: string | null;
  audit_report_uploaded_at: string | null;
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

const calcProgress = (svc: AdhocService | null): number => {
  if (!svc) return 0;
  let steps = 0;
  if (svc.step1_completed_at) steps++;
  if (svc.step2_completed_at) steps++;
  if (svc.step3_completed_at) steps++;
  if (svc.audit_report_uploaded_at) steps++;
  // 4 milestones = 100%
  return Math.round((steps / 4) * 100);
};

/* ─── Component ──────────────────────────────────────────────────── */
export default function EspecialistaServiciosAdhoc() {
  const { userId } = useAuth();
  const [service, setService] = useState<AdhocService | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const fetchService = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `/api/adhoc-services?consultantId=${userId}`
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

  /* Upload a file then update the service record */
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    step: "step1" | "step2" | "step3" | "audit"
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
      // 1. Upload file
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // 2. Build updates
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
          status: "EN_PROCESO",
        };
      } else if (step === "audit") {
        updates = {
          auditReportUrl: uploadData.url,
          auditReportName: file.name,
          auditReportUploadedAt: now,
          status: "INFORME_ENVIADO",
        };
      }

      // 3. Patch service
      const patchRes = await fetch("/api/adhoc-services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, updates }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchData.error);

      setService(patchData.service);

      if (step === "audit") {
        setShowThankYou(true);
      } else {
        setSuccessMsg("Documento subido correctamente.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir el archivo.";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  /* ─── Loading state ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  /* ─── Derived state ─────────────────────────────────────────────── */
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
    service_start_date: null,
    service_end_date: null,
    service_days: "",
    report_deadline: null,
    estimated_payment_date: null,
    audit_report_url: null,
    audit_report_name: null,
    audit_report_uploaded_at: null,
    status: "PENDIENTE",
  };

  const step1Done = !!activeService.step1_completed_at;
  const step2Done = !!activeService.step2_completed_at;
  const step3Done = !!activeService.step3_completed_at;
  const allStepsDone = step1Done && step2Done && step3Done;
  const auditDone = !!activeService.audit_report_uploaded_at;
  const progress = calcProgress(service);

  // If there's no service row yet, step 1 is technically locked for uploads but we show the UI
  const step1HasAdminDoc = !!activeService.step1_admin_doc_url;
  const step2Unlocked = step1Done;
  const step3Unlocked = step2Done;

  /* ─── Step card renderer ─────────────────────────────────────────── */
  const renderStep = (
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
      <div
        className="relative flex flex-col"
        style={{
          opacity: isUnlocked ? 1 : 0.45,
          pointerEvents: isUnlocked ? "auto" : "none",
        }}
      >
        {/* Step header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: isCompleted
                ? "rgba(34,197,94,0.15)"
                : isUnlocked
                ? "rgba(180,195,7,0.15)"
                : "rgba(100,100,100,0.1)",
              border: `2px solid ${
                isCompleted
                  ? "rgba(34,197,94,0.5)"
                  : isUnlocked
                  ? "rgba(180,195,7,0.5)"
                  : "rgba(100,100,100,0.2)"
              }`,
            }}
          >
            {isCompleted ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : !isUnlocked ? (
              <Lock size={16} className="text-gray-400" />
            ) : (
              <span
                className="text-sm font-bold"
                style={{ color: "#b4c307" }}
              >
                {stepNum}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{title}</h3>
            <p className="text-xs text-text-muted truncate">{description}</p>
          </div>
        </div>

        {/* Step card body */}
        <div
          className="rounded-xl p-4 border transition-all duration-300"
          style={{
            background: isCompleted
              ? "rgba(34,197,94,0.03)"
              : "rgba(255,255,255,0.02)",
            borderColor: isCompleted
              ? "rgba(34,197,94,0.15)"
              : "rgba(200,200,200,0.12)",
          }}
        >
          {isCompleted ? (
            /* ── Completed state ── */
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 text-xs font-semibold">
                <CheckCircle2 size={14} />
                Completado el {fmtDate(
                  stepKey === "step1"
                    ? activeService.step1_completed_at
                    : stepKey === "step2"
                    ? activeService.step2_completed_at
                    : activeService.step3_completed_at
                )}
              </div>
              {uploadedDocName && (
                <div className="flex items-center gap-2 text-xs text-text-muted bg-surface/50 px-3 py-2 rounded-lg">
                  <FileText size={14} className="text-primary flex-shrink-0" />
                  <span className="truncate flex-1">{uploadedDocName}</span>
                  {uploadedDocUrl && (
                    <button
                      onClick={() => setPreviewUrl(uploadedDocUrl)}
                      className="text-primary hover:text-primary-hover transition-colors flex-shrink-0"
                      title="Ver documento"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : !isUnlocked ? (
            /* ── Locked state ── */
            <div className="text-center py-4">
              <Lock size={20} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">
                Completa el paso anterior para desbloquear
              </p>
            </div>
          ) : (
            /* ── Active state ── */
            <div className="space-y-3">
              {/* Show admin doc or no-doc message for step 1 */}
              {stepKey === "step1" && !step1HasAdminDoc && noDocMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 font-medium">
                    {noDocMessage}
                  </p>
                </div>
              )}

              {/* Download/Preview original doc */}
              {docUrl && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPreviewUrl(docUrl)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: "rgba(180,195,7,0.1)",
                      color: "#b4c307",
                      border: "1px solid rgba(180,195,7,0.25)",
                    }}
                  >
                    <Eye size={14} /> Previsualizar
                  </button>
                  <a
                    href={docUrl}
                    download={docName || "documento"}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: "rgba(59,130,246,0.1)",
                      color: "#3b82f6",
                      border: "1px solid rgba(59,130,246,0.25)",
                    }}
                  >
                    <Download size={14} /> Descargar
                  </a>
                </div>
              )}

              {/* Upload signed doc */}
              {(stepKey !== "step1" || step1HasAdminDoc) && (
                <label className="block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 hover:border-primary/40 group"
                  style={{ borderColor: "rgba(200,200,200,0.2)" }}
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUpload(e, stepKey)}
                    disabled={isCurrentlyUploading}
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.zip"
                  />
                  {isCurrentlyUploading ? (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <Loader2
                        size={18}
                        className="animate-spin text-primary"
                      />
                      <span className="text-xs font-medium text-text-muted">
                        Subiendo documento...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload
                        size={20}
                        className="mx-auto mb-1 text-text-muted group-hover:text-primary transition-colors"
                      />
                      <p className="text-xs font-medium text-text-muted">
                        Sube aquí tu documento firmado
                      </p>
                      <p className="text-[10px] text-text-muted/60 mt-0.5">
                        PDF, imágenes o ZIP — Máx. 25MB
                      </p>
                    </>
                  )}
                </label>
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
          Servicio de Auditor
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Completa cada paso para dar inicio a tu servicio
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-success/10 border border-success/30 text-success text-sm font-semibold p-3 rounded-lg text-center animate-fade-in">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm font-semibold p-3 rounded-lg text-center animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* ──────── Progress Bar (always visible) ──────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ClipboardCheck size={16} style={{ color: "#b4c307" }} />
            Progreso General del Servicio
          </h2>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background:
                progress === 100
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(180,195,7,0.15)",
              color: progress === 100 ? "#22c55e" : "#b4c307",
            }}
          >
            {progress}%
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: "rgba(200,200,200,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background:
                progress === 100
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #b4c307, #d4e300)",
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-text-muted font-medium">
          <span>Paso 1</span>
          <span>Paso 2</span>
          <span>Paso 3</span>
          {progress === 100 ? (
            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> Completado</span>
          ) : (
            <span>Informe</span>
          )}
        </div>
      </div>

      {/* ──────── Timeline Steps ──────── */}
      <div className="card">
        <h2 className="text-base font-bold mb-5 flex items-center gap-2">
          <FileSignature size={18} style={{ color: "#b4c307" }} />
          Documentación Requerida
        </h2>

        <div className="relative">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {renderStep(
              1,
              "Contrato de Locación de Servicios",
              "Descarga, firma y adjunta el contrato",
              <FileSignature size={18} />,
              step1Done,
              true,
              activeService.step1_admin_doc_url,
              activeService.step1_admin_doc_name,
              activeService.step1_consultant_doc_url,
              activeService.step1_consultant_doc_name,
              "step1",
              "Aún no se ha agregado ningún documento en esta sección. El administrador debe subir el contrato primero."
            )}

            {renderStep(
              2,
              "Acuerdo de Confidencialidad",
              "Revisa, firma y sube el acuerdo firmado",
              <ShieldCheck size={18} />,
              step2Done,
              step2Unlocked,
              activeService.step2_template_url || "/assets/acuerdo-confidencialidad.pdf", // Placeholder if null
              "Acuerdo de Confidencialidad",
              activeService.step2_consultant_doc_url,
              activeService.step2_consultant_doc_name,
              "step2"
            )}

            {renderStep(
              3,
              "Confirmación de Recepción de EPPS",
              "Confirma la recepción de tus EPPS",
              <HardHat size={18} />,
              step3Done,
              step3Unlocked,
              activeService.step3_template_url || "/assets/recepcion-epps.pdf", // Placeholder if null
              "Confirmación de Recepción de EPPS",
              activeService.step3_consultant_doc_url,
              activeService.step3_consultant_doc_name,
              "step3"
            )}
          </div>
        </div>
      </div>

      {/* ──────── Post-steps: Service details (Always Visible Now) ──────── */}
      {/* Success banner (only when steps are done but audit isn't) */}
      {allStepsDone && !auditDone && (
        <div
          className="card flex items-center gap-4 animate-fade-in"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(180,195,7,0.06))",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(34,197,94,0.12)" }}
          >
            <PartyPopper size={24} className="text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-green-600">
              ¡Documentación completada!
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Todos los pasos han sido completados exitosamente. Estamos
              listos para dar inicio al servicio.
            </p>
          </div>
        </div>
      )}

      {/* Service info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service days */}
        <div className="card text-center relative overflow-hidden group">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            <CalendarDays size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
            Fechas de Servicio
          </p>
          <p className="text-sm font-bold" style={{ color: "#3b82f6" }}>
            {activeService.service_days || "—"}
          </p>
        </div>

        {/* Report deadline */}
        <div className="card text-center group">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: "rgba(234,179,8,0.1)" }}
          >
            <Clock size={20} className="text-yellow-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
            Plazo del Informe
          </p>
          <p className="text-sm font-bold">
            {fmtDate(activeService.report_deadline)}
          </p>
        </div>

        {/* Estimated payment */}
        <div className="card text-center group">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: "rgba(34,197,94,0.1)" }}
          >
            <CircleDollarSign size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
            Fecha Estimada de Pago
          </p>
          <p className="text-sm font-bold">
            {fmtDate(activeService.estimated_payment_date)}
          </p>
          <p className="text-[10px] text-text-muted mt-1">
            Sujeto al envío del informe dentro del plazo
          </p>
        </div>
      </div>

      {/* ──────── Audit Report Upload ──────── */}
      <div
        className="card relative flex flex-col transition-all duration-300"
        style={{
          border: auditDone
            ? "1px solid rgba(34,197,94,0.2)"
            : "1px solid rgba(180,195,7,0.2)",
          background: auditDone
            ? "rgba(34,197,94,0.02)"
            : undefined,
          opacity: allStepsDone ? 1 : 0.45,
        }}
      >
        <h2 className="text-base font-bold mb-1 flex items-center gap-2">
          <ClipboardCheck
            size={18}
            style={{ color: auditDone ? "#22c55e" : "#b4c307" }}
          />
          Informe de Auditoría
        </h2>

        {activeService.report_deadline && (
          <p className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
            <Clock size={12} />
            Tienes hasta el{" "}
            <strong>{fmtDate(activeService.report_deadline)}</strong> para subir
            tu informe.
          </p>
        )}

        {auditDone ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <CheckCircle2 size={16} />
              Informe enviado el{" "}
              {fmtDate(activeService.audit_report_uploaded_at)}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-surface/50 px-3 py-2 rounded-lg">
              <FileText
                size={14}
                className="text-primary flex-shrink-0"
              />
              <span className="truncate flex-1">
                {activeService.audit_report_name}
              </span>
              {activeService.audit_report_url && (
                <button
                  onClick={() =>
                    setPreviewUrl(activeService.audit_report_url)
                  }
                  className="text-primary hover:text-primary-hover transition-colors flex-shrink-0"
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <label className="block border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 group"
            style={{
               borderColor: "rgba(200,200,200,0.2)",
               cursor: allStepsDone ? "pointer" : "not-allowed",
             }}
          >
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (!allStepsDone) return;
                handleUpload(e, "audit");
              }}
              disabled={uploading === "audit" || !allStepsDone}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.zip"
            />
            {uploading === "audit" ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2
                  size={24}
                  className="animate-spin text-primary"
                />
                <span className="text-sm font-medium text-text-muted">
                  Subiendo informe...
                </span>
              </div>
            ) : !allStepsDone ? (
               <div className="flex flex-col items-center justify-center">
                 <Lock size={28} className="mx-auto mb-2 text-text-muted/50" />
                 <p className="text-sm font-semibold text-text-muted/70">
                    Completa los 3 pasos requeridos para desbloquear
                 </p>
               </div>
            ) : (
              <>
                <Upload
                  size={28}
                  className="mx-auto mb-2 text-text-muted group-hover:text-primary transition-colors"
                />
                <p className="text-sm font-semibold">
                  Adjunta aquí el informe de auditoría
                </p>
                <p className="text-xs text-text-muted mt-1">
                  PDF, Excel, imágenes o ZIP — Máx. 25MB
                </p>
              </>
            )}
          </label>
        )}
      </div>

      {/* ──────── Preview Modal ──────── */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 min-h-screen"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye size={18} className="text-primary" />
                Previsualización del Documento
              </h2>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-text-muted hover:text-danger p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-surface">
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
                title="Vista previa del documento"
              />
            </div>
          </div>
        </div>
      )}

      {/* ──────── Thank You Modal (after audit report upload) ──────── */}
      {showThankYou && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 min-h-screen"
          onClick={() => setShowThankYou(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(180,195,7,0.15))",
              }}
            >
              <PartyPopper size={36} className="text-green-500" />
            </div>
            <h2 className="text-xl font-black mb-2 text-green-600">
              ¡Gracias por enviar tu informe!
            </h2>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Tu informe de auditoría ha sido recibido correctamente. Espera a
              la fecha acordada para recibir tu pago por el servicio prestado.
            </p>
            {activeService.estimated_payment_date && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold mb-5"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#16a34a",
                }}
              >
                <CircleDollarSign size={16} />
                Pago estimado: {fmtDate(activeService.estimated_payment_date)}
              </div>
            )}
            <br />
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #b4c307, #9aab00)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
