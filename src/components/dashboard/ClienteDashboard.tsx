"use client";

const mockGoals = [
  { name: "Auditoría de procesos RRHH", completed: true },
  { name: "Evaluación de riesgos operativos", completed: true },
  { name: "Revisión de cumplimiento normativo", completed: false },
  { name: "Informe de diagnóstico inicial", completed: false },
  { name: "Capacitación al equipo", completed: false },
];

const mockCalendar = [
  { date: "Lun 24", type: "presencial", area: "RRHH" },
  { date: "Mar 25", type: "remoto", area: "Operaciones" },
  { date: "Mié 26", type: "presencial", area: "Gerencia" },
  { date: "Jue 27", type: "remoto", area: "Finanzas" },
  { date: "Vie 28", type: "presencial", area: "RRHH / Operaciones" },
];

export default function ClienteDashboard() {
  const completedCount = mockGoals.filter((g) => g.completed).length;
  const percentage = Math.round((completedCount / mockGoals.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel del Cliente</h1>
        <p className="text-text-muted text-sm mt-1">Resumen del proyecto y actividades de tu consultor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-3xl font-bold text-primary">{percentage}%</p>
          <p className="text-sm text-text-muted font-medium mt-1">Avance General</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-3xl font-bold">{completedCount}/{mockGoals.length}</p>
          <p className="text-sm text-text-muted font-medium mt-1">Objetivos Completados</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📄</div>
          <p className="text-3xl font-bold">3</p>
          <p className="text-sm text-text-muted font-medium mt-1">Informes Disponibles</p>
        </div>
      </div>

      {/* Progress + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">🎯 Progreso de Objetivos</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progreso general</span>
              <span className="text-sm font-bold text-primary-hover">{percentage}%</span>
            </div>
            <div className="h-4 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%`, background: "linear-gradient(90deg, var(--primary), var(--primary-hover))" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {mockGoals.map((goal, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${goal.completed ? "bg-success/5" : "bg-surface"}`}>
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${goal.completed ? "bg-success" : "bg-border"}`} />
                <span className={`text-sm ${goal.completed ? "line-through text-text-muted" : ""}`}>
                  {goal.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">📅 Calendario de Visitas (Esta Semana)</h2>
          <div className="space-y-2">
            {mockCalendar.map((day, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface">
                <div className="w-16 text-center flex-shrink-0">
                  <p className="text-sm font-bold">{day.date}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Área: {day.area}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  day.type === "presencial"
                    ? "bg-primary/10 text-primary-hover"
                    : "bg-info/10 text-info"
                }`}>
                  {day.type === "presencial" ? "🏢 Presencial" : "🏠 Remoto"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
