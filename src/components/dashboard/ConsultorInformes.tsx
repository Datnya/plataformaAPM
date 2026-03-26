"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, FileUp, FileText, Trash2, Download, Eye, X } from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url: string;
  projectId: string;
  projectName: string;
}

export default function ConsultorInformes() {
  const { userId } = useAuth();
  const [tipoInforme, setTipoInforme] = useState("SEMANAL");
  const [projectId, setProjectId] = useState("");
  
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProjects();
      fetchReports();
    }
  }, [userId]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/consultant/reports?consultantId=${userId}`);
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch {
      setReports([]);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`/api/consultant/projects?consultantId=${userId}`);
      const data = await res.json();
      setProjects(data.projects || []);
      if (data.projects && data.projects.length > 0) {
        setProjectId(data.projects[0].id);
      }
    } catch {
      setProjects([]);
    }
    setLoadingProjects(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!projectId) {
      setErrorMsg("Debes seleccionar un proyecto primero.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo.");

      const selectedProject = projects.find(p => p.id === projectId);
      
      const reportData = {
        name: data.name || file.name,
        type: tipoInforme === "SEMANAL" ? "Informe Semanal" : "Informe Mensual",
        date: new Date().toLocaleDateString("es-ES"),
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        url: data.url,
        projectId: projectId,
        projectName: selectedProject?.name || "Desconocido"
      };

      const saveRes = await fetch("/api/consultant/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId: userId, reportData })
      });
      const saveData = await saveRes.json();
      
      if (!saveRes.ok) throw new Error(saveData.error || "Error al guardar el informe");

      setReports([saveData.report, ...reports]);
      setSuccessMsg("Informe subido correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
    e.target.value = "";
  };

  const deleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/consultant/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
        setDeleteConfirmId(null);
      }
    } catch {
       setErrorMsg("Error al eliminar informe");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold border-none">Mis Informes</h1>
        <p className="text-text-muted text-sm mt-1">Sube y gestiona tus informes semanales y mensuales</p>
      </div>

      {/* Upload Form */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileUp size={20} className="text-primary" /> Nuevo Informe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Tipo de Informe</label>
            <select className="input-field cursor-pointer" value={tipoInforme} onChange={(e) => setTipoInforme(e.target.value)}>
              <option value="SEMANAL">Semanal</option>
              <option value="MENSUAL">Mensual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Proyecto</label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-text-muted py-2 border rounded px-3 border-border">
                <Loader2 size={16} className="animate-spin" /> Cargando...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-danger font-medium p-2 bg-danger/10 rounded border border-danger/20">
                No tienes proyectos asignados.
              </div>
            ) : (
              <select className="input-field cursor-pointer" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm font-semibold p-3 rounded-lg mb-4 text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-success/10 border border-success/30 text-success text-sm font-semibold p-3 rounded-lg mb-4 text-center">
            {successMsg}
          </div>
        )}

        <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer relative overflow-hidden group">
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={handleUpload}
            disabled={loading || projects.length === 0}
          />
          {loading ? (
             <div className="animate-spin text-3xl mb-3 text-primary flex justify-center"><Loader2 size={32} /></div>
          ) : (
             <div className="text-primary/60 mb-3 group-hover:scale-110 transition-transform flex justify-center"><FileText size={36} /></div>
          )}
          <p className="text-sm font-medium">
            Arrastra tu informe aquí o <span className="text-primary font-semibold">haz clic para seleccionar</span>
          </p>
          <p className="text-xs text-text-muted mt-1">PDF, Excel, Word — Máx. 25MB</p>
        </label>
      </div>

      {/* Reports Table */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Informes Subidos
        </h2>
        {reports.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface/70">
                  <th className="text-left py-3 px-4 font-semibold text-text-muted text-xs">Nombre y Proyecto</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-muted text-xs">Tipo</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs">Fecha</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-muted text-xs hidden sm:table-cell">Tamaño</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-border-light hover:bg-surface/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <FileText size={14} className="text-text-muted" /> {report.name}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">{report.projectName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                        report.type === "Informe Mensual" 
                          ? "bg-primary/10 text-primary-hover border-primary/20"
                          : "bg-info/10 text-info border-info/20"
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-xs text-text-muted">{report.date}</td>
                    <td className="py-3 px-4 text-center font-medium text-xs text-text-muted hidden sm:table-cell">{report.size}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewUrl(report.url)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Previsualizar"
                        >
                          <Eye size={16} />
                        </button>
                        <a 
                          href={report.url} 
                          download
                          className="p-1.5 text-info hover:bg-info/10 rounded transition-colors inline-flex"
                          title="Descargar"
                        >
                          <Download size={16} />
                        </a>
                        {deleteConfirmId === report.id ? (
                          <div className="flex items-center gap-1 bg-danger/10 p-1 rounded">
                            <button onClick={() => deleteReport(report.id)} className="text-danger text-[10px] font-bold hover:underline">Sí</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-text-muted text-[10px] font-bold hover:underline">No</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(report.id)} 
                            className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-text-muted border border-border border-dashed rounded-xl">
            No tienes informes subidos actualmente.
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye size={18} className="text-primary" /> Previsualización del Documento
              </h2>
              <button onClick={() => setPreviewUrl(null)} className="text-text-muted hover:text-danger p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-surface">
              <iframe src={previewUrl} className="w-full h-full border-none" title="Vista previa del documento" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
