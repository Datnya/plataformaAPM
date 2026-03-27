"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Briefcase,
  TrendingUp,
  Clock,
  Target,
  Loader2,
  AlertCircle,
  ChevronRight,
  ListTodo,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  MapPin,
  Users,
  FileText,
  Download
} from "lucide-react";

interface GoalData {
  id: string;
  description: string;
  type: string;
  status: string;
  dueDate: string | null;
}

interface TimeLogData {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  modality: string;
  areasVisited?: string; // stored as JSON string
  peopleMet?: string; // stored as JSON string
}

interface ConsultantProjectDetail {
  id: string;
  name: string;
  clientName: string;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  goals: GoalData[];
  timeLogs: TimeLogData[];
  totalHours: number;
  remoteDays: number;
  presencialDays: number;
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url: string;
  projectId: string;
  projectName: string;
}

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  EN_PROCESO: "bg-blue-100 text-blue-700 border-blue-200",
  REVISION: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETADO: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  REVISION: "Revisión",
  COMPLETADO: "Completado",
};

export default function ConsultorProyectos() {
  const { userId, userRole } = useAuth();
  
  const [projects, setProjects] = useState<ConsultantProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ConsultantProjectDetail | null>(null);

  // States for modals
  const [viewLog, setViewLog] = useState<TimeLogData | null>(null);
  const [editLog, setEditLog] = useState<TimeLogData | null>(null);

  // Edit form states
  const [modality, setModality] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [areas, setAreas] = useState("");
  const [people, setPeople] = useState("");
  
  const [acting, setActing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reports for the selected project
  const [projectReports, setProjectReports] = useState<ReportData[]>([]);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const fetchProjects = async (idToKeepOpened?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultant/projects?consultantId=${userId}`);
      const data = await res.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      
      if (idToKeepOpened) {
         const proj = data.projects.find((p: any) => p.id === idToKeepOpened);
         if (proj) setSelectedProject(proj);
      }
    } catch {
      setProjects([]);
    }
    setLoading(false);
  };

  const openDetail = (p: ConsultantProjectDetail) => {
    setSelectedProject(p);
    fetchReportsForProject(p.id);
  };

  const goBack = () => {
    setSelectedProject(null);
  };

  const handleDelete = async (id: string, projectId: string) => {
    try {
      setActing(true);
      const res = await fetch(`/api/jornada/${id}`, { method: "DELETE" });
      if (res.ok) {
         setDeleteConfirmId(null);
         await fetchProjects(projectId);
      }
    } catch {} finally {
      setActing(false);
    }
  };

  const handleGoalStatusChange = async (goalId: string, newStatus: string) => {
    if (!selectedProject) return;
    setActing(true);
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchProjects(selectedProject.id);
      }
    } catch {} finally {
      setActing(false);
    }
  };

  const fetchReportsForProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/consultant/reports?consultantId=${userId}&projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectReports(Array.isArray(data.reports) ? data.reports : []);
      }
    } catch {
      setProjectReports([]);
    }
  };

  const parseJsonStr = (val?: string) => {
    if (!val) return ["", ""];
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) {
         return [arr[0] || "", arr[1] || ""];
      }
    } catch {}
    return [val, ""];
  };

  const openView = (log: TimeLogData) => {
    setViewLog(log);
  };

  const openEdit = (log: TimeLogData) => {
    setEditLog(log);
    setModality(log.modality);
    const dateIn = new Date(log.checkInTime);
    setInTime(dateIn.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    if (log.checkOutTime) {
       const dateOut = new Date(log.checkOutTime);
       setOutTime(dateOut.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    } else {
       setOutTime("");
    }
    const [a, desc] = parseJsonStr(log.areasVisited);
    const [p] = parseJsonStr(log.peopleMet);
    setAreas(a);
    setPeople(p);
  };

  const handleSaveEdit = async () => {
    if (!editLog || !selectedProject) return;
    setActing(true);
    try {
      const res = await fetch(`/api/jornada/${editLog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInTime: inTime,
          checkOutTime: outTime,
          modality,
          areasVisited: areas,
          peopleMet: people,
          // description is merged inside areasVisited index 1 backend handles it or ignores description if not sent explicitly but we can just rely on the API.
        })
      });
      if (res.ok) {
        setEditLog(null);
        await fetchProjects(selectedProject.id);
      }
    } catch {} finally {
      setActing(false);
    }
  };

  if (userRole !== "CONSULTOR") return <div className="text-center p-8">Acceso Denegado</div>;

  // ---- DETAIL VIEW ----
  if (selectedProject) {
    const proj = selectedProject;
    return (
      <div className="space-y-6 animate-fade-in relative">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-foreground transition-colors font-medium">
          <ArrowLeft size={16} strokeWidth={2} />
          Volver a mis proyectos
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase size={24} strokeWidth={1.5} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{proj.name}</h1>
            <p className="text-sm text-text-muted">Cliente: {proj.clientName}</p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border p-4 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-xs font-semibold text-text-muted uppercase">Avance Global</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-primary">{proj.progress}%</span>
            </div>
            <div className="mt-2 w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${proj.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1">{proj.completedGoals} de {proj.totalGoals} objetivos completados</p>
          </div>

          <div className="rounded-xl border border-border p-4 bg-gradient-to-br from-info/5 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-info" />
              <span className="text-xs font-semibold text-text-muted uppercase">Horas Trabajadas</span>
            </div>
            <span className="text-3xl font-black text-info">{proj.totalHours}h</span>
            <p className="text-[10px] text-text-muted mt-1">Acumuladas en este proyecto</p>
          </div>

          <div className="rounded-xl border border-border p-4 bg-gradient-to-br from-success/5 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={16} className="text-success" />
              <span className="text-xs font-semibold text-text-muted uppercase">Días Trabajados</span>
            </div>
            <span className="text-3xl font-black text-success">{proj.remoteDays + proj.presencialDays}</span>
            <p className="text-[10px] text-text-muted mt-1">
              Remoto: {proj.remoteDays} · Presencial: {proj.presencialDays}
            </p>
          </div>
        </div>

        {/* Goals table */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target size={20} className="text-primary" /> Objetivos Semanales y Mensuales
          </h2>
          {proj.goals.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface/70">
                    <th className="text-left py-3 px-4 font-semibold text-text-muted text-xs">Objetivo</th>
                    <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs">Tipo</th>
                    <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs">Estado</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-muted text-xs">Fecha Límite</th>
                  </tr>
                </thead>
                <tbody>
                  {proj.goals.map(goal => (
                    <tr key={goal.id} className="border-t border-border-light hover:bg-surface/30">
                      <td className="py-3 px-4 font-medium max-w-xs">{goal.description}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold uppercase bg-surface px-2 py-1 rounded border border-border">
                          {goal.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={goal.status}
                          onChange={e => handleGoalStatusChange(goal.id, e.target.value)}
                          disabled={acting}
                          className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer outline-none ${statusColors[goal.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROCESO">En Proceso</option>
                          <option value="COMPLETADO">Completado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right text-text-muted text-xs">
                        {goal.dueDate
                          ? new Date(goal.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="p-8 text-center text-text-muted">
               Este proyecto no tiene objetivos asignados.
             </div>
          )}
        </div>

        {/* Timelogs table */}
        <div className="card space-y-4 mt-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ListTodo size={20} className="text-primary" /> Historial de Jornadas
          </h2>
          {proj.timeLogs.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface/70">
                    <th className="text-left py-3 px-4 font-semibold text-text-muted text-xs">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-muted text-xs">Modalidad</th>
                    <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs hidden sm:table-cell">H. Ingreso</th>
                    <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs hidden sm:table-cell">H. Salida</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-muted text-xs">Horas</th>
                    <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proj.timeLogs.map(log => {
                    let horas = 0;
                    if (log.checkInTime && log.checkOutTime) {
                       const ms = new Date(log.checkOutTime).getTime() - new Date(log.checkInTime).getTime();
                       horas = Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
                    }
                    return (
                    <tr key={log.id} className="border-t border-border-light hover:bg-surface/30">
                      <td className="py-3 px-4 font-medium max-w-xs whitespace-nowrap">
                        {new Date(log.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                      </td>
                      <td className="py-3 px-4 text-left">
                        <span className="text-[10px] font-bold uppercase bg-surface px-2 py-1 rounded border border-border">
                          {log.modality}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-primary font-bold hidden sm:table-cell">
                        {new Date(log.checkInTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 text-center font-bold hidden sm:table-cell">
                        {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-text-muted font-bold text-xs">
                        {horas > 0 ? `${horas}h` : "—"}
                      </td>
                      <td className="py-3 px-4">
                         <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openView(log)} className="p-1.5 bg-surface text-text-muted hover:text-primary rounded" title="Visualizar">
                               <Eye size={16} />
                            </button>
                            <button onClick={() => openEdit(log)} disabled={acting} className="p-1.5 bg-surface text-text-muted hover:text-info rounded disabled:opacity-50" title="Editar">
                               <Pencil size={16} />
                            </button>
                            {deleteConfirmId === log.id ? (
                              <div className="flex items-center gap-1 bg-danger/10 p-1 rounded">
                                <button onClick={() => handleDelete(log.id, proj.id)} disabled={acting} className="text-danger text-[10px] font-bold hover:underline">Sí</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="text-text-muted text-[10px] font-bold hover:underline">No</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirmId(log.id)} disabled={acting} className="p-1.5 bg-surface text-text-muted hover:text-danger rounded disabled:opacity-50" title="Eliminar">
                                 <Trash2 size={16} />
                              </button>
                            )}
                         </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="p-8 text-center text-text-muted">
               No hay registros de horas en este proyecto.
             </div>
          )}
        </div>

        {/* Informes Cargados */}
        <div className="card space-y-4 mt-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Informes Cargados
          </h2>
          {projectReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectReports.map(report => (
                <div key={report.id} className="rounded-xl border border-border p-4 bg-gradient-to-br from-surface/80 to-transparent hover:shadow-md transition-shadow group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{report.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {report.date} · {report.type}
                      </p>
                    </div>
                  </div>
                  {report.size && (
                    <p className="text-xs text-text-muted mt-2">{report.size}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <a href={report.url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 py-1.5 rounded-lg transition-colors">
                      <Eye size={12} /> Ver
                    </a>
                    <a href={report.url} download className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-info bg-info/5 hover:bg-info/10 border border-info/20 py-1.5 rounded-lg transition-colors">
                      <Download size={12} /> Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay informes cargados para este proyecto.</p>
              <p className="text-xs mt-1">Sube informes desde la sección "Mis Informes" y aparecerán aquí automáticamente.</p>
            </div>
          )}
        </div>

        {/* Modal: View */}
        {viewLog && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-background rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
               <div className="flex items-center justify-between p-4 border-b border-border">
                 <h2 className="text-lg font-bold">Detalle de la Jornada</h2>
                 <button onClick={() => setViewLog(null)} className="text-text-muted hover:text-danger p-1 rounded-lg">
                   <X size={20} />
                 </button>
               </div>
               <div className="p-4 space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="font-semibold text-text-muted">Fecha</span>
                   <span className="font-bold">{new Date(viewLog.date).toLocaleDateString("es-ES", { timeZone: "UTC" })}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="font-semibold text-text-muted">Modalidad</span>
                   <span className="font-bold">{viewLog.modality}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="font-semibold text-text-muted">Horario</span>
                   <span className="font-bold">
                      {new Date(viewLog.checkInTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      {" - "}
                      {viewLog.checkOutTime ? new Date(viewLog.checkOutTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
                   </span>
                 </div>
                 
                 <div className="border-t border-border pt-4">
                   <p className="text-xs font-semibold text-text-muted mb-1 flex items-center gap-1"><MapPin size={14}/> Áreas Visitadas:</p>
                   <p className="text-sm border border-border rounded-lg bg-surface p-2">{parseJsonStr(viewLog.areasVisited)[0] || "No registradas"}</p>
                 </div>
                 
                 <div>
                   <p className="text-xs font-semibold text-text-muted mb-1 flex items-center gap-1"><Users size={14}/> Personas con las que se reunió:</p>
                   <p className="text-sm border border-border rounded-lg bg-surface p-2">{parseJsonStr(viewLog.peopleMet)[0] || "Nadie / No registrado"}</p>
                 </div>

                 <div>
                   <p className="text-xs font-semibold text-text-muted mb-1 flex items-center gap-1"><Target size={14}/> Avance y Observaciones:</p>
                   <p className="text-sm border border-border rounded-lg bg-surface p-2 whitespace-pre-wrap">{parseJsonStr(viewLog.areasVisited)[1] || "Sin observaciones."}</p>
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* Modal: Edit */}
        {editLog && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-background rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
               <div className="flex items-center justify-between p-4 border-b border-border">
                 <h2 className="text-lg font-bold flex items-center gap-2"><Pencil size={18} className="text-info" /> Editar Jornada</h2>
                 <button onClick={() => setEditLog(null)} className="text-text-muted hover:text-danger p-1 rounded-lg disabled:opacity-50" disabled={acting}>
                   <X size={20} />
                 </button>
               </div>
               <div className="p-4 space-y-4">
                 
                 <div>
                   <label className="block text-xs font-bold mb-1 text-text-muted">Modalidad</label>
                   <select className="input-field py-2" value={modality} onChange={e => setModality(e.target.value)} disabled={acting}>
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="REMOTO">Remoto</option>
                   </select>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-xs font-bold mb-1 text-text-muted">Entrada (24h)</label>
                     <input type="time" className="input-field py-2" value={inTime} onChange={e => setInTime(e.target.value)} disabled={acting} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold mb-1 text-text-muted">Salida (24h)</label>
                     <input type="time" className="input-field py-2" value={outTime} onChange={e => setOutTime(e.target.value)} disabled={acting} />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold mb-1 text-text-muted">Áreas Visitadas</label>
                   <input type="text" className="input-field" value={areas} onChange={e => setAreas(e.target.value)} disabled={acting} />
                 </div>

                 <div>
                   <label className="block text-xs font-bold mb-1 text-text-muted">Personas (Reunión)</label>
                   <input type="text" className="input-field" value={people} onChange={e => setPeople(e.target.value)} disabled={acting} />
                 </div>

                 <button 
                  disabled={acting}
                  onClick={handleSaveEdit}
                  className="btn-primary w-full py-2 flex items-center justify-center gap-2 mt-2"
                 >
                   {acting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar Cambios
                 </button>
               </div>
             </div>
           </div>
        )}
      </div>
    );
  }

  // ---- LIST VIEW ----
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Control de Proyectos</h1>
        <p className="text-text-muted text-sm mt-1">
          Visualiza los proyectos a los que estás asignado, su avance global e historial de horas.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-text-muted gap-3">
          <Loader2 size={20} className="animate-spin" />
          Cargando tus proyectos...
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12 text-text-muted">
          <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tienes proyectos asignados actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => openDetail(proj)}
              className="card text-left hover:shadow-lg hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden flex flex-col items-start gap-4"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/40 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 w-full">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{proj.name}</h3>
                  <p className="text-xs text-text-muted truncate">Cliente: {proj.clientName}</p>
                </div>
                <ChevronRight size={18} className="text-text-light group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              
              <div className="w-full mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-text-muted uppercase">Avance</span>
                    <span className="text-xs font-bold text-primary-hover">{proj.progress}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden w-full">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
