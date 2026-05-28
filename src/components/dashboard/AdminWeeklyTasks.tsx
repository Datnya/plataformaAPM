"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, Clock, CircleAlert, Search, Loader2, ListTodo } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type TaskStatus = "PENDIENTE" | "EN_PROCESO" | "COMPLETADO";

interface WeeklyTask {
  id: string;
  title: string;
  status: TaskStatus;
  assigned_to: string;
  due_date: string;
  observation: string;
  usuario?: { id: string; name: string; role: string };
}

interface PlatformUser {
  id: string;
  name: string;
  role: string;
}

export default function AdminWeeklyTasks() {
  const { userName } = useAuth();
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUserId, setFilterUserId] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<WeeklyTask> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch("/api/weekly-tasks", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" })
      ]);
      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      if (tasksData.tasks) setTasks(tasksData.tasks);
      if (Array.isArray(usersData)) {
        setUsers(usersData.filter(u => u.role === "ADMIN"));
      } else if (usersData.users) {
        setUsers(usersData.users.filter((u: any) => u.role === "ADMIN"));
      }
    } catch (error) {
      console.error("Error fetching weekly tasks data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    if (filterUserId === "ALL") return tasks;
    return tasks.filter(t => t.assigned_to === filterUserId);
  }, [tasks, filterUserId]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === "COMPLETADO").length;
    const pending = filteredTasks.filter(t => t.status === "PENDIENTE").length;
    const inProcess = filteredTasks.filter(t => t.status === "EN_PROCESO").length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, inProcess, percent };
  }, [filteredTasks]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask?.title || !currentTask?.assigned_to || !currentTask?.due_date) return;
    setIsSaving(true);
    
    try {
      const isEdit = !!currentTask.id;
      const url = isEdit ? `/api/weekly-tasks/${currentTask.id}` : "/api/weekly-tasks";
      const method = isEdit ? "PUT" : "POST";

      const payload = { ...currentTask };
      delete payload.usuario;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error saving task");
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la tarea");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta tarea?")) return;
    try {
      const res = await fetch(`/api/weekly-tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting task");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la tarea");
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/weekly-tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error(error);
      fetchData(); // Rollback
    }
  };

  const statusIcons: Record<string, React.ReactNode> = {
    PENDIENTE: <CircleAlert size={16} className="text-yellow-500" />,
    EN_PROCESO: <Clock size={16} className="text-blue-500" />,
    COMPLETADO: <CheckCircle2 size={16} className="text-green-500" />
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Tareas Semanales</h1>
          <p className="text-text-muted mt-1">
            Planifica y supervisa las tareas del equipo para esta semana.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentTask({ status: "PENDIENTE", due_date: new Date().toISOString().split("T")[0] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Filters & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border-3 border-primary shadow-sm md:col-span-1">
          <label className="block text-sm font-bold text-foreground mb-2">Filtrar por Usuario</label>
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="ALL">Todos los Usuarios</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Métricas Globales</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-1.5"><ListTodo size={14} /> Total Tareas:</span>
                <span className="font-bold text-foreground">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-1.5">{statusIcons["COMPLETADO"]} Completadas:</span>
                <span className="font-bold text-foreground">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-1.5">{statusIcons["EN_PROCESO"]} En Proceso:</span>
                <span className="font-bold text-foreground">{stats.inProcess}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-1.5">{statusIcons["PENDIENTE"]} Pendientes:</span>
                <span className="font-bold text-foreground">{stats.pending}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-text-muted">Progreso</span>
                <span className="text-xs font-bold text-primary">{stats.percent}%</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden md:col-span-3 flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center p-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-border bg-surface text-xs font-bold text-foreground uppercase tracking-wider">
                    <th className="px-5 py-4 w-[25%]">Tarea</th>
                    <th className="px-5 py-4 w-[20%]">Asignado A</th>
                    <th className="px-5 py-4 w-[15%]">Fecha Límite</th>
                    <th className="px-5 py-4 w-[15%]">Estado</th>
                    <th className="px-5 py-4 w-[15%]">Observación</th>
                    <th className="px-5 py-4 text-right w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-foreground line-clamp-2" title={task.title}>
                          {task.title}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-muted font-medium">
                        {users.find(u => u.id === task.assigned_to)?.name || "Desconocido"}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {new Date(task.due_date + "T12:00:00Z").toLocaleDateString("es-ES", { day: "2-digit", month: "short", timeZone: "UTC" })}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className={`text-xs font-bold px-2 py-1.5 rounded-md border-none cursor-pointer focus:ring-2 focus:ring-primary/20
                            ${task.status === "COMPLETADO" ? "bg-green-100 text-green-800" 
                            : task.status === "EN_PROCESO" ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"}
                          `}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROCESO">En Proceso</option>
                          <option value="COMPLETADO">Completada</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-xs text-text-muted">
                        <span className="line-clamp-2" title={task.observation || ""}>
                          {task.observation || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setCurrentTask(task);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-text-light hover:text-info hover:bg-info/10 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-text-light hover:text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-text-light">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground">No hay tareas programadas</h3>
              <p className="text-text-muted text-sm mt-1 max-w-md">
                No se encontraron tareas semanales para el filtro seleccionado. Haz clic en "Nueva Tarea" para comenzar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 min-h-screen" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
              <h2 className="text-lg font-bold text-foreground">
                {currentTask?.id ? "Editar Tarea Semanal" : "Nueva Tarea Semanal"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-light hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Título de la Tarea <span className="text-danger">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Revisión de metricas logradas..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={currentTask?.title || ""}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Asignar a <span className="text-danger">*</span></label>
                  <select
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer"
                    value={currentTask?.assigned_to || ""}
                    onChange={(e) => setCurrentTask({ ...currentTask, assigned_to: e.target.value })}
                  >
                    <option value="" disabled>Seleccione un usuario</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Fecha Límite <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={currentTask?.due_date || ""}
                    onChange={(e) => setCurrentTask({ ...currentTask, due_date: e.target.value })}
                  />
                </div>
              </div>

               <div className="grid grid-cols-1 gap-4">
                  <label className="block text-sm font-bold text-foreground mb-0 pb-0">Estado</label>
                  <select
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer -mt-3"
                    value={currentTask?.status || "PENDIENTE"}
                    onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value as TaskStatus })}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="COMPLETADO">Completada</option>
                  </select>
               </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Observación (Opcional)</label>
                <textarea
                  placeholder="Detalles adicionales..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  value={currentTask?.observation || ""}
                  onChange={(e) => setCurrentTask({ ...currentTask, observation: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-bold text-text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isSaving ? "Guardando..." : "Guardar Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
