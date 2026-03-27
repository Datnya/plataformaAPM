"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock, Users, MapPin, FileText, FileUp, Loader2, Save } from "lucide-react";

export default function ConsultorJornada() {
  const { userId } = useAuth();
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const [projectId, setProjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [modality, setModality] = useState<"PRESENCIAL" | "REMOTO">("PRESENCIAL");
  const [inHour, setInHour] = useState("09");
  const [inMin, setInMin] = useState("00");
  const [inAmPm, setInAmPm] = useState("AM");

  const [outHour, setOutHour] = useState("06");
  const [outMin, setOutMin] = useState("00");
  const [outAmPm, setOutAmPm] = useState("PM");
  const [areasVisited, setAreasVisited] = useState("");
  const [peopleMet, setPeopleMet] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`/api/consultant/projects?consultantId=${userId}`);
      const data = await res.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      if (data.projects && data.projects.length > 0) {
        setProjectId(data.projects[0].id);
      }
    } catch {
      setProjects([]);
    }
    setLoadingProjects(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      setUploadedFiles(prev => [...prev, { name: data.name, url: data.url }]);
      setSuccessMsg("Archivo subido correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
    e.target.value = ""; // reset input
  };

  const isFormValid = projectId && selectedDate && areasVisited && peopleMet && description && uploadedFiles.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMsg("Completa todos los campos antes de registrar.");
      return;
    }

    // Convert to 24-hours for checkIn
    let inH = parseInt(inHour);
    if (inAmPm === "PM" && inH !== 12) inH += 12;
    if (inAmPm === "AM" && inH === 12) inH = 0;
    const finalCheckIn = `${inH.toString().padStart(2, "0")}:${inMin}`;

    // Convert to 24-hours for checkOut
    let outH = parseInt(outHour);
    if (outAmPm === "PM" && outH !== 12) outH += 12;
    if (outAmPm === "AM" && outH === 12) outH = 0;
    const finalCheckOut = `${outH.toString().padStart(2, "0")}:${outMin}`;

    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/jornada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          consultantId: userId,
          date: selectedDate,
          modality,
          checkInTime: finalCheckIn,
          checkOutTime: finalCheckOut,
          areasVisited,
          peopleMet,
          description,
          fileUrls: uploadedFiles.map((f) => f.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar la jornada.");
      
      setSuccessMsg("¡Jornada registrada correctamente!");
      setIsSuccess(true);
      
      // Reset form
      setSelectedDate(new Date().toLocaleDateString('en-CA'));
      setInHour("09");
      setInMin("00");
      setInAmPm("AM");
      setOutHour("06");
      setOutMin("00");
      setOutAmPm("PM");
      setAreasVisited("");
      setPeopleMet("");
      setDescription("");
      setUploadedFiles([]);
      setTimeout(() => {
         setSuccessMsg("");
         setIsSuccess(false);
      }, 5000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative pb-10">
      <div>
        <h1 className="text-2xl font-bold">Registro de Mi Jornada</h1>
        <p className="text-text-muted text-sm mt-1">
          Completa este formulario para registrar tus horas y evidencias del día.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm font-semibold p-4 rounded-lg animate-scale-in flex items-start gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-success/10 border border-success/30 text-success font-semibold text-sm p-4 rounded-lg animate-scale-in flex items-start gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      <div className="card space-y-6">
        {/* Proyecto & Modalidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Proyecto Asignado</label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-text-muted py-2">
                <Loader2 size={16} className="animate-spin" /> Cargando proyectos...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-danger font-medium p-2 bg-danger/10 rounded border border-danger/20">
                No tienes proyectos asignados.
              </div>
            ) : (
              <select 
                className="input-field cursor-pointer" 
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Modalidad de Trabajo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModality("PRESENCIAL")}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all
                  ${modality === "PRESENCIAL" ? "bg-primary text-white border-primary" : "bg-surface border-border hover:border-primary/40 text-text-light"}`}
              >
                🏢 Presencial
              </button>
              <button
                onClick={() => setModality("REMOTO")}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all
                  ${modality === "REMOTO" ? "bg-primary text-white border-primary" : "bg-surface border-border hover:border-primary/40 text-text-light"}`}
              >
                🏠 Remoto
              </button>
            </div>
          </div>
        </div>

        {/* Timings and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 border-b border-border">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <Clock size={16} className="text-primary" /> Fecha de Registro
            </label>
            <input 
              type="date" 
              className="input-field cursor-pointer" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {/* Hora de Ingreso */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <Clock size={16} className="text-primary" /> Hora de Ingreso
            </label>
            <div className="flex gap-2">
              <select className="input-field flex-1 cursor-pointer text-center" value={inHour} onChange={e => setInHour(e.target.value)}>
                {Array.from({length: 12}, (_, i) => {
                  const val = (i + 1).toString().padStart(2, "0");
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <select className="input-field flex-1 cursor-pointer text-center" value={inMin} onChange={e => setInMin(e.target.value)}>
                {Array.from({length: 60}, (_, i) => {
                  const val = i.toString().padStart(2, "0");
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <select className="input-field flex-1 cursor-pointer text-center bg-primary/5 font-bold" value={inAmPm} onChange={e => setInAmPm(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Hora de Salida */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <Clock size={16} className="text-primary" /> Hora de Salida
            </label>
            <div className="flex gap-2">
              <select className="input-field flex-1 cursor-pointer text-center" value={outHour} onChange={e => setOutHour(e.target.value)}>
                {Array.from({length: 12}, (_, i) => {
                  const val = (i + 1).toString().padStart(2, "0");
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <select className="input-field flex-1 cursor-pointer text-center" value={outMin} onChange={e => setOutMin(e.target.value)}>
                {Array.from({length: 60}, (_, i) => {
                  const val = i.toString().padStart(2, "0");
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <select className="input-field flex-1 cursor-pointer text-center bg-primary/5 font-bold" value={outAmPm} onChange={e => setOutAmPm(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="space-y-4 border-b border-border pb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <MapPin size={16} className="text-primary" /> Áreas Visitadas
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej: RRHH, Gerencia General, Operaciones"
              value={areasVisited}
              onChange={(e) => setAreasVisited(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <Users size={16} className="text-primary" /> Personas con las que se reunió
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej: Juan Pérez (Gerente), Ana López (Analista)"
              value={peopleMet}
              onChange={(e) => setPeopleMet(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <FileText size={16} className="text-primary" /> Descripción del avance u observaciones
            </label>
            <textarea 
              className="input-field min-h-[100px] resize-y" 
              placeholder="Describe detalladamente las tareas realizadas, avances obtenidos o bloqueos encontrados..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* EVIDENCIAS */}
        <div className="pt-2">
          <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
            <FileUp size={16} className="text-primary" /> Adjuntar Evidencias (Obligatorio)
          </label>
          <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer relative bg-surface overflow-hidden group">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={handleFileUpload}
            />
            {loading ? (
              <div className="animate-spin text-3xl mb-3 text-primary flex justify-center"><Loader2 size={32} /></div>
            ) : (
              <div className="text-primary/60 mb-3 group-hover:scale-110 transition-transform flex justify-center"><FileUp size={36} /></div>
            )}
            <p className="text-sm font-medium">
              Arrastra archivos aquí o <span className="text-primary font-semibold">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Sube fotos, reportes o PDFs para validar la jornada (Máx. 25MB).
            </p>
          </label>

          {/* Uploaded Files Grid */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-surface/50 border border-border-light rounded-lg text-sm text-text-muted">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-success flex-shrink-0">✓</span>
                    <span className="truncate font-medium">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          disabled={!isFormValid || loading || loadingProjects || isSuccess} 
          onClick={handleSubmit} 
          className={`w-full sm:w-auto py-3 px-8 text-base rounded-xl font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
            isSuccess 
            ? "bg-success text-white ring-2 ring-success/50" 
            : "bg-primary text-white hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {loading && <Loader2 size={20} className="animate-spin" />}
          {isSuccess && <span className="text-xl">✓</span>}
          {!loading && !isSuccess && <Save size={20} />}
          {loading ? "Guardando Jornada..." : isSuccess ? "¡Registrada Exitosamente!" : "Registrar Jornada Completa"}
        </button>
      </div>
    </div>
  );
}
