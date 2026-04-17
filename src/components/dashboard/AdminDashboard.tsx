"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FolderKanban, Users, Building2, Briefcase, UserPlus, CalendarDays, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { setCurrentView, userName, userRole, userId } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: "0",
    consultants: "0",
    clients: "0",
    newProspects: "0"
  });
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProcess: 0
  });
  const [loading, setLoading] = useState(true);

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    CONSULTOR: "Consultor",
    CLIENTE: "Cliente",
  };

  useEffect(() => {
    if (!userId) return;

    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats({
            activeProjects: String(data.stats.totalProjects),
            consultants: String(data.stats.totalConsultants),
            clients: String(data.stats.totalClients),
            newProspects: String(data.stats.newProspects)
          });
        }
      });

    // Fetch Admin Calendar notes
    fetch("/api/admin/notes", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        const notes = data.notes || [];
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        const upcoming = notes
          .filter((n: any) => {
            const dbDateStr = n.date.substring(0, 10);
            return dbDateStr >= todayStr;
          })
          .sort((a: any, b: any) => a.date.localeCompare(b.date))
          .slice(0, 3);
        setUpcomingActivities(upcoming);
      });

    // Fetch all Weekly Tasks for overall system health
    fetch("/api/weekly-tasks", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.tasks) {
          const completed = data.tasks.filter((t: any) => t.status === "COMPLETADO").length;
          const pending = data.tasks.filter((t: any) => t.status === "PENDIENTE").length;
          const inProcess = data.tasks.filter((t: any) => t.status === "EN_PROCESO").length;
          setTaskStats({
            total: data.tasks.length,
            completed,
            pending,
            inProcess
          });
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const statCards = [
    { label: "Proyectos Activos", value: stats.activeProjects, icon: <FolderKanban size={26} strokeWidth={1.5} />, color: "#b4c307" },
    { label: "Consultores", value: stats.consultants, icon: <Users size={26} strokeWidth={1.5} />, color: "#b4c307" },
    { label: "Clientes Activos", value: stats.clients, icon: <Building2 size={26} strokeWidth={1.5} />, color: "#b4c307" },
    { label: "Prospectos Nuevos", value: stats.newProspects, icon: <Briefcase size={26} strokeWidth={1.5} />, color: "#b4c307" },
  ];

  // Real task stats from weekly tasks for this user
  const completedPct = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with user info */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Panel de Administración
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", marginTop: "4px" }}>
            Vista general de la operación — APM Group
          </p>
        </div>
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
            style={{ background: "#b4c307" }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-sm leading-tight" style={{ color: "#111" }}>{userName}</p>
            <p className="text-xs leading-tight" style={{ color: "#94a3b8" }}>{roleLabels[userRole]}</p>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "rgba(180,195,7,0.12)", color: "#8fa005", border: "1px solid rgba(180,195,7,0.25)" }}
          >
            {roleLabels[userRole]}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "#111", lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>{stat.label}</p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(180,195,7,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Activities Table */}
      <div
        style={{
          background: "white",
          border: "3px solid #b4c307",
          borderRadius: "14px",
          padding: "1.5rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <h2 className="flex items-center gap-2" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111", marginBottom: "1rem" }}>
          <CalendarDays size={20} style={{ color: "#b4c307" }} />
          Actividades próximas del calendario
        </h2>
        {loading ? (
          <div className="flex items-center justify-center p-8 gap-2" style={{ color: "#94a3b8" }}>
            <Loader2 size={20} className="animate-spin" /> Cargando actividades...
          </div>
        ) : upcomingActivities.length > 0 ? (
          <div style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {upcomingActivities.map((act) => {
                  const actDateStr = act.date.substring(0, 10);
                  const dateObj = new Date(actDateStr + "T12:00:00Z");
                  const dayNum = dateObj.getUTCDate();
                  const monthShort = dateObj.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" }).toUpperCase();
                  const timeStr = "10:00 AM";

                  return (
                    <tr key={act.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 1rem", color: "#334155", fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {dayNum} {monthShort}, {timeStr}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#111", fontSize: "0.85rem", fontWeight: 600 }}>
                        {act.title}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#64748b", fontSize: "0.85rem" }}>
                        {act.description || "—"}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                        <span className="inline-flex items-center gap-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#22c55e", display: "inline-block" }}
                          />
                          <span style={{ color: "#334155" }}>Estado: Programado</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8" style={{ color: "#94a3b8", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
            <p>No hay actividades programadas próximas.</p>
          </div>
        )}
      </div>

      {/* Bottom Section: Task Summary + Quick Actions */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between w-full items-stretch">
        {/* Task Summary with donut chart */}
        <div
          className="flex items-center justify-center gap-10"
          style={{
            flex: "1 1 45%",
            maxWidth: "520px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "2rem 3rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* Donut chart */}
          <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#b4c307"
                strokeWidth="4"
                strokeDasharray={`${completedPct}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111" }}>{completedPct}%</span>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111" }}>Resumen de Tareas</p>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "12px" }}>System Health</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} />
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Completadas: <strong style={{ color: "#111" }}>{taskStats.completed}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#eab308" }} />
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Pendientes: <strong style={{ color: "#111" }}>{taskStats.pending}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#d1d5db" }} />
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>En Progreso: <strong style={{ color: "#111" }}>{taskStats.inProcess}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Flex Container */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ flex: "1 1 50%" }}>

        {/* Quick Action: Crear Usuario */}
        <button
          onClick={() => setCurrentView("usuarios")}
          style={{
            background: "white",
            border: "3px solid #b4c307",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8fa005"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#b4c307"; }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(180,195,7,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b4c307", marginBottom: "12px" }}>
            <UserPlus size={22} strokeWidth={1.5} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>Crear Usuario</p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>Crear usuario como variante al administrador.</p>
        </button>

        {/* Quick Action: Nuevo Proyecto */}
        <button
          onClick={() => setCurrentView("proyectos")}
          style={{
            background: "white",
            border: "3px solid #b4c307",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8fa005"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#b4c307"; }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(180,195,7,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b4c307", marginBottom: "12px" }}>
            <FolderKanban size={22} strokeWidth={1.5} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>Nuevo Proyecto</p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>Consultores van proyecto administración.</p>
        </button>

        {/* Quick Action: CRM Prospectos */}
        <button
          onClick={() => setCurrentView("prospectos")}
          style={{
            background: "white",
            border: "3px solid #b4c307",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8fa005"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#b4c307"; }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(180,195,7,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b4c307", marginBottom: "12px" }}>
            <Briefcase size={22} strokeWidth={1.5} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>CRM Prospectos</p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>Prospectos administración y administrador.</p>
        </button>
        </div>
      </div>
    </div>
  );
}
