"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, Loader2, Plus, Download, Filter, Search } from "lucide-react";

interface Prospect {
  id: string;
  companyName: string;
  tradeName?: string;
  industry?: string;
  contactName: string;
  contactRole?: string;
  phone?: string;
  ruc?: string;
  email?: string;
  notes?: string;
  firstContactDate: string;
  lastInteractionDate: string;
  status: "NUEVO" | "CONTACTADO" | "NEGOCIACION" | "CERRADO";
}

const statusOptions = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "CONTACTADO", label: "Contactado" },
  { value: "NEGOCIACION", label: "Negociación" },
  { value: "CERRADO", label: "Cerrado" }
];

export default function AdminProspectos() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form handling
  const [formData, setFormData] = useState<Partial<Prospect>>({
     status: "NUEVO"
  });
  
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/prospects");
      const data = await res.json();
      if (!data.error) {
        const formatted = data.map((d: any) => ({
          ...d,
          firstContactDate: new Date(d.firstContactDate).toISOString().split("T")[0],
          lastInteractionDate: new Date(d.lastInteractionDate).toISOString().split("T")[0],
        }));
        setProspects(formatted);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));

    // Realtime-sync polling logic (cada 15s para cumplir "visible para todos de inmediato")
    const interval = setInterval(() => {
       fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const openForm = (p?: Prospect) => {
    if (p) {
      setEditingId(p.id);
      setFormData(p);
    } else {
      setEditingId(null);
      setFormData({
         companyName: "",
         tradeName: "",
         industry: "",
         contactName: "",
         contactRole: "",
         phone: "",
         ruc: "",
         email: "",
         notes: "",
         status: "NUEVO",
         firstContactDate: new Date().toISOString().split("T")[0]
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName) return;
    setSaving(true);
    
    try {
      const url = editingId ? `/api/prospects/${editingId}` : "/api/prospects";
      const method = editingId ? "PUT" : "POST";

      const { id, createdAt, updatedAt, ...payload } = formData as any;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "API returned an error");
      }
      
      setShowModal(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert("Error guardando el prospecto: " + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setProspects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      await fetch(`/api/prospects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, lastInteractionDate: new Date().toISOString() })
      });
      // Silent re-fetch
      fetchData();
    } catch {}
  };

  const handleExportCSV = () => {
    const headers = ["Razón Social", "Nombre Comercial", "RUC", "Rubro", "Persona de Contacto", "Cargo", "Teléfono", "Correo", "Estado", "Observaciones", "Fecha Captación"];
    
    const rows = prospects.map(p => [
      p.companyName || "",
      p.tradeName || "",
      p.ruc || "",
      p.industry || "",
      p.contactName || "",
      p.contactRole || "",
      p.phone || "",
      p.email || "",
      p.status || "",
      p.notes || "",
      p.firstContactDate || ""
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prospectos_apm_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = prospects.filter(p => 
     p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (p.ruc && p.ruc.includes(searchTerm))
  );

  return (
    <>
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM — Gestión de Prospectos</h1>
          <p className="text-text-muted text-sm mt-1">Control estructurado de clientes potenciales</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 shadow-sm">
          <Plus size={16} />
          Nuevo Prospecto
        </button>
      </div>

      <div className="card w-full flex flex-col items-stretch overflow-hidden">
        {/* Search Bar & Utilities */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por Empresa, Contacto o RUC..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-surface/50 focus:bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-foreground border border-border bg-surface px-4 py-2 rounded-lg transition-colors min-w-max">
            <Download size={14} /> Descargar lista de prospectos
          </button>
        </div>

        {/* Excel-style Table */}
        <div className="overflow-x-auto w-full border border-border rounded-lg shadow-sm bg-white">
          <table className="w-full text-[13px] text-left min-w-[1200px]">
            <thead className="bg-[#f8fafc] text-[#475569] border-b border-border">
              <tr>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Razón Social</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Nombre Comercial</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">RUC</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Rubro</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Persona de Contacto</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Cargo</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Teléfono / Celular</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Correo</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0]">Estado (Pipeline)</th>
                <th className="font-semibold py-3 px-4 border-r border-[#e2e8f0] max-w-[200px]">Observaciones</th>
                <th className="font-semibold py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && prospects.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-text-muted">
                     <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20}/> Cargando base de datos...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-text-muted">
                    No se encontraron prospectos registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => (
                  <tr key={p.id} className={`border-b border-border-light hover:bg-[#f1f5f9] transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                    <td className="py-2.5 px-4 font-bold border-r border-border/50 text-foreground">{p.companyName}</td>
                    <td className="py-2.5 px-4 border-r border-border/50 truncate max-w-[150px]" title={p.tradeName}>{p.tradeName || "—"}</td>
                    <td className="py-2.5 px-4 font-mono text-xs border-r border-border/50 text-text-muted">{p.ruc || "—"}</td>
                    <td className="py-2.5 px-4 border-r border-border/50 truncate max-w-[130px]" title={p.industry}>{p.industry || "—"}</td>
                    <td className="py-2.5 px-4 font-medium border-r border-border/50"><div className="flex items-center gap-1.5"><span className="text-[10px] bg-primary/10 text-primary w-4 h-4 flex items-center justify-center rounded-full">👤</span>{p.contactName}</div></td>
                    <td className="py-2.5 px-4 border-r border-border/50 truncate text-[#64748b]">{p.contactRole || "—"}</td>
                    <td className="py-2.5 px-4 font-mono border-r border-border/50 text-[#64748b] text-[11px]">{p.phone || "—"}</td>
                    <td className="py-2.5 px-4 border-r border-border/50 text-info font-medium text-xs hover:underline cursor-pointer"><a href={`mailto:${p.email}`}>{p.email || "—"}</a></td>
                    <td className="py-2.5 px-4 border-r border-border/50">
                       <select 
                         value={p.status} 
                         onChange={e => handleChangeStatus(p.id, e.target.value)}
                         className={`w-full bg-transparent outline-none cursor-pointer font-bold text-xs ${
                           p.status === "NUEVO" ? "text-primary" : 
                           p.status === "CONTACTADO" ? "text-warning" : 
                           p.status === "NEGOCIACION" ? "text-info" : "text-success"
                         }`}
                       >
                         {statusOptions.map(o => <option key={o.value} value={o.value} className="text-foreground">{o.label}</option>)}
                       </select>
                    </td>
                    <td className="py-2.5 px-4 border-r border-border/50 text-[11px] text-[#64748b] truncate max-w-[150px]" title={p.notes}>{p.notes || "—"}</td>
                    <td className="py-2 px-4 text-center space-x-2 whitespace-nowrap">
                       {deleteId === p.id ? (
                         <div className="inline-flex items-center gap-1.5 bg-danger/10 px-2 py-1 rounded">
                           <button onClick={() => handleDelete(p.id)} className="text-danger font-bold hover:underline text-[10px]">Borrar</button>
                           <button onClick={() => setDeleteId(null)} className="text-text-muted font-bold hover:underline text-[10px]">Refutar</button>
                         </div>
                       ) : (
                         <>
                           <button onClick={() => openForm(p)} className="p-1.5 hover:bg-info/10 hover:text-info rounded text-text-muted transition-colors"><Edit2 size={14} /></button>
                           <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-danger/10 hover:text-danger rounded text-text-muted transition-colors"><Trash2 size={14} /></button>
                         </>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl w-[90%] max-w-3xl p-6 shadow-2xl" 
               style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, maxHeight: '90vh', overflowY: 'auto' }}
               onClick={e => e.stopPropagation()}>
               <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border">
               {editingId ? "Editar Prospecto" : "Registrar Nuevo Prospecto"}
             </h2>

             <form onSubmit={handleSave} className="space-y-6">
                
                {/* Section: Company Data */}
                <div>
                  <h3 className="text-sm font-bold text-primary mb-3">1. Datos de la Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Razón Social *</label>
                      <input required type="text" className="input-field" value={formData.companyName || ""} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Ej. Logra Consulting SAC" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Nombre Comercial</label>
                      <input type="text" className="input-field" value={formData.tradeName || ""} onChange={e => setFormData({...formData, tradeName: e.target.value})} placeholder="Opcional" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">RUC</label>
                      <input type="text" className="input-field" value={formData.ruc || ""} onChange={e => setFormData({...formData, ruc: e.target.value})} placeholder="20000000001" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Rubro / Industria</label>
                      <input type="text" className="input-field" value={formData.industry || ""} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="Minería, Agro, Legal, etc." />
                    </div>
                  </div>
                </div>

                {/* Section: Contact Data */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-primary mb-3">2. Información del Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Representante / Contacto *</label>
                      <input required type="text" className="input-field" value={formData.contactName || ""} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="Nombre de quien te atiende" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Cargo</label>
                      <input type="text" className="input-field" value={formData.contactRole || ""} onChange={e => setFormData({...formData, contactRole: e.target.value})} placeholder="Gerente, Analista..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Número Celular / Telf</label>
                      <input type="tel" className="input-field" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+51 900 000 000" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Correo Electrónico</label>
                      <input type="email" className="input-field" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contacto@empresa.com" />
                    </div>
                  </div>
                </div>

                {/* Section: Status & Extra */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-primary mb-3">3. Evaluación Comercial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Fecha de Captación *</label>
                      <input required type="date" className="input-field" value={formData.firstContactDate || (new Date().toISOString().split("T")[0])} onChange={e => setFormData({...formData, firstContactDate: e.target.value})} />
                    </div>
                    {!editingId && (
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Estado Inicial de Pipeline</label>
                        <select className="input-field font-semibold" value={formData.status || "NUEVO"} onChange={e => setFormData({...formData, status: e.target.value as Prospect["status"]})}>
                          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="col-span-1 md:col-span-2">
                       <label className="block text-xs font-semibold mb-1 text-text-muted uppercase tracking-wide">Observaciones / Contexto de Negociación</label>
                       <textarea 
                         className="input-field min-h-[80px]" 
                         value={formData.notes || ""} 
                         onChange={e => setFormData({...formData, notes: e.target.value})}
                         placeholder="Ingresa notas de valor, cotizaciones ofrecidas o acuerdos pactados con el cliente..."
                       />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5 font-bold" disabled={saving}>Cancelar</button>
                  <button type="submit" className="btn-primary flex-1 py-2.5 font-bold flex items-center justify-center gap-2" disabled={saving}>
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {saving ? "Guardando..." : "Guardar Ficha del Prospecto"}
                  </button>
                </div>

             </form>
          </div>
        </>
      )}

    </>
  );
}
