"use client";

const mockGoals = [
  { id: 1, description: "Auditoría de procesos RRHH", type: "MENSUAL", completed: true },
  { id: 2, description: "Evaluación de riesgos operativos", type: "SEMANAL", completed: true },
  { id: 3, description: "Revisión de cumplimiento normativo", type: "MENSUAL", completed: false },
  { id: 4, description: "Informe de diagnóstico inicial", type: "SEMANAL", completed: false },
  { id: 5, description: "Capacitación al equipo de operaciones", type: "MENSUAL", completed: false },
  { id: 6, description: "Levantamiento de observaciones", type: "SEMANAL", completed: true },
  { id: 7, description: "Presentación de avances al directorio", type: "MENSUAL", completed: false },
];

export default function ConsultorObjetivos() {
  const completedCount = mockGoals.filter((g) => g.completed).length;
  const totalCount = mockGoals.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Objetivos</h1>
        <p className="text-text-muted text-sm mt-1">Sigue tu progreso semanal y mensual</p>
      </div>

      {/* Progress Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="var(--surface)" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="var(--primary)"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.64} ${264 - percentage * 2.64}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{percentage}%</span>
              <span className="text-xs text-text-muted">Completado</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">Avance del Mes</h2>
            <p className="text-text-muted text-sm mt-1">
              {completedCount} de {totalCount} objetivos completados
            </p>
            <div className="flex gap-4 mt-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-info/10 text-info">
                {mockGoals.filter((g) => g.type === "SEMANAL").length} Semanales
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-warning/10 text-warning">
                {mockGoals.filter((g) => g.type === "MENSUAL").length} Mensuales
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">📝 Lista de Objetivos</h2>
        <div className="space-y-2">
          {mockGoals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                goal.completed ? "bg-success/5" : "bg-surface hover:bg-surface-hover"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  goal.completed
                    ? "bg-success border-success text-white"
                    : "border-border"
                }`}
              >
                {goal.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm flex-1 ${goal.completed ? "line-through text-text-muted" : "font-medium"}`}>
                {goal.description}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  goal.type === "SEMANAL" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                }`}
              >
                {goal.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
