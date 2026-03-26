"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

export default function AdminConsultorGoals() {
  const { selectedConsultantId, setCurrentView } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  // New goal
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("SEMANAL");
  const [dueDate, setDueDate] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  const fetchGoals = async () => {
    if (!selectedConsultantId) return;
    setLoading(true);
    const res = await fetch(`/api/admin/goals?consultantId=${selectedConsultantId}`);
    const data = await res.json();
    setGoals(data || []);
    setLoading(false);
  };

  const fetchProjects = async () => {
    // For simplicity, just fetching all projects for select
    const res = await fetch(`/api/projects?consultantId=${selectedConsultantId}`);
    if (res.ok) setProjects(await res.json());
  };

  useEffect(() => {
    if (!selectedConsultantId) {
      setCurrentView("dashboard");
      return;
    }
    fetchGoals();
    fetchProjects();
  }, [selectedConsultantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !description) return;

    await fetch("/api/admin/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, description, type, dueDate })
    });
    
    setShowAdd(false);
    setDescription("");
    setDueDate("");
    fetchGoals();
  };

  const handleUpdate = async (id: string, updates: any) => {
    await fetch(`/api/admin/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este objetivo de forma permanente?")) return;
    await fetch(`/api/admin/goals/${id}`, { method: "DELETE" });
    fetchGoals();
  };

  const statusColors: any = {
    PENDIENTE: "bg-surface text-text-muted border-border",
    EN_PROCESO: "bg-info/10 text-info border-info/20",
    REVISION: "bg-warning/10 text-warning border-warning/20",
    COMPLETADO: "bg-success/10 text-success border-success/30"
  };

  const handleGoBack = () => {
    setCurrentView("dashboard");
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center gap-4">
        <button onClick={handleGoBack} className="w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center hover:bg-surface transition-colors">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold">Objetivos del Consultor</h1>
          <p className="text-sm text-text-muted mt-1">Gestión administrativa de tareas asignadas</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          + Asignar Objetivo
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Cargando objetivos...</div>
        ) : goals.length === 0 ? (
          <div className="p-8 text-center text-text-muted">Este consultor no tiene objetivos asignados.</div>
        ) : (
           <table className="w-full text-sm">
             <thead>
               <tr className="bg-surface">
                 <th className="text-left py-3 px-4 font-semibold text-text-muted">Proyecto</th>
                 <th className="text-left py-3 px-4 font-semibold text-text-muted">Descripción</th>
                 <th className="text-center py-3 px-4 font-semibold text-text-muted">Fecha Límite</th>
                 <th className="text-center py-3 px-4 font-semibold text-text-muted">Estado</th>
                 <th className="text-right py-3 px-4 font-semibold text-text-muted">Desempeño</th>
               </tr>
             </thead>
             <tbody>
               {goals.map(g => (
                 <tr key={g.id} className="border-b border-border-light hover:bg-surface/50">
                   <td className="py-3 px-4 font-medium">{g.projectName} <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">{g.type}</span></td>
                   <td className="py-3 px-4">
                     <input 
                       defaultValue={g.description} 
                       onBlur={e => e.target.value !== g.description && handleUpdate(g.id, { description: e.target.value })}
                       className="bg-transparent border-none outline-none w-full hover:bg-white focus:bg-white hover:ring-1 ring-border p-1 rounded transition-all"
                     />
                   </td>
                   <td className="py-3 px-4 text-center">
                     <input 
                       type="date"
                       defaultValue={g.dueDate ? new Date(g.dueDate).toISOString().split('T')[0] : ""}
                       onBlur={e => e.target.value !== (g.dueDate ? new Date(g.dueDate).toISOString().split('T')[0] : "") && handleUpdate(g.id, { dueDate: e.target.value })}
                       className="bg-transparent border-none outline-none text-center cursor-pointer hover:bg-white p-1 rounded"
                     />
                   </td>
                   <td className="py-3 px-4 text-center">
                     <select 
                       value={g.status} 
                       onChange={e => handleUpdate(g.id, { status: e.target.value })}
                       className={`text-xs font-bold px-2 py-1 rounded-full outline-none border cursor-pointer ${statusColors[g.status]}`}
                     >
                       <option value="PENDIENTE">Pendiente</option>
                       <option value="EN_PROCESO">En Proceso</option>
                       <option value="REVISION">En Revisión</option>
                       <option value="COMPLETADO">Completado</option>
                     </select>
                   </td>
                   <td className="py-3 px-4 text-right">
                     <button onClick={() => handleDelete(g.id)} className="text-danger hover:bg-danger/10 p-2 rounded transition-colors" title="Eliminar objetivo"><Trash2 size={18} /></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <h3 className="text-xl font-bold mb-4">Nuevo Objetivo</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Proyecto Asignado</label>
                <select required value={projectId} onChange={e => setProjectId(e.target.value)} className="input-field">
                  <option value="" disabled>Selecciona el proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción de la Tarea</label>
                <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="Ej: Realizar visita técnica..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="input-field">
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Límite</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1 py-2">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 py-2">Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
