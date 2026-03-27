"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  User,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Building2,
  Award,
  Download,
  FileDown
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface GoalData {
  id: string;
  description: string;
  type: string;
  status: string;
  dueDate: string | null;
}

interface ProjectDetail {
  id: string;
  name: string;
  consultant: { id: string; name: string } | null;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  goals: GoalData[];
  hoursThisMonth: number;
  totalLogs: number;
  certificates?: any[];
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

export default function AdminControlClientes() {
  const { userRole } = useAuth();

  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientUser | null>(null);
  const [detail, setDetail] = useState<{ client: ClientUser; projects: ProjectDetail[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Assignment states
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients", { cache: "no-store" });
      const data = await res.json();
      setClients(Array.isArray(data.clients) ? data.clients : []);
    } catch {
      setClients([]);
    }
    setLoading(false);
  };

  const openClientDetail = async (client: ClientUser) => {
    setSelectedClient(client);
    setDetailLoading(true);
    try {
      const [detailRes, projRes] = await Promise.all([
        fetch(`/api/admin/clients?clientId=${client.id}&t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/projects?t=${Date.now()}`, { cache: "no-store" })
      ]);
      const detailData = await detailRes.json();
      setDetail(detailData && !detailData.error ? detailData : null);

      const projData = await projRes.json();
      setAllProjects(Array.isArray(projData) ? projData : []);
      setShowAddProject(false);
      setSelectedProjectId("");
    } catch {
      setDetail(null);
    }
    setDetailLoading(false);
  };

  const handleAssignProject = async () => {
    if (!selectedClient || !selectedProjectId) return;
    setActing(true);
    try {
      const res = await fetch("/api/admin/clients/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, clientId: selectedClient.id })
      });
      if (res.ok) {
        await openClientDetail(selectedClient);
      } else {
        const data = await res.json();
        alert(data.error || "Error asignando proyecto");
      }
    } catch {
      alert("Error de red");
    }
    setActing(false);
  };

  const handleRemoveProject = async (projectId: string) => {
    if (!selectedClient || !confirm("¿Eliminar este proyecto del perfil del cliente?")) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/clients/projects?projectId=${projectId}&clientId=${selectedClient.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await openClientDetail(selectedClient);
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar proyecto");
      }
    } catch {
      alert("Error de red");
    }
    setActing(false);
  };

  const goBack = () => {
    setSelectedClient(null);
    setDetail(null);
  };

  if (userRole !== "ADMIN") return <div className="text-center p-8">Acceso Denegado</div>;

  // ---- DETAIL VIEW ----
  if (selectedClient) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-foreground transition-colors font-medium">
          <ArrowLeft size={16} strokeWidth={2} />
          Volver a la lista de clientes
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={24} strokeWidth={1.5} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{selectedClient.name}</h1>
            <p className="text-sm text-text-muted">{selectedClient.email}</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${
            selectedClient.status === "ACTIVO"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-100 border-gray-200 text-gray-500"
          }`}>
            {selectedClient.status}
          </span>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center p-12 text-text-muted gap-3">
            <Loader2 size={20} className="animate-spin" />
            Cargando información del cliente...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card w-full">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Building2 size={20} className="text-primary" /> Proyectos Asignados
              </h2>
              {!showAddProject ? (
                <button 
                  onClick={() => setShowAddProject(true)}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shadow-sm"
                  disabled={acting}
                >
                  <Plus size={14} /> Asignar Proyecto
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <select 
                    className="input-field py-1.5 text-sm min-w-[200px]"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={acting}
                  >
                    <option value="">Selecciona un proyecto...</option>
                    {allProjects
                      .filter(p => !detail?.projects.some(dp => dp.id === p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <button onClick={handleAssignProject} disabled={!selectedProjectId || acting} className="btn-primary py-1.5 px-3 shadow-sm text-sm disabled:opacity-50">Guardar</button>
                  <button onClick={() => { setShowAddProject(false); setSelectedProjectId(""); }} disabled={acting} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors bg-white border border-border"><X size={16} /></button>
                </div>
              )}
            </div>

            {!detail || detail.projects.length === 0 ? (
              <div className="card text-center py-12 text-text-muted border-dashed border-2">
                <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">Este cliente aún no tiene proyectos asignados.</p>
              </div>
            ) : (
              detail.projects.map(proj => (
                <div key={proj.id} className="card space-y-5 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  {/* Project header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{proj.name}</h2>
                      {proj.consultant && (
                        <p className="text-xs text-text-muted mt-1">
                          <span className="font-semibold">Consultor:</span> {proj.consultant.name}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveProject(proj.id)}
                      disabled={acting}
                      className="text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar proyecto de este cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border p-4 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-primary" />
                    <span className="text-xs font-semibold text-text-muted uppercase">Avance General</span>
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
                    <span className="text-xs font-semibold text-text-muted uppercase">Horas este mes</span>
                  </div>
                  <span className="text-3xl font-black text-info">{proj.hoursThisMonth}h</span>
                  <p className="text-[10px] text-text-muted mt-1">{proj.totalLogs} registros de jornada</p>
                </div>

                <div className="rounded-xl border border-border p-4 bg-gradient-to-br from-success/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-success" />
                    <span className="text-xs font-semibold text-text-muted uppercase">Objetivos</span>
                  </div>
                  <span className="text-3xl font-black text-success">{proj.totalGoals}</span>
                  <p className="text-[10px] text-text-muted mt-1">
                    {proj.goals.filter(g => g.status === "PENDIENTE").length} pendientes ·{" "}
                    {proj.goals.filter(g => g.status === "EN_PROCESO").length} en proceso
                  </p>
                </div>
              </div>

              {/* Goals table */}
              {proj.goals.length > 0 && (
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
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${statusColors[goal.status] || "bg-gray-100 text-gray-600"}`}>
                              {statusLabels[goal.status] || goal.status}
                            </span>
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
              )}

              {/* Informes / Evidencias Panel */}
              <div className="border-t border-border pt-4">
                <h3 className="text-md font-bold mb-3">Informes Semanales y Mensuales</h3>
                {/* Simulated empty state since no real reports logic exists yet */}
                <div className="bg-surface rounded-xl p-8 text-center border border-border border-dashed">
                  <p className="text-text-muted/60 text-sm font-medium">No hay ningún informe cargado</p>
                </div>
              </div>
            </div>
          ))
        )}
          </div>
        )}
      </div>
    );
  }

  // ---- LIST VIEW ----
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Control de Clientes</h1>
        <p className="text-text-muted text-sm mt-1">
          Visualiza el estado de cada cliente, su avance, objetivos y horas registradas por su consultor.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-text-muted gap-3">
          <Loader2 size={20} className="animate-spin" />
          Cargando clientes...
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-12 text-text-muted">
          <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No hay usuarios con rol CLIENTE registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => openClientDetail(client)}
              className="card text-left hover:shadow-lg hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/40 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User size={20} strokeWidth={1.5} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{client.name}</h3>
                  <p className="text-xs text-text-muted truncate">{client.email}</p>
                </div>
                <ChevronRight size={18} className="text-text-light group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              <div className="mt-3 pt-3 border-t border-border-light">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  client.status === "ACTIVO"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-100 border-gray-200 text-gray-500"
                }`}>
                  {client.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
