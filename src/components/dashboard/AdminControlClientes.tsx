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
  ChevronRight
} from "lucide-react";

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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch {
      setClients([]);
    }
    setLoading(false);
  };

  const openClientDetail = async (client: ClientUser) => {
    setSelectedClient(client);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/clients?clientId=${client.id}`);
      const data = await res.json();
      setDetail(data);
    } catch {
      setDetail(null);
    }
    setDetailLoading(false);
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
        ) : !detail || detail.projects.length === 0 ? (
          <div className="card text-center py-12 text-text-muted">
            <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Este cliente no tiene proyectos asignados actualmente.</p>
          </div>
        ) : (
          detail.projects.map(proj => (
            <div key={proj.id} className="card space-y-5">
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
