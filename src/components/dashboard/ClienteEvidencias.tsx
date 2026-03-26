"use client";

import { useState } from "react";

const mockEvidences = [
  { id: 1, date: "2026-03-23", type: "Evidencia Diaria", consultant: "Carlos Mendoza", files: 3 },
  { id: 2, date: "2026-03-22", type: "Evidencia Diaria", consultant: "Carlos Mendoza", files: 5 },
  { id: 3, date: "2026-03-20", type: "Informe Semanal", consultant: "Carlos Mendoza", files: 1 },
  { id: 4, date: "2026-03-15", type: "Evidencia Diaria", consultant: "Carlos Mendoza", files: 4 },
  { id: 5, date: "2026-03-01", type: "Informe Mensual", consultant: "Carlos Mendoza", files: 1 },
];

export default function ClienteEvidencias() {
  const [filterType, setFilterType] = useState("Todos");
  const [filterDate, setFilterDate] = useState("");

  const filtered = mockEvidences.filter((e) => {
    if (filterType !== "Todos" && e.type !== filterType) return false;
    if (filterDate && e.date < filterDate) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Evidencias e Informes</h1>
        <p className="text-text-muted text-sm mt-1">Consulta y descarga la documentación de tu proyecto</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5">Tipo de documento</label>
            <select
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>Todos</option>
              <option>Evidencia Diaria</option>
              <option>Informe Semanal</option>
              <option>Informe Mensual</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5">Desde fecha</label>
            <input
              type="date"
              className="input-field"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="text-left py-3 px-4 font-semibold text-text-muted">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-text-muted">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-text-muted hidden sm:table-cell">Consultor</th>
                <th className="text-left py-3 px-4 font-semibold text-text-muted">Archivos</th>
                <th className="text-right py-3 px-4 font-semibold text-text-muted">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border-light hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{e.date}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      e.type === "Evidencia Diaria"
                        ? "bg-primary/10 text-primary-hover"
                        : e.type === "Informe Semanal"
                        ? "bg-info/10 text-info"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {e.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted hidden sm:table-cell">{e.consultant}</td>
                  <td className="py-3 px-4 text-text-muted">{e.files} archivo{e.files > 1 ? "s" : ""}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="btn-secondary text-xs py-1.5 px-3">
                      ⬇ Descargar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No se encontraron documentos con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
