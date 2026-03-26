"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Share2, PlaySquare, Camera, Globe, Calendar, CheckCircle, Clock } from "lucide-react";

export default function AdminSocialContent() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [networks, setNetworks] = useState<string[]>([]);
  const [contentType, setContentType] = useState("Informativo");
  const [format, setFormat] = useState("Post estático");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("PENDIENTE");

  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/social-content");
      const data = await res.json();
      setContents(Array.isArray(data) ? data : []);
    } catch {
      setContents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openForm = (item?: any) => {
    if (item) {
      setEditId(item.id);
      setTitle(item.title || "");
      setDescription(item.description || "");
      try { setNetworks(JSON.parse(item.networks)); } catch { setNetworks([]); }
      setContentType(item.contentType);
      setFormat(item.format);
      setStatus(item.status);
      setPublishDate(item.publishDate ? new Date(item.publishDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    } else {
      setEditId(null);
      setTitle("");
      setDescription("");
      setNetworks(["LinkedIn"]);
      setContentType("Informativo");
      setFormat("Post estático");
      setStatus("PENDIENTE");
      setPublishDate(new Date().toISOString().split("T")[0]);
    }
    setShowModal(true);
  };

  const toggleNetwork = (net: string) => {
    if (networks.includes(net)) setNetworks(networks.filter(n => n !== net));
    else setNetworks([...networks, net]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (networks.length === 0) {
      alert("Selecciona al menos una red social.");
      return;
    }
    setSaving(true);
    
    try {
      const url = editId ? `/api/social-content/${editId}` : "/api/social-content";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, networks, contentType, format, publishDate, status })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Error al guardar el contenido.");
      }
      
      setShowModal(false);
      fetchContent();
    } catch (e: any) { 
      alert("Error en la solicitud: " + e.message);
      console.error(e); 
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/social-content/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchContent();
    } catch (e) { console.error(e); }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 size={24} className="text-primary" />
            Gestión de Contenido en Redes
          </h1>
          <p className="text-text-muted text-sm mt-1">Organización y calendario de publicaciones sociales (LinkedIn, IG, FB, YT).</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 shadow-sm whitespace-nowrap">
          <Plus size={16} />
          Nueva Publicación
        </button>
      </div>

      <div className="card w-full flex flex-col items-stretch overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left align-middle border-collapse min-w-[1000px]">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="py-4 px-5 font-semibold text-text-muted">Despliegue</th>
                <th className="py-4 px-5 font-semibold text-text-muted">Redes</th>
                <th className="py-4 px-5 font-semibold text-text-muted">Clasificación</th>
                <th className="py-4 px-5 font-semibold text-text-muted">Formatos</th>
                <th className="py-4 px-5 font-semibold text-text-muted text-center w-32">Estado</th>
                <th className="py-4 px-5 font-semibold text-text-muted text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && contents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                     <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20}/> Cargando publicaciones...</span>
                  </td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                    No hay contenido programado.
                  </td>
                </tr>
              ) : (
                contents.map((item, idx) => {
                  let netArr: string[] = [];
                  try { netArr = JSON.parse(item.networks); } catch {}
                  
                  return (
                    <tr key={item.id} className="border-b border-border-light hover:bg-surface/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">
                            {new Date(item.publishDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                          </span>
                          <span className="text-xs text-text-muted font-medium">{item.title || "Sin título definido"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-2 items-center flex-wrap">
                          {netArr.map(n => (
                            <span key={n} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-primary border border-primary/20 bg-primary/10 tracking-widest flex items-center gap-1">
                              {n === "YouTube" && <PlaySquare size={12} />}
                              {n === "Instagram" && <Camera size={12} />}
                              {n === "Facebook" && <Globe size={12} />}
                              {n === "LinkedIn" && <Share2 size={12} />}
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-text-muted font-medium">
                        {item.contentType}
                      </td>
                      <td className="py-4 px-5 font-medium">
                        {item.format}
                      </td>
                      <td className="py-4 px-5 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                           item.status === 'PENDIENTE' ? 'bg-surface border-border text-text-muted' : 
                           item.status === 'EN PROCESO' ? 'bg-warning/10 border-warning text-warning-hover' : 
                           'bg-success/10 border-success text-success-hover'
                         }`}>
                           {item.status === 'LANZADO' && <CheckCircle size={14} />}
                           {item.status === 'EN PROCESO' && <Loader2 size={14} className="animate-spin" />}
                           {item.status === 'PENDIENTE' && <Clock size={14} />}
                           {item.status}
                         </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap align-middle">
                         {deleteId === item.id ? (
                           <div className="inline-flex items-center gap-1.5 bg-danger/10 px-2 py-1 rounded shadow-sm border border-danger/20">
                             <button onClick={() => handleDelete(item.id)} className="text-danger font-bold hover:underline text-xs px-2">Borrar</button>
                             <button onClick={() => setDeleteId(null)} className="text-text-muted font-bold hover:underline text-xs px-2 border-l border-danger/20">Atrás</button>
                           </div>
                         ) : (
                           <>
                             <button onClick={() => openForm(item)} className="p-2 hover:bg-info/10 hover:text-info rounded-lg text-text-muted transition-colors border-2 border-transparent hover:border-info/20 shadow-sm"><Pencil size={18} /></button>
                             <button onClick={() => setDeleteId(item.id)} className="p-2 hover:bg-danger/10 hover:text-danger rounded-lg text-text-muted transition-colors border-2 border-transparent hover:border-danger/20 shadow-sm"><Trash2 size={18} /></button>
                           </>
                         )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl w-[90%] max-w-2xl p-6 shadow-2xl" 
               style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, maxHeight: '90vh', overflowY: 'auto' }}
               onClick={e => e.stopPropagation()}>
               <h2 className="text-xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-2">
                 <Calendar className="text-primary" />
                 {editId ? "Editar Publicación Programada" : "Programar Nueva Publicación"}
               </h2>

               <form onSubmit={handleSave} className="space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="col-span-1 md:col-span-2">
                     <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Título del Contenido o Webinar *</label>
                     <input required type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Webinar 'Cómo Optimizar CRM...'" />
                   </div>
                   
                   <div className="col-span-1 md:col-span-2">
                     <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Copy / Descripción</label>
                     <textarea className="input-field min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} placeholder="Borrador de texto, hashtags o instrucciones para el equipo de diseño..." />
                   </div>

                   <div>
                     <label className="block text-xs font-semibold mb-2 text-text-muted uppercase tracking-wide">Redes Sociales (Multiselección) *</label>
                     <div className="flex flex-col gap-2 p-3 bg-surface border border-border rounded-lg">
                       {["LinkedIn", "Instagram", "Facebook", "YouTube"].map(net => (
                         <label key={net} className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={networks.includes(net)} onChange={() => toggleNetwork(net)} className="w-4 h-4 text-primary rounded border-border focus:ring-primary/20 accent-primary" />
                           <span className="text-sm font-medium group-hover:text-primary transition-colors">{net}</span>
                         </label>
                       ))}
                     </div>
                   </div>

                   <div>
                     <div className="mb-4">
                       <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Tipo de Contenido *</label>
                       <select className="input-field" value={contentType} onChange={e => setContentType(e.target.value)}>
                         <option>Informativo</option>
                         <option>Educativo</option>
                         <option>Inspirador</option>
                         <option>Promocional</option>
                         <option>Grabación / Evento</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Formato Visual *</label>
                       <select className="input-field" value={format} onChange={e => setFormat(e.target.value)}>
                         <option>Post estático</option>
                         <option>Carrusel</option>
                         <option>Reel / Video Corto</option>
                         <option>Video Largo</option>
                         <option>Artículo (LinkedIn)</option>
                         <option>Historia</option>
                       </select>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Fecha de Lanzamiento *</label>
                     <input required type="date" className="input-field" value={publishDate} onChange={e => setPublishDate(e.target.value)} />
                   </div>
                   
                   <div>
                     <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Estado *</label>
                     <select className="input-field font-bold" value={status} onChange={e => setStatus(e.target.value)}>
                       <option value="PENDIENTE">PENDIENTE (Programado/Ideal)</option>
                       <option value="EN PROCESO">EN PROCESO (Diseñando/Editando)</option>
                       <option value="LANZADO">LANZADO (Publicado)</option>
                     </select>
                   </div>
                 </div>

                 <div className="flex gap-4 pt-4 mt-2">
                   <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3 font-bold" disabled={saving}>Cancelar</button>
                   <button type="submit" className="btn-primary flex-1 py-3 font-bold flex items-center justify-center gap-2 text-lg shadow-sm" disabled={saving}>
                     {saving && <Loader2 size={18} className="animate-spin" />}
                     {saving ? "Registrando..." : "Guardar Ficha en Parrilla"}
                   </button>
                 </div>
               </form>

             </div>
        </>
      )}

    </>
  );
}
