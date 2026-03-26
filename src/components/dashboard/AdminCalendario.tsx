"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  CalendarPlus,
  Loader2,
  X,
  StickyNote
} from "lucide-react";

export default function AdminCalendario() {
  const { userRole } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activities, setActivities] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");

  // ===== INTERNAL ADMIN CALENDAR =====
  const [adminNotes, setAdminNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(data => setProjects(data || []));
    fetchNotes();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchActivities();
    } else {
      setActivities([]);
    }
  }, [selectedProjectId]);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch(`/api/calendar?projectId=${selectedProjectId}`);
    const data = await res.json();
    setActivities(data.activities || []);
    setLoading(false);
  };

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch("/api/admin/notes");
      const data = await res.json();
      setAdminNotes(data.notes || []);
    } catch { setAdminNotes([]); }
    setNotesLoading(false);
  };

  const openModal = (act?: any) => {
    setSaved(false);
    setErrorMsg("");
    if (act) {
      setEditId(act.id);
      setTitle(act.title);
      setDescription(act.description);
      setDate(new Date(act.date).toISOString().split('T')[0]);
      setEmailList(JSON.parse(act.emails || "[]"));
    } else {
      setEditId(null);
      setTitle("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setEmailList([]);
    }
    setShowModal(true);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || emailList.length === 0) {
      setErrorMsg("Añade al menos un correo antes de guardar.");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }

    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/calendar/${editId}` : "/api/calendar";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProjectId, title, description, date, emails: emailList })
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setShowModal(false);
      fetchActivities();
    }, 800);
  };

  const addEmail = () => {
    if (newEmail && newEmail.includes("@")) {
      setEmailList([...emailList, newEmail.trim()]);
      setNewEmail("");
    }
  };

  const removeEmail = (index: number) => {
    setEmailList(emailList.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta actividad del calendario?")) return;
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    fetchActivities();
  };

  const handleNotify = async (act: any) => {
    setNotificationMsg("Enviando correo...");
    try {
      const res = await fetch("/api/email/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: JSON.parse(act.emails),
          date: act.date,
          description: act.description || act.title
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNotificationMsg("¡Correo enviado exitosamente a: " + JSON.parse(act.emails).join(", ") + "!");
      } else {
        setNotificationMsg("Error: " + data.error);
      }
      setTimeout(() => setNotificationMsg(""), 4000);
    } catch (e) {
      setNotificationMsg("Error de conexión al enviar correo.");
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  const openNoteModal = (note?: any) => {
    setNoteSaved(false);
    if (note) {
      setEditId(note.id);
      setNoteTitle(note.title);
      setNoteDesc(note.description || "");
      setNoteDate(new Date(note.date).toISOString().split("T")[0]);
    } else {
      setEditId(null);
      setNoteTitle("");
      setNoteDesc("");
      setNoteDate(new Date().toISOString().split("T")[0]);
    }
    setShowNoteModal(true);
  };

  // ===== NOTE HANDLERS =====
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteDate) return;
    setNoteSaving(true);
    
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/admin/notes/${editId}` : "/api/admin/notes";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: noteTitle, description: noteDesc, date: noteDate })
    });
    setNoteSaving(false);
    setNoteSaved(true);
    setTimeout(() => {
      setShowNoteModal(false);
      setNoteTitle("");
      setNoteDesc("");
      setNoteSaved(false);
      fetchNotes();
    }, 800);
  };

  const handleDeleteNote = async (id: string) => {
    await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  };

  // Group notes by month/year
  const groupedNotes: Record<string, any[]> = {};
  adminNotes.forEach(n => {
    const d = new Date(n.date);
    const key = d.toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
    if (!groupedNotes[key]) groupedNotes[key] = [];
    groupedNotes[key].push(n);
  });

  if (userRole !== "ADMIN") return <div className="text-center p-8">Acceso Denegado</div>;

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div>
        <h1 className="text-2xl font-bold">Calendario APM</h1>
        <p className="text-sm text-text-muted mt-1">Gestión de actividades programadas y recordatorios internos</p>
      </div>

      {notificationMsg && (
        <div className="bg-info/10 text-info border border-info/20 p-3 rounded-lg text-center font-semibold text-sm animate-scale-in">
          {notificationMsg}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           SECTION 1: PROJECT ACTIVITIES
         ════════════════════════════════════════════════════════════════════ */}
      <div className="card">
        <label className="block text-sm font-medium mb-2">Selecciona un Proyecto o Cliente</label>
        <select 
          value={selectedProjectId} 
          onChange={e => setSelectedProjectId(e.target.value)}
          className="input-field w-full max-w-md"
        >
          <option value="">-- Escoger Proyecto --</option>
          {projects.map(p => {
            const clientNames = p.clientUsers && p.clientUsers.length > 0 
              ? p.clientUsers.map((cu: any) => cu.name).join(", ") 
              : p.client?.companyName || "Sin cliente asignado";
            return (
              <option key={p.id} value={p.id}>
                {clientNames} - {p.name}
              </option>
            );
          })}
        </select>
      </div>

      {selectedProjectId && (
        <div className="card p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-lg font-bold">Actividades Programadas</h2>
            <button onClick={() => openModal()} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
              <Plus size={14} />
              Nueva Actividad
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-text-muted flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Cargando calendario...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-text-muted">Este proyecto no tiene actividades agendadas aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface/50 text-left">
                    <th className="py-3 px-6 font-semibold text-text-muted">Fecha</th>
                    <th className="py-3 px-6 font-semibold text-text-muted">Título y Descripción</th>
                    <th className="py-3 px-6 font-semibold text-text-muted">Correos Vinculados</th>
                    <th className="py-3 px-6 font-semibold text-text-muted text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(act => {
                    const emailListAct = JSON.parse(act.emails || "[]");
                    return (
                      <tr key={act.id} className="border-b border-border-light hover:bg-surface/30">
                        <td className="py-4 px-6 align-top">
                          <span className="font-bold text-primary-hover">
                            {new Date(act.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                          </span>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <p className="font-semibold">{act.title}</p>
                          <p className="text-xs text-text-muted mt-1 max-w-sm">{act.description}</p>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <span className="text-xs font-bold text-text-muted uppercase mb-1.5 block">Personas que van a asistir:</span>
                          <div className="flex flex-wrap gap-1 max-w-xs cursor-default">
                            {emailListAct.map((em: string, i: number) => (
                              <span key={i} className="text-[10.5px] font-medium bg-surface text-foreground px-2 py-1 rounded border border-border">
                                {em}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-y-2">
                          <button onClick={() => handleNotify(act)} className="block w-full text-xs font-semibold bg-primary/10 text-primary-hover hover:bg-primary/20 px-3 py-2 rounded transition-colors whitespace-nowrap mb-1 flex items-center gap-1.5 justify-center">
                            <Mail size={14} /> Notificar
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => openModal(act)} className="flex-1 text-sm font-bold text-info hover:text-white hover:bg-info px-4 py-2.5 rounded-lg border-2 border-info/30 hover:border-info shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 justify-center">
                              <Pencil size={18} /> Editar
                            </button>
                            <button onClick={() => handleDelete(act.id)} className="flex-1 text-sm font-bold text-danger hover:text-white hover:bg-danger px-4 py-2.5 rounded-lg border-2 border-danger/30 hover:border-danger shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 justify-center">
                              <Trash2 size={18} /> Borrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           SECTION 2: INTERNAL ADMIN CALENDAR (Notes)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="border-t-2 border-border pt-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <StickyNote size={20} strokeWidth={1.8} className="text-warning" />
              Calendario Interno de Administradores
            </h2>
            <p className="text-sm text-text-muted mt-1">Recordatorios y tareas diarias del equipo administrativo</p>
          </div>
          <button
            onClick={() => openNoteModal()}
            className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
          >
            <CalendarPlus size={14} />
            Agregar Recordatorio
          </button>
        </div>

        {notesLoading ? (
          <div className="text-center text-text-muted py-8 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Cargando recordatorios...
          </div>
        ) : adminNotes.length === 0 ? (
          <div className="card text-center py-10 text-text-muted">
            No hay recordatorios internos. ¡Agrega uno con el botón de arriba!
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotes).map(([monthLabel, notes]) => (
              <div key={monthLabel}>
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wide mb-3 capitalize">{monthLabel}</h3>
                <div className="space-y-2">
                  {notes.map((note: any) => (
                    <div key={note.id} className="card flex items-start gap-4 group hover:shadow-md transition-shadow py-4">
                      <div className="flex flex-col items-center min-w-[50px] flex-shrink-0">
                        <span className="text-2xl font-black text-primary leading-none">
                          {new Date(note.date).getUTCDate()}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted uppercase mt-0.5">
                          {new Date(note.date).toLocaleDateString("es-ES", { weekday: "short", timeZone: "UTC" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm">{note.title}</h4>
                        {note.description && (
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">{note.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                         <button
                           onClick={() => openNoteModal(note)}
                           className="flex items-center gap-1 text-xs font-bold text-info hover:text-white hover:bg-info px-3 py-2 rounded-lg border border-transparent hover:border-info/20 shadow-sm transition-all"
                           title="Editar recordatorio"
                         >
                           <Pencil size={16} /> Editar
                         </button>
                         <button
                           onClick={() => handleDeleteNote(note.id)}
                           className="flex items-center gap-1 text-xs font-bold text-danger hover:text-white hover:bg-danger px-3 py-2 rounded-lg border border-transparent hover:border-danger/20 shadow-sm transition-all"
                           title="Eliminar recordatorio"
                         >
                           <Trash2 size={16} /> Borrar
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ACTIVITY MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {errorMsg && (
              <div className="bg-danger/10 text-danger border border-danger/20 p-3 rounded mb-4 text-center text-sm">
                {errorMsg}
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? "Editar Actividad" : "Agendar Actividad"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Ej: Visita técnica presencial" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="input-field min-h-[60px]" placeholder="Detalles de la actividad que irá en el correo..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correos Vinculados</label>
                <div className="flex gap-2 mb-2">
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="input-field text-sm" placeholder="Añadir correo..." />
                  <button type="button" onClick={addEmail} className="btn-secondary px-3 py-1">
                    <Plus size={14} />
                  </button>
                </div>
                {emailList.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-border rounded-lg bg-surface">
                    {emailList.map((em, i) => (
                      <span key={i} className="text-xs bg-white border border-border px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                        {em}
                        <button type="button" onClick={() => removeEmail(i)} className="text-danger font-bold hover:text-danger/70">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2" disabled={saving || saved}>Cancelar</button>
                <button type="submit" disabled={saving || saved} className={`btn-primary flex-1 py-2 transition-all ${saved ? "bg-success border-success text-white" : ""}`}>
                  {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ NOTE MODAL ═══ */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nuevo Recordatorio</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input required type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} className="input-field" placeholder="Ej: Reunión con equipo legal" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <textarea value={noteDesc} onChange={e => setNoteDesc(e.target.value)} className="input-field min-h-[60px]" placeholder="Detalles adicionales..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input required type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNoteModal(false)} className="btn-secondary flex-1 py-2" disabled={noteSaving || noteSaved}>Cancelar</button>
                <button type="submit" disabled={noteSaving || noteSaved} className={`btn-primary flex-1 py-2 transition-all ${noteSaved ? "bg-success border-success text-white" : ""}`}>
                  {noteSaving ? "Guardando..." : noteSaved ? "¡Guardado!" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
