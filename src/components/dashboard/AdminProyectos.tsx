"use client";

import { useEffect, useState } from "react";
import {
  Trash2, 
  Edit2, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Download,
  Eye,
  X,
  Building2,
  Mail,
  Target,
  Award,
  FileDown
} from "lucide-react";

const statusColors: any = {
  PENDIENTE: "bg-surface text-text-muted border-border",
  EN_PROCESO: "bg-info/10 text-info border-info/20",
  REVISION: "bg-warning/10 text-warning border-warning/20",
  COMPLETADO: "bg-success/10 text-success border-success/30"
};

export default function AdminProyectos() {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // List View states
  const [view, setView] = useState<"list" | "detail">("list");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [msg, setMsg] = useState({ text: "", type: "" });

  // Detail View states
  const [detailProject, setDetailProject] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Certificates Modal states
  const [selectedCourseCerts, setSelectedCourseCerts] = useState<any[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  // Debug state for production errors
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  // Detail Goals states
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalDesc, setGoalDesc] = useState("");
  const [goalType, setGoalType] = useState("SEMANAL");
  const [goalDueDate, setGoalDueDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, usersRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/admin/users")
      ]);
      const projData = await projRes.json();
      const usersData = await usersRes.json();
      
      if (!Array.isArray(projData)) console.error("Projects API error:", projData);
      if (!Array.isArray(usersData)) console.error("Users API error:", usersData);

      setProjects(Array.isArray(projData) ? projData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setFetchError(null);
    } catch (e: any) {
      console.error("Fetch API error:", e);
      setFetchError(e.message || JSON.stringify(e));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openList = () => {
    setView("list");
    setDetailProject(null);
    fetchData(); // Refresh list to get updated goals logic if needed
  };

  const openDetail = async (projectId: string, consId: string | undefined) => {
    setDetailLoading(true);
    setView("detail");
    try {
      // Fetch full project, reports, and certificates
      const [pRes, rRes, cRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        consId ? fetch(`/api/consultant/reports?consultantId=${consId}&projectId=${projectId}`) : Promise.resolve({ json: () => ({ reports: [] }) }),
        fetch(`/api/projects/${projectId}/certificates`)
      ]);

      const pData = await pRes.json();
      const rData = await rRes.json();
      const cData = await cRes.json();

      if (pData.error) {
         setFetchError(pData.error);
         setDetailProject(null);
      } else {
         setFetchError(null);
         setDetailProject(pData);
      }
      setReports(rData.reports || []);
      setCertificates(Array.isArray(cData) ? cData : []);
      
    } catch (error: any) {
       console.error(error);
       setFetchError(error.message || JSON.stringify(error));
    }
    setDetailLoading(false);
  };

  const handleDeleteCourseCerts = async (courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Seguro que deseas eliminar el grupo "${courseTitle}" y TODOS los certificados PDF asociados? Esta acción borrará los registros y los archivos del servidor.`)) return;

    setDeletingGroup(courseTitle);
    try {
      const res = await fetch(`/api/projects/${detailProject.id}/certificates?courseTitle=${encodeURIComponent(courseTitle)}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        // Remove mathematically from current state
        setCertificates(prev => prev.filter(c => c.course_title !== courseTitle));
      } else {
        const body = await res.json();
        alert(`Error: ${body.error || "Algo falló al intentar borrar"}`);
      }
    } catch (err) {
      alert("Error de conexión");
    }
    setDeletingGroup(null);
  };

  // -------------------------------------------------------------------------------------------------------------------------
  // LIST VIEW HANDLERS
  // -------------------------------------------------------------------------------------------------------------------------
  const handleClientToggle = (id: string) => {
    if (clientIds.includes(id)) {
      setClientIds(clientIds.filter(c => c !== id));
    } else {
      if (clientIds.length >= 3) {
        alert("Solo puedes seleccionar hasta 3 clientes por proyecto.");
        return;
      }
      setClientIds([...clientIds, id]);
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setConsultantId(p.consultant?.id || p.consultantId || "");
    setClientIds(p.clientUsers?.map((c: any) => c.id) || []);
    setShowEdit(true);
    setMsg({ text: "", type: "" });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirmId(null);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Error al eliminar");
      }
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !consultantId || clientIds.length === 0) {
      setMsg({ text: "Completa el nombre, selecciona 1 consultor y al menos 1 cliente.", type: "error" });
      return;
    }
    setSaving(true);
    setMsg({ text: "Guardando...", type: "info" });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, consultantId, clientUserIds: clientIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowAdd(false);
      setName("");
      setConsultantId("");
      setClientIds([]);
      setMsg({ text: "", type: "" });
      fetchData();
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !consultantId || !editingId) return;
    setSaving(true);
    setMsg({ text: "Guardando...", type: "info" });
    try {
      const res = await fetch(`/api/projects/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, consultantId, clientUserIds: clientIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowEdit(false);
      setName("");
      setConsultantId("");
      setClientIds([]);
      setMsg({ text: "", type: "" });
      fetchData();
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------------------------------------------------------
  // DETAIL VIEW HANDLERS (GOALS)
  // -------------------------------------------------------------------------------------------------------------------------
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDesc || !detailProject) return;
    setSaving(true);
    try {
      await fetch("/api/admin/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId: detailProject.id, 
          description: goalDesc, 
          type: goalType, 
          dueDate: goalDueDate 
        })
      });
      setShowAddGoal(false);
      setGoalDesc("");
      setGoalDueDate("");
      await openDetail(detailProject.id, detailProject.consultantId);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDeleteGoal = async (id: string) => {
    // Only inline confirmation
    try {
       await fetch(`/api/admin/goals/${id}`, { method: "DELETE" });
       await openDetail(detailProject.id, detailProject.consultantId);
    } catch (e) { console.error(e); }
  };

  const parseJsonStr = (val?: string) => {
    if (!val) return ["", ""];
    try {
       const parsed = JSON.parse(val);
       if (Array.isArray(parsed)) return parsed;
       return ["", ""];
    } catch {
       return ["", ""];
    }
  };

  const availableConsultants = users.filter(u => u.role === "CONSULTOR" && u.status === "ACTIVO");
  const availableClients = users.filter(u => u.role === "CLIENTE" && u.status === "ACTIVO");

  const downloadZip = async () => {
    if(selectedCourseCerts.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const { saveAs } = (await import("file-saver")).default || await import("file-saver");
    const zip = new JSZip();
    
    const courseName = selectedCourseCerts[0]?.course_title || "Certificados";
    const folderName = `Certificados - ${courseName}`;
    const folder = zip.folder(folderName) ?? zip;

    // Fetch and add each PDF to the ZIP
    await Promise.all(selectedCourseCerts.map(async (c) => {
       try {
         const res = await fetch(c.pdf_url);
         const blob = await res.blob();
         folder.file(`${c.participant_name} - ${c.participant_code || c.access_key}.pdf`, blob);
       } catch(err) { console.error("Error downloading PDF for zip:", err); }
    }));

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folderName}.zip`);
  };

  if (view === "detail") {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center p-16 text-text-muted gap-3 animate-fade-in">
           <Loader2 size={24} className="animate-spin" /> Cargando detalle del proyecto...
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className="p-6">
          <button onClick={openList} className="flex items-center text-text-muted hover:text-brand mb-6 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Error de conexión con Base de Datos o API</h3>
            <p className="font-mono text-sm whitespace-pre-wrap">{fetchError}</p>
            <p className="mt-4 text-xs opacity-80">
              Vercel deploy check:
              1. ¿Están configuradas las variables de entorno de Supabase? (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
              2. ¿Se ejecutó el prisma generate?
              3. ¿Existe timeout de Vercel (10s)?
            </p>
          </div>
        </div>
      );
    }

    if (!detailProject) {
      return (
        <div className="flex flex-col items-center justify-center p-16 text-text-muted gap-4 animate-fade-in">
           <p className="text-danger font-bold text-xl">Error Fatal</p>
           <p className="text-sm">El proyecto dejó de cargar sin error explícito.</p>
           <button onClick={openList} className="btn-secondary px-4 py-2 mt-4 text-sm flex items-center gap-2">
             <ArrowLeft size={16}/> Volver al listado
           </button>
        </div>
      );
    }

    const goals = detailProject.goals || [];
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g: any) => g.status === "COMPLETADO").length;
    const projectPct = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

    const timeLogs = detailProject.timeLogs || [];
    let totalHours = 0;
    timeLogs.forEach((log: any) => {
      if (log.checkInTime && log.checkOutTime) {
        const diff = new Date(log.checkOutTime).getTime() - new Date(log.checkInTime).getTime();
        totalHours += diff / (1000 * 60 * 60);
      }
    });

    const groupedCerts = certificates.reduce((acc, cert) => {
      const title = cert.course_title || "Certificado General";
      if (!acc[title]) acc[title] = [];
      acc[title].push(cert);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div className="space-y-6 animate-fade-in relative z-0">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-4">
            <button onClick={openList} className="w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center hover:bg-surface transition-colors shadow-sm">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{detailProject.name}</h1>
              <p className="text-sm font-semibold text-info mt-1">Consultor: {detailProject.consultant?.name || "No asignado"}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-sm font-semibold text-text-muted mb-1">Total Horas Trabajadas</p>
              <div className="flex justify-end items-center gap-2 text-info">
                 <Clock size={18} />
                 <span className="text-xl font-black">{totalHours.toFixed(1)}h</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-text-muted mb-1">Avance Global del Consultor</p>
              <div className="flex gap-3 items-center">
                 <div className="w-48 h-2.5 bg-surface rounded-full overflow-hidden border border-border-light shadow-inner">
                   <div className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700" style={{ width: `${projectPct}%` }} />
                 </div>
                 <span className="text-xl font-black text-primary">{projectPct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card w-full mb-6">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-primary" /> Usuarios de Clientes Vinculados
          </h2>
          {(!detailProject.clientUsers || detailProject.clientUsers.length === 0) ? (
            <p className="text-xs text-text-muted">No hay clientes vinculados a este proyecto.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {detailProject.clientUsers.map((cu: any) => (
                <div key={cu.id} className="flex items-center gap-2 text-sm bg-surface/50 border border-border rounded-lg px-3 py-2">
                  <div className="w-8 h-8 rounded bg-success/10 flex items-center justify-center text-success">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="font-bold leading-none">{cu.name}</p>
                    <a href={`mailto:${cu.email}`} className="text-[10px] text-text-muted hover:text-primary flex items-center gap-1 mt-1 transition-colors">
                      <Mail size={10} /> {cu.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
           
           {/* GOALS */}
           <div className="card space-y-4">
             <div className="flex justify-between items-center bg-surface/30 p-2 rounded">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                   <Target size={20} className="text-primary" /> Objetivos del Consultor
                 </h2>
                 <button onClick={() => setShowAddGoal(true)} className="btn-primary py-1.5 px-3 text-xs">
                    + Asignar
                 </button>
             </div>
             {goals.length === 0 ? (
               <div className="p-8 text-center text-text-muted border border-border border-dashed rounded-xl">
                 No hay objetivos asignados para este proyecto.
               </div>
             ) : (
               <div className="space-y-3">
                 {goals.map((goal: any) => (
                   <div key={goal.id} className="relative bg-white border border-border rounded-xl p-4 shadow-sm group hover:border-primary/30 transition-colors">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-xl opacity-70" />
                     <div className="pl-3">
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-sm text-foreground pr-6 leading-snug">{goal.description}</h4>
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border whitespace-nowrap ${statusColors[goal.status] || "bg-surface"}`}>
                           {goal.status}
                         </span>
                       </div>
                       <div className="flex gap-4 mt-3">
                         <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                           {goal.type === "SEMANAL" ? "📅 Semanal" : "📆 Mensual"}
                         </span>
                         {goal.dueDate && (
                           <span className="text-xs font-semibold text-info flex items-center gap-1">
                             <Clock size={12}/> Vence: {new Date(goal.dueDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                           </span>
                         )}
                       </div>
                     </div>
                     <button 
                       onClick={() => handleDeleteGoal(goal.id)}
                       className="absolute bottom-3 right-3 p-1.5 text-danger bg-danger/5 hover:bg-danger hover:text-white rounded transition-colors"
                       title="Eliminar este objetivo"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>

           <div className="space-y-6">
             {/* REPORTS */}
             <div className="card space-y-4">
               <h2 className="text-lg font-bold flex items-center gap-2">
                 <FileText size={20} className="text-primary" /> Panel de Informes
               </h2>
               {reports.length === 0 ? (
                 <div className="text-center p-6 text-text-muted bg-surface/50 rounded-lg">No hay informes cargados de este consultor.</div>
               ) : (
                 <div className="grid grid-cols-1 gap-3">
                   {reports.map((rep: any) => (
                     <div key={rep.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface/30 hover:bg-surface transition-colors">
                       <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                         <FileText size={18} className="text-primary" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="font-bold text-sm truncate" title={rep.name}>{rep.name}</p>
                         <p className="text-[10px] text-text-muted mt-0.5">{rep.date} • {rep.type}</p>
                       </div>
                       <div className="flex flex-col gap-1">
                         <button onClick={() => setPreviewUrl(rep.url)} className="text-[10px] font-bold px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary-hover rounded flex items-center gap-1 justify-center">
                           <Eye size={12}/> Ver
                         </button>
                         <a href={rep.url} download className="text-[10px] font-bold px-2 py-1 bg-info/10 hover:bg-info/20 text-info rounded flex items-center gap-1 justify-center">
                           <Download size={12}/> Bajar
                         </a>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* CERTIFICATES */}
             <div className="card space-y-4">
               <h2 className="text-lg font-bold flex items-center gap-2">
                 <Award size={20} className="text-primary" /> Certificados Generados
               </h2>
               {Object.keys(groupedCerts).length === 0 ? (
                 <div className="text-center p-6 text-text-muted bg-surface/50 border border-border border-dashed rounded-xl">
                   Aún no hay certificados subidos para este proyecto.
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-3">
                   {Object.entries(groupedCerts).map(([title, certs]: [string, any]) => (
                     <div key={title} 
                          onClick={() => { setSelectedCourseCerts(certs); setShowCertModal(true); }}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface/30 hover:bg-surface transition-colors cursor-pointer group shadow-sm">
                       <div className="flex items-center gap-3 min-w-0">
                         <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center flex-shrink-0 text-success">
                           <Award size={18} />
                         </div>
                         <div className="min-w-0">
                           <p className="font-bold text-sm truncate text-foreground group-hover:text-success transition-colors" title={title}>{title}</p>
                           <p className="text-[10px] text-text-muted mt-0.5">{certs.length} emitido{certs.length !== 1 ? 's' : ''}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button className="text-[10px] font-bold px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                           <Eye size={12}/> Ver Lista
                         </button>
                         <button 
                           title="Eliminar este grupo"
                           onClick={(e) => handleDeleteCourseCerts(title, e)} 
                           disabled={deletingGroup === title}
                           className="text-[10px] items-center gap-1 px-2.5 py-1.5 font-bold rounded flex opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-danger/10 hover:bg-danger text-danger hover:text-white disabled:opacity-50"
                         >
                           {deletingGroup === title ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12}/>} Borrar
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* TIME LOGS READONLY */}
        <div className="card mt-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" /> Panel de Jornadas Registradas (Solo lectura)
          </h2>
          {timeLogs.length === 0 ? (
            <div className="p-8 text-center text-text-muted border border-border border-dashed rounded-xl">
               No hay jornadas para este proyecto.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface/70">
                    <th className="text-left font-semibold text-text-muted py-3 px-4 text-xs">Fecha (A-Z)</th>
                    <th className="text-left font-semibold text-text-muted py-3 px-4 text-xs">Modalidad</th>
                    <th className="text-center font-semibold text-text-muted py-3 px-4 text-xs">Entrada</th>
                    <th className="text-center font-semibold text-text-muted py-3 px-4 text-xs">Salida</th>
                    <th className="text-left font-semibold text-text-muted py-3 px-4 text-xs">Evidencia (Áreas/Personas)</th>
                    <th className="text-left font-semibold text-text-muted py-3 px-4 text-xs">Nota del Consultor</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLogs.map((log: any) => {
                    const checkIn = new Date(log.checkInTime);
                    const checkOut = log.checkOutTime ? new Date(log.checkOutTime) : null;
                    const logDate = checkIn.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
                    
                    const areasVisited = parseJsonStr(log.areasVisited);
                    const peopleMet = parseJsonStr(log.peopleMet);

                    return (
                      <tr key={log.id} className="border-t border-border-light hover:bg-surface/30">
                        <td className="py-3 px-4 font-bold text-primary-hover">{logDate}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold uppercase bg-surface px-2 py-1 rounded border border-border">
                            {log.modality}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-primary">{checkIn.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="py-3 px-4 text-center font-bold">{checkOut ? checkOut.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1.5">
                             {areasVisited.map((a: string, idx: number) => a && (
                               <div key={`a-${idx}`} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                                  <MapPin size={12} className="text-info" /> {a}
                               </div>
                             ))}
                             {peopleMet.map((p: string, idx: number) => p && (
                               <div key={`p-${idx}`} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                                  <Users size={12} className="text-success" /> {p}
                               </div>
                             ))}
                             {areasVisited.every((x:string)=>!x) && peopleMet.every((x:string)=>!x) && <span className="text-text-light text-xs italic">Sin evidencia ingresada</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-text-muted max-w-xs truncate" title={log.description}>
                          {log.description || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: ADD GOAL */}
        {showAddGoal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddGoal(false)}>
             <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Asignar Nuevo Objetivo</h2>
                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Descripción de la Meta</label>
                    <input required type="text" className="input-field" placeholder="Ej: Realizar diagnóstico interno" value={goalDesc} onChange={e=>setGoalDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Tipo de Objetivo</label>
                    <select className="input-field" value={goalType} onChange={e=>setGoalType(e.target.value)}>
                      <option value="SEMANAL">Semanal</option>
                      <option value="MENSUAL">Mensual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Fecha de Vencimiento</label>
                    <input required type="date" className="input-field" value={goalDueDate} onChange={e=>setGoalDueDate(e.target.value)} />
                  </div>
                  <div className="flex gap-3 pt-2 w-full">
                    <button type="button" onClick={() => setShowAddGoal(false)} className="btn-secondary w-full" disabled={saving}>Cancelar</button>
                    <button type="submit" className="btn-primary w-full" disabled={saving}>{saving ? "Asignando..." : "Asignar Objetivo"}</button>
                  </div>
                </form>
             </div>
           </div>
        )}

        {/* Modal: PREVIEW */}
        {previewUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewUrl(null)}>
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Eye size={18} className="text-primary" /> Previsualización
                </h2>
                <button onClick={() => setPreviewUrl(null)} className="text-text-muted hover:text-danger p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-surface">
                <iframe src={previewUrl.includes('supabase') ? `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true` : previewUrl} className="w-full h-full border-none" title="Vista previa" />
              </div>
            </div>
          </div>
        )}

        {/* Modal: CERTIFICATES LIST */}
        {showCertModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCertModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border bg-surface/30 rounded-t-2xl gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award className="text-primary" /> {selectedCourseCerts[0]?.course_title}
                  </h2>
                  <p className="text-sm text-text-muted mt-1">{selectedCourseCerts.length} certificados generados</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadZip} className="btn-secondary bg-white py-1.5 px-3 flex items-center gap-2 text-sm shadow-sm hover:shadow">
                    <FileDown size={14}/> Bajar Todos (ZIP)
                  </button>
                  <button onClick={() => setShowCertModal(false)} className="text-text-muted hover:text-danger p-1.5 bg-white rounded-lg border border-border">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 bg-surface/10 rounded-b-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCourseCerts.map((cert) => (
                    <div key={cert.id} className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-white hover:border-primary/30 transition-colors shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-foreground leading-tight line-clamp-2" title={cert.participant_name}>{cert.participant_name}</p>
                        <p className="text-xs text-text-muted font-mono mt-2 w-full bg-surface px-2 py-1 rounded border border-border/50 truncate" title={cert.participant_code || cert.access_key}>
                          <span className="font-bold text-text-light mr-1">ID:</span>{cert.participant_code || cert.access_key}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border border-dashed">
                        <button onClick={() => setPreviewUrl(cert.pdf_url)} className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded transition-colors flex justify-center items-center gap-1">
                          <Eye size={14}/> Ver PDF
                        </button>
                        <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" download={`${cert.participant_name}.pdf`} className="flex-1 py-1.5 bg-surface hover:bg-border/50 text-foreground font-bold text-xs rounded transition-colors border border-border flex items-center justify-center gap-1">
                          <Download size={14}/> Bajar
                        </a>
                      </div>
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

  // -------------------------------------------------------------------------------------------------------------------------
  // RENDER: LIST VIEW
  // -------------------------------------------------------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Proyectos</h1>
          <p className="text-text-muted text-sm mt-1">Conecta clientes y consultores, y evalúa el progreso individual</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary px-4 py-2 text-sm shadow-md flex items-center gap-1.5">
          <Plus size={16} /> Añadir Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fetchError ? (
          <div className="col-span-full p-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl relative">
             <h3 className="font-bold mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Error de Fetch (Proyectos)</h3>
             <pre className="font-mono text-xs whitespace-pre-wrap bg-red-500/5 p-3 rounded">{fetchError}</pre>
             <button onClick={fetchData} className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded text-xs font-bold transition-colors">Reintentar Conexión</button>
          </div>
        ) : loading ? (
          <div className="col-span-full p-8 flex items-center justify-center gap-2 text-text-muted">
            <Loader2 size={18} className="animate-spin" /> Cargando proyectos...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-text-muted bg-surface rounded-xl border border-border border-dashed">No hay proyectos activos en el sistema.</div>
        ) : (
          projects.map(p => (
            <div key={p.id} className="card hover:shadow-lg transition-all group relative overflow-hidden flex flex-col cursor-pointer" onClick={() => openDetail(p.id, p.consultant?.id)}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/80 group-hover:bg-primary transition-colors rounded-t-xl" />
              
              <div className="flex justify-between items-start mt-2">
                 <h3 className="text-lg font-bold pr-2 leading-tight flex-1 group-hover:text-primary transition-colors">{p.name}</h3>
                 <div className="flex gap-1.5 items-center bg-white/50" onClick={e=>e.stopPropagation()}>
                    <button onClick={() => startEdit(p)} className="p-1.5 shadow-sm bg-surface hover:bg-info/10 text-text-muted hover:text-info rounded border border-border border-b-2 hover:border-info/20 transition-all" title="Editar config original"><Edit2 size={14} /></button>
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-1 bg-danger/10 p-1 rounded border border-danger/20">
                        <span className="text-[10px] text-danger font-bold mr-0.5">¿Seguro?</span>
                        <button onClick={() => handleDelete(p.id)} className="text-danger text-[10px] font-bold hover:underline">Sí</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-text-muted text-[10px] font-bold hover:underline">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(p.id)} className="p-1.5 shadow-sm bg-surface hover:bg-danger/10 text-text-muted hover:text-danger rounded border border-border border-b-2 hover:border-danger/20 transition-all" title="Eliminar proyecto"><Trash2 size={14} /></button>
                    )}
                 </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-light space-y-3 text-sm flex-1">
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase mb-1 block">Consultor a cargo</span>
                  <div className="flex items-center gap-2 font-medium text-info">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs bg-info/10">👤</span>
                    {p.consultant?.name || "No asignado"}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase mb-1 block">Clientes involucrados ({p.clientUsers?.length || 0})</span>
                  <div className="space-y-1">
                    {p.clientUsers?.map((cu: any) => (
                      <div key={cu.id} className="flex items-center gap-2 font-medium text-success text-xs">
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-success/10">🏢</span>
                        {cu.name}
                      </div>
                    ))}
                    {(!p.clientUsers || p.clientUsers.length === 0) && (
                      <span className="text-text-light text-xs italic">Ninguno</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 flex justify-end">
                 <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">Ver Avance y Gestión &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Añadir Nuevo Proyecto</h3>
            
            {msg.text && (
              <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${msg.type === "error" ? "bg-danger/10 text-danger border border-danger/20" : "bg-info/10 text-info"}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la empresa cliente / Nombre del Proyecto</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field placeholder:text-sm" placeholder="Ej: Implementación ISO - Grupo XYZ" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Consultor Asignado</label>
                <select required value={consultantId} onChange={e => setConsultantId(e.target.value)} className="input-field">
                  <option value="" disabled>-- Selecciona un Consultor --</option>
                  {availableConsultants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {availableConsultants.length === 0 && <p className="text-xs text-danger mt-1">No hay consultores activos.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Clientes Involucrados (Máximo 3)</label>
                {availableClients.length === 0 && <p className="text-xs text-danger mb-2">No hay clientes activos registrados.</p>}
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1 bg-surface/50">
                  {availableClients.map(client => (
                    <label key={client.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                        checked={clientIds.includes(client.id)}
                        onChange={() => handleClientToggle(client.id)}
                      />
                      <span className="text-sm font-medium">{client.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1 py-2" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1 py-2" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Editar Proyecto</h3>
            
            {msg.text && (
              <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${msg.type === "error" ? "bg-danger/10 text-danger border border-danger/20" : "bg-info/10 text-info"}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Proyecto</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Consultor Asignado</label>
                <select required value={consultantId} onChange={e => setConsultantId(e.target.value)} className="input-field">
                  <option value="" disabled>-- Selecciona un Consultor --</option>
                  {availableConsultants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Clientes Involucrados (Máximo 3)</label>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1 bg-surface/50">
                  {availableClients.map(client => (
                    <label key={client.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                        checked={clientIds.includes(client.id)}
                        onChange={() => handleClientToggle(client.id)}
                      />
                      <span className="text-sm font-medium">{client.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary flex-1 py-2" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1 py-2" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
