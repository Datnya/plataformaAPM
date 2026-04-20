"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Eye,
  X,
  Upload,
  CheckCircle2,
  FileText,
  FileSignature,
  FileCheck,
  ShieldCheck,
  HardHat,
  Presentation,
  Users,
  Trash2
} from "lucide-react";

interface SpecialistData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  adhoc_service: any | null;
  training_service: any | null;
}

export default function AdminProyectosAdhoc() {
  const [data, setData] = useState<SpecialistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedUser, setSelectedUser] = useState<SpecialistData | null>(null);
  const [activeTab, setActiveTab] = useState<"adhoc" | "training">("adhoc");

  // Status Viewer Modal
  const [statusUser, setStatusUser] = useState<SpecialistData | null>(null);
  const [statusTab, setStatusTab] = useState<"adhoc" | "training">("adhoc");
  const [docToDelete, setDocToDelete] = useState<{ fieldKey: string, isTraining: boolean, arrayItemId?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for modal
  const [clientCompany, setClientCompany] = useState("");
  const [serviceDays, setServiceDays] = useState("");
  const [serviceStartDate, setServiceStartDate] = useState("");
  const [serviceEndDate, setServiceEndDate] = useState("");
  const [estimatedPaymentDate, setEstimatedPaymentDate] = useState("");
  const [reportDeadline, setReportDeadline] = useState(""); // Only adhoc
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchEspecialistas = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/especialistas");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);

      // Also refresh selected modals if open
      if (selectedUser) {
        const updated = json.find((d: SpecialistData) => d.user.id === selectedUser.user.id);
        if (updated) setSelectedUser(updated);
      }
      if (statusUser) {
        const updated = json.find((d: SpecialistData) => d.user.id === statusUser.user.id);
        if (updated) setStatusUser(updated);
      }
    } catch (err: any) {
      if (!silent) setErrorMsg(err.message || "Error al cargar datos");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspecialistas();
    const interval = setInterval(() => fetchEspecialistas(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (item: SpecialistData) => {
    setSelectedUser(item);
    setActiveTab("adhoc");
    loadFormState(item, "adhoc");
  };

  const loadFormState = (item: SpecialistData, tab: "adhoc" | "training") => {
    const svc = tab === "adhoc" ? item.adhoc_service : item.training_service;
    setClientCompany(svc?.client_company || "");
    setServiceDays(svc?.service_days || "");
    setServiceStartDate(svc?.service_start_date ? new Date(svc.service_start_date).toISOString().split("T")[0] : "");
    setServiceEndDate(svc?.service_end_date ? new Date(svc.service_end_date).toISOString().split("T")[0] : "");
    setEstimatedPaymentDate(svc?.estimated_payment_date ? new Date(svc.estimated_payment_date).toISOString().split("T")[0] : "");
    if (tab === "adhoc") {
      setReportDeadline(svc?.report_deadline ? new Date(svc.report_deadline).toISOString().split("T")[0] : "");
    }
  };

  const handleTabSwitch = (tab: "adhoc" | "training") => {
    setActiveTab(tab);
    if (selectedUser) loadFormState(selectedUser, tab);
  };

  const handleCloseStatusModal = () => {
    setStatusUser(null);
  };

  const requestDeleteDoc = (fieldKey: string, isTraining: boolean, arrayItemId?: string) => {
    setDocToDelete({ fieldKey, isTraining, arrayItemId });
  };

  const confirmDeleteDoc = async () => {
    if (!statusUser || !docToDelete) return;
    const { fieldKey, isTraining, arrayItemId } = docToDelete;
    const svc = isTraining ? statusUser.training_service : statusUser.adhoc_service;
    if (!svc) return;

    setIsDeleting(true);
    try {
      const endpoint = isTraining ? "/api/training-services" : "/api/adhoc-services";
      
      let updates: Record<string, any> = {};
      if (arrayItemId && fieldKey === "presentations") {
        updates.presentations = svc.presentations.filter((p: any) => p.id !== arrayItemId);
        if (updates.presentations.length === 0) updates.step4CompletedAt = null;
      } else if (arrayItemId && fieldKey === "sessions") {
         updates.sessions = svc.sessions.map((s: any) => {
           if (s.id === arrayItemId) return { ...s, attendanceDocUrl: null, attendanceDocName: null };
           return s;
         });
         const allDone = updates.sessions.length > 0 && updates.sessions.every((x: any) => !!x.attendanceDocUrl);
         if (!allDone) updates.step5CompletedAt = null;
      } else {
        if (fieldKey === "step1") updates = { step1ConsultantDocUrl: null, step1ConsultantDocName: null, step1CompletedAt: null };
        if (fieldKey === "step2") updates = { step2ConsultantDocUrl: null, step2ConsultantDocName: null, step2CompletedAt: null };
        if (fieldKey === "step3") updates = { step3ConsultantDocUrl: null, step3ConsultantDocName: null, step3CompletedAt: null };
        if (fieldKey === "audit") updates = { auditReportUrl: null, auditReportName: null, auditReportUploadedAt: null };
      }

      const patchRes = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: svc.id, updates }),
      });
      if (!patchRes.ok) throw new Error("Error al eliminar documento");
      
      const resData = await patchRes.json();
      
      setStatusUser(prev => prev ? {
        ...prev,
        [isTraining ? "training_service" : "adhoc_service"]: resData.service || resData
      } : null);
      
      fetchEspecialistas(true);
      setDocToDelete(null);
    } catch (e) {
      alert("Error al intentar eliminar el documento. Es posible que no se hayan aplicado los cambios.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveData = async () => {
    if (!selectedUser) return;
    setSavingSettings(true);
    setErrorMsg("");

    const svcPrefix = activeTab === "adhoc" ? "adhoc_service" : "training_service";
    const endpoint = activeTab === "adhoc" ? "/api/adhoc-services" : "/api/training-services";
    const existingSvc = selectedUser[svcPrefix];

    try {
      // If service doesnt exist, POST to create it. Else PATCH.
      const payload: any = {
        consultantId: selectedUser.user.id,
        serviceId: existingSvc?.id, // ignored in POST, used in PATCH
        clientCompany,
        serviceDays,
        serviceStartDate: serviceStartDate || null,
        serviceEndDate: serviceEndDate || null,
        estimatedPaymentDate: estimatedPaymentDate || null,
        // For unified PATCH body mapping:
        updates: {
          clientCompany,
          serviceDays,
          serviceStartDate: serviceStartDate || null,
          serviceEndDate: serviceEndDate || null,
          estimatedPaymentDate: estimatedPaymentDate || null,
        } as any,
      };

      if (activeTab === "adhoc") {
        payload.reportDeadline = reportDeadline || null;
        payload.updates.reportDeadline = reportDeadline || null;
      }

      let res;
      if (!existingSvc) {
        // Need to create one
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      // Refresh locally
      const updatedItem = { ...selectedUser, [svcPrefix]: resData.service };
      setSelectedUser(updatedItem);
      setData((prev) => prev.map((p) => (p.user.id === updatedItem.user.id ? updatedItem : p)));
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUploadContract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    setUploadingDoc(true);
    setErrorMsg("");

    const svcPrefix = activeTab === "adhoc" ? "adhoc_service" : "training_service";
    const endpoint = activeTab === "adhoc" ? "/api/adhoc-services" : "/api/training-services";
    const existingSvc = selectedUser[svcPrefix];

    try {
      if (!existingSvc) {
        throw new Error("Guarda los datos del proyecto primero antes de subir el contrato.");
      }

      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: existingSvc.id,
          updates: {
            step1AdminDocUrl: uploadData.url,
            step1AdminDocName: file.name,
          },
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      // Successfully updated
      const updatedItem = { ...selectedUser, [svcPrefix]: resData.service };
      setSelectedUser(updatedItem);
      setData((prev) => prev.map((p) => (p.user.id === updatedItem.user.id ? updatedItem : p)));

    } catch (err: any) {
      setErrorMsg(err.message || "Error al subir el documento");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-primary" />
          Proyectos Ad-Hoc y Capacitación
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Gestiona los clientes, los tiempos y los contratos base para los Especialistas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => {
          // Calculate an active company name from either service if possible
          const comp1 = item.adhoc_service?.client_company;
          const comp2 = item.training_service?.client_company;
          const labelCompany = comp1 || comp2 || "Sin asignar";

          const days1 = item.adhoc_service?.service_days || "";
          const days2 = item.training_service?.service_days || "";
          const totalDays = days1 || days2;

          let adhocProg = 0;
          if (item.adhoc_service) {
            let steps = 0;
            if (item.adhoc_service.step1_completed_at) steps++;
            if (item.adhoc_service.step2_completed_at) steps++;
            if (item.adhoc_service.step3_completed_at) steps++;
            if (item.adhoc_service.audit_report_uploaded_at) steps++;
            adhocProg = Math.round((steps / 4) * 100);
          }

          let trainProg = 0;
          if (item.training_service) {
            let steps = 0;
            if (item.training_service.step1_completed_at) steps++;
            if (item.training_service.step2_completed_at) steps++;
            if (item.training_service.step3_completed_at) steps++;
            if (item.training_service.step4_completed_at) steps++;
            if (item.training_service.step5_completed_at) steps++;
            trainProg = Math.round((steps / 5) * 100);
          }

          const progress = Math.max(adhocProg, trainProg);
          
          const radius = 45;
          const stroke = 8;
          const normalizedRadius = radius - stroke; // 37
          const circumference = normalizedRadius * 2 * Math.PI;
          const strokeDashoffset = Math.max(0, circumference - (progress / 100) * circumference);

          return (
            <div key={item.user.id} className="card flex flex-col justify-between group hover:border-primary/40 transition-colors relative min-h-[220px] overflow-hidden">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-inner">
                      {item.user.name.charAt(0)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface border border-border text-text-muted uppercase tracking-wider relative z-10">
                    Especialista
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 pr-[90px] break-words line-clamp-2">{item.user.name}</h3>
                <p className="text-xs text-text-muted mb-4 pr-[90px] break-all line-clamp-1">{item.user.email}</p>

                <div className="space-y-2 mb-6 max-w-[65%]">
                  <div className="flex items-center gap-2 text-xs font-medium bg-surface py-1.5 px-3 rounded-lg border border-border/50">
                    <Building size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate text-text-light">{labelCompany}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium bg-surface py-1.5 px-3 rounded-lg border border-border/50">
                    <Clock size={14} className="text-primary flex-shrink-0" />
                    <span className="text-text-light line-clamp-1 break-all">{totalDays ? totalDays : "Sin fechas definidas"}</span>
                  </div>
                </div>

                {/* Big Progress Pie Chart */}
                <div className="absolute right-4 top-12 flex flex-col items-center pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="relative h-[100px] w-[100px] flex items-center justify-center" title={`${progress}% completado`}>
                    <svg height="100" width="100" className="-rotate-90 transform drop-shadow-sm">
                      <circle stroke="rgba(200,200,200,0.2)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx="50" cy="50" />
                      <circle stroke="#b4c307" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + " " + circumference} style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }} strokeLinecap="round" r={normalizedRadius} cx="50" cy="50" />
                    </svg>
                    <span className="absolute text-xl font-black text-text-light">{progress}%</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted mt-1">Avance</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={() => openModal(item)}
                  className="w-full flex justify-center items-center gap-2 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground py-2.5 rounded-xl transition-all duration-300"
                >
                  <Eye size={16} /> Ver más detalles
                </button>
                <button
                  onClick={() => { setStatusUser(item); setStatusTab("adhoc"); }}
                  className="w-full flex justify-center items-center gap-2 text-sm font-semibold bg-surface border border-border text-text hover:bg-border/50 py-2.5 rounded-xl transition-all duration-300"
                >
                  <FileCheck size={16} /> Visualizar estatus de servicio
                </button>
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-muted bg-surface rounded-xl border border-dashed border-border">
            <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
            <p>No hay Especialistas registrados en la plataforma.</p>
          </div>
        )}
      </div>

      {/* Modal Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-[9998] flex min-h-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-background w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-border">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Gestión del Especialista
                </h2>
                <p className="text-xs text-text-muted mt-1">{selectedUser.user.name} - {selectedUser.user.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-surface text-text-muted transition-colors"><X size={20} /></button>
            </div>

            <div className="flex px-5 border-b border-border bg-surface/30">
              <button
                onClick={() => handleTabSwitch("adhoc")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "adhoc" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"}`}
              >
                Servicio Auditor (Ad-Hoc)
              </button>
              <button
                onClick={() => handleTabSwitch("training")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "training" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"}`}
              >
                Servicio de Capacitación
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-sm font-semibold p-3 rounded-lg flex items-center justify-between">
                  {errorMsg}
                  <button onClick={() => setErrorMsg("")}><X size={14}/></button>
                </div>
              )}

              {/* General Project Config */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Datos Básicos del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Nombre Empresa Cliente</label>
                    <input type="text" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary disabled:opacity-50" placeholder="Ej. Logra" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Fechas de Servicio</label>
                    <input type="text" value={serviceDays} onChange={(e) => setServiceDays(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary" placeholder="Ej. 10, 12 y 13 de Mayo del 2026" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Fecha de Inicio</label>
                    <div className="relative">
                      <input type="date" value={serviceStartDate} onChange={(e) => setServiceStartDate(e.target.value)} className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary" />
                      <Calendar size={14} className="absolute left-3 top-2.5 text-text-muted" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Fecha de Fin</label>
                    <div className="relative">
                      <input type="date" value={serviceEndDate} onChange={(e) => setServiceEndDate(e.target.value)} className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary" />
                      <Calendar size={14} className="absolute left-3 top-2.5 text-text-muted" />
                    </div>
                  </div>
                  {activeTab === "adhoc" && (
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1">Fecha Limite de Informe</label>
                      <div className="relative">
                        <input type="date" value={reportDeadline} onChange={(e) => setReportDeadline(e.target.value)} className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary" />
                        <Calendar size={14} className="absolute left-3 top-2.5 text-text-muted" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Fecha Estimada de Pago</label>
                    <div className="relative">
                      <input type="date" value={estimatedPaymentDate} onChange={(e) => setEstimatedPaymentDate(e.target.value)} className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary" />
                      <Calendar size={14} className="absolute left-3 top-2.5 text-text-muted" />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSaveData}
                  disabled={savingSettings}
                  className="w-full md:w-auto bg-primary text-primary-foreground text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {savingSettings && <Loader2 size={16} className="animate-spin" />}
                  {savingSettings ? "Guardando..." : "Guardar Datos del Proyecto"}
                </button>
              </div>

              <hr className="border-border" />

              {/* Upload Contract */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Contrato de Locación de Servicios (Paso 1)</h3>
                <p className="text-xs text-text-muted">
                  Sube el documento base del proyecto aquí para que el Especialista lo descargue en su Paso 1 y lo firme.
                </p>
                <div className="bg-surface border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors group">
                  {(() => {
                    const svc = activeTab === "adhoc" ? selectedUser.adhoc_service : selectedUser.training_service;
                    const docName = svc?.step1_admin_doc_name;
                    const docUrl = svc?.step1_admin_doc_url;

                    if (docName && docUrl) {
                      return (
                         <div className="flex flex-col items-center justify-center gap-3">
                           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                             <CheckCircle2 size={24} />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-text-light">Documento cargado correctamente</p>
                             <a href={docUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline mt-1">
                               <FileText size={14} /> {docName}
                             </a>
                           </div>
                           <label className="text-xs mt-2 px-4 py-1.5 bg-background border border-border rounded-full cursor-pointer hover:bg-surface font-semibold">
                              <input type="file" className="hidden" onChange={handleUploadContract} />
                              Reemplazar Documento
                           </label>
                         </div>
                      );
                    }

                    return (
                      <label className="cursor-pointer block w-full h-full">
                        <input type="file" className="hidden" onChange={handleUploadContract} disabled={uploadingDoc} />
                        {uploadingDoc ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                             <Loader2 size={24} className="animate-spin text-primary" />
                             <span className="text-xs font-semibold">Subiendo documento...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                             <Upload size={28} className="text-text-muted group-hover:text-primary transition-colors" />
                             <span className="text-sm font-semibold text-text-light group-hover:text-primary transition-colors">Seleccionar Archivo</span>
                          </div>
                        )}
                      </label>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* Status Viewer Modal */}
      {statusUser && (
        <div className="fixed inset-0 z-[9998] flex min-h-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setStatusUser(null)}>
          <div className="bg-background w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-border">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Estatus de Servicio
                </h2>
                <p className="text-xs text-text-muted mt-1">{statusUser.user.name}</p>
              </div>
              <button onClick={() => setStatusUser(null)} className="p-2 rounded-full hover:bg-surface text-text-muted transition-colors"><X size={20} /></button>
            </div>

            <div className="flex px-5 border-b border-border bg-surface/30">
              <button
                onClick={() => setStatusTab("adhoc")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${statusTab === "adhoc" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"}`}
              >
                Auditoría (Ad-Hoc)
              </button>
              <button
                onClick={() => setStatusTab("training")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${statusTab === "training" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"}`}
              >
                Capacitación
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const svc = statusTab === "adhoc" ? statusUser.adhoc_service : statusUser.training_service;

                if (!svc) {
                  return <div className="text-center py-12 text-text-muted border-2 border-dashed border-border rounded-xl">El servicio no ha sido asignado/iniciado. Asigna los días de duración en "Ver más detalles" primero.</div>;
                }

                // Helper to render a document box
                const renderDoc = (title: string, icon: React.ReactNode, name: string | null, url: string | null, fieldKey: string, isTraining = false) => (
                  <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between gap-4 h-full">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-light">{title}</h4>
                        <p className="text-xs text-text-muted mt-1 break-words whitespace-normal leading-relaxed">
                          {name ? `Subido: ${name}` : "Pendiente de subida por el especialista"}
                        </p>
                      </div>
                    </div>
                    {url && (
                      <div className="flex items-center gap-2 justify-end mt-auto pt-2 border-t border-border/50">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="bg-background border border-border px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5 focus:outline-none">
                          <Eye size={14} /> Ver Doc
                        </a>
                        <button onClick={() => requestDeleteDoc(fieldKey, isTraining)} className="bg-danger/10 border border-danger/20 px-3 py-1.5 rounded-lg text-xs font-bold text-danger hover:bg-danger hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none" title="Eliminar para resubir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );

                const isTraining = statusTab === "training";

                return (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">Documentación Base</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderDoc("Locación de Servicios (Paso 1)", <FileSignature size={18}/>, svc.step1_consultant_doc_name, svc.step1_consultant_doc_url, "step1", isTraining)}
                        {renderDoc("Acuerdo de Confidencialidad", <ShieldCheck size={18}/>, svc.step2_consultant_doc_name, svc.step2_consultant_doc_url, "step2", isTraining)}
                        {renderDoc("Recepción de EPPS", <HardHat size={18}/>, svc.step3_consultant_doc_name, svc.step3_consultant_doc_url, "step3", isTraining)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">
                        {statusTab === "adhoc" ? "Entregables de Auditoría" : "Entregables de Capacitación"}
                      </h3>
                      <div className="bg-surface/50 border border-border/50 rounded-xl p-5">
                        {statusTab === "adhoc" ? (
                          <div className="space-y-4">
                            {renderDoc("Informe de Auditoría", <FileText size={18}/>, svc.audit_report_name, svc.audit_report_url, "audit", false)}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PPTs */}
                            <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3">
                                <Presentation size={16} /> Presentaciones PPT
                              </h4>
                              {Array.isArray(svc.presentations) && svc.presentations.length > 0 ? (
                                <div className="space-y-2">
                                  {svc.presentations.map((p: any) => (
                                    <div key={p.id} className="bg-background border border-border rounded-lg p-3 flex justify-between items-center text-xs">
                                      <span className="truncate flex-1 font-medium select-all" title={p.name}>{p.name}</span>
                                        <div className="flex items-center gap-2">
                                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Ver</a>
                                          <button onClick={() => requestDeleteDoc("presentations", true, p.id)} className="text-danger hover:text-danger-active transition-colors p-1" title="Eliminar presentación">
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-xs text-text-muted italic">Sin presentaciones subidas.</p>}
                            </div>
                            
                            {/* Sessions & Attendance */}
                            <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold text-green-600 mb-3">
                                <Users size={16} /> Asistencia por Sesión
                              </h4>
                              {Array.isArray(svc.sessions) && svc.sessions.length > 0 ? (
                                <div className="space-y-2">
                                  {svc.sessions.map((sess: any, idx: number) => (
                                    <div key={sess.id} className="bg-background border border-border rounded-lg p-3 text-xs">
                                      <div className="font-bold text-text-light mb-1">Sesión {idx + 1}</div>
                                      <div className="flex justify-between items-center text-text-muted">
                                        <span>Fecha: {new Date(sess.dateCompleted).toLocaleDateString()}</span>
                                        {sess.attendanceDocUrl ? (
                                          <div className="flex items-center gap-2">
                                            <a href={sess.attendanceDocUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold flex items-center gap-1">
                                              <FileText size={12}/> Ficha PDF
                                            </a>
                                            <button onClick={() => requestDeleteDoc("sessions", true, sess.id)} className="text-danger hover:text-danger-active transition-colors p-1" title="Eliminar ficha de asistencia">
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-warning text-[10px] uppercase font-bold">Falta ficha</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-xs text-text-muted italic">Sin sesiones registradas.</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setDocToDelete(null)}>
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 animate-scale-in text-center shadow-2xl border border-border flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-text-light">¿Estás seguro de borrar este documento?</h3>
            <p className="text-sm text-text-muted mb-6">El documento se eliminará permanentemente para que el especialista tenga la oportunidad de volver a subirlo.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setDocToDelete(null)}
                className="flex-1 bg-background border border-border py-2.5 rounded-xl font-bold text-text-light hover:bg-background-hover transition-colors focus:outline-none"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteDoc}
                className="flex-1 bg-danger text-white py-2.5 rounded-xl font-bold hover:bg-danger-hover transition-colors focus:outline-none flex justify-center items-center h-[46px]"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin text-white" /> : "Sí, borrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
