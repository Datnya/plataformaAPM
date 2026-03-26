"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, Plus, Trash2, CalendarCheck, Pencil, X, Save, Loader2 } from "lucide-react";

interface Note {
  id: string;
  description: string;
  date: string;
}

export default function ConsultorCalendario() {
  const { userId } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consultant/calendar?consultantId=${userId}`);
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes.map((n: any) => ({
          ...n,
          date: n.date.split("T")[0]
        })));
      }
    } catch {
      setErrorMsg("Error al obtener las notas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  const handleAdd = async () => {
    if (!description || !date) {
      setErrorMsg("Completa tanto el día como la descripción.");
      return;
    }
    setErrorMsg("");
    setActing(true);

    try {
      const res = await fetch("/api/consultant/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId: userId, description, date })
      });
      const data = await res.json();
      if (res.ok) {
        setNotes([...notes, { id: data.note.id, date: data.note.date, description: data.note.description }]);
        setDescription("");
        setDate("");
      }
    } catch {
      setErrorMsg("Error al crear la actividad");
    } finally {
      setActing(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setDate(note.date);
    setDescription(note.description);
    setErrorMsg("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDate("");
    setDescription("");
    setErrorMsg("");
  };

  const handleSaveEdit = async () => {
    if (!description || !date || !editingId) return;
    setErrorMsg("");
    setActing(true);

    try {
      const res = await fetch(`/api/consultant/calendar/${editingId}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ consultantId: userId, description, date })
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(notes.map(n => n.id === editingId ? { ...n, description: data.note.description, date: data.note.date } : n));
        cancelEdit();
      }
    } catch (e) {
      setErrorMsg("Error al editar");
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/consultant/calendar/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
        setDeleteConfirmId(null);
      }
    } catch {
      setErrorMsg("Error al eliminar");
    }
  };

  const groupedNotes = notes.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).reduce((acc, note) => {
    const dateObj = new Date(note.date + "T00:00:00");
    const monthYear = dateObj.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    const cap = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    if (!acc[cap]) acc[cap] = [];
    acc[cap].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  if (loading) return <div className="p-8 text-center text-primary animate-pulse"><Loader2 size={32} className="mx-auto animate-spin mb-4"/>Cargando...</div>;

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      <div>
        <h1 className="text-2xl font-bold">Calendario Personal</h1>
        <p className="text-text-muted text-sm mt-1">
          Añade recordatorios o actividades de organización propia. Solo tú los ves.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="card lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CalendarCheck size={20} className="text-primary" /> 
            {editingId ? "Editar Actividad" : "Nueva Actividad"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1">Día</label>
              <input 
                type="date"
                className="input-field cursor-pointer"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1">Descripción</label>
              <textarea 
                className="input-field resize-y min-h-[100px]"
                placeholder="Ej. Realizar el diagnóstico temprano en Logra..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            
            {errorMsg && (
              <div className="text-xs text-danger font-semibold">{errorMsg}</div>
            )}

            {editingId ? (
              <div className="flex gap-2">
                <button 
                  disabled={acting}
                  onClick={handleSaveEdit}
                  className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {acting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar
                </button>
                <button 
                  disabled={acting}
                  onClick={cancelEdit}
                  className="bg-surface border border-border flex-1 py-2.5 rounded-xl font-bold text-text-light hover:bg-border transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancelar
                </button>
              </div>
            ) : (
              <button 
                disabled={acting}
                onClick={handleAdd}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {acting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Agregar Actividad
              </button>
            )}
          </div>
        </div>

        {/* Display Grouped Notes */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedNotes).length === 0 ? (
            <div className="card text-center p-8 text-text-muted">
              <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tienes actividades agregadas a tu calendario.</p>
            </div>
          ) : (
            Object.entries(groupedNotes).map(([monthYear, monthNotes]) => (
              <div key={monthYear} className="card space-y-4">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
                  <CalendarDays size={18} /> {monthYear}
                </h3>
                <div className="space-y-3">
                  {monthNotes.map(note => (
                    <div key={note.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border-light bg-surface hover:shadow-sm transition-all">
                      <div className="flex-shrink-0 bg-primary/10 text-primary rounded-lg px-3 py-2 text-center w-fit border border-primary/20">
                        <span className="block text-[10px] font-bold uppercase">
                          {new Date(note.date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short" })}
                        </span>
                        <span className="block text-lg font-black leading-tight">
                          {new Date(note.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric" })}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{note.description}</p>
                      </div>

                      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => handleEdit(note)}
                          className="flex items-center gap-1 text-xs font-semibold text-info hover:text-white hover:bg-info/90 px-3 py-2 rounded transition-colors border border-info/20"
                        >
                          <Pencil size={16} /> Editar
                        </button>
                        {deleteConfirmId === note.id ? (
                          <div className="flex items-center gap-1 bg-danger/10 p-1.5 rounded border border-danger/20">
                            <span className="text-[10px] text-danger font-bold mr-1">¿Eliminar?</span>
                            <button onClick={() => handleDelete(note.id)} className="text-danger text-[10px] font-bold hover:underline">Sí</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-text-muted text-[10px] font-bold hover:underline">No</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(note.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-danger hover:text-white hover:bg-danger/90 px-3 py-2 rounded transition-colors border border-danger/20"
                          >
                            <Trash2 size={16} /> Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
