"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FolderKanban, Users, Building2, Briefcase, UserPlus, CalendarDays, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { setCurrentView, setSelectedConsultantId } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: "0",
    consultants: "0",
    clients: "0",
    newProspects: "0"
  });
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
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
    fetch("/api/admin/notes")
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
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Proyectos Activos", value: stats.activeProjects, icon: <FolderKanban size={24} strokeWidth={1.8} />, color: "bg-primary/10 text-primary-hover" },
    { label: "Consultores", value: stats.consultants, icon: <Users size={24} strokeWidth={1.8} />, color: "bg-info/10 text-info" },
    { label: "Clientes Activos", value: stats.clients, icon: <Building2 size={24} strokeWidth={1.8} />, color: "bg-success/10 text-success" },
    { label: "Prospectos Nuevos", value: stats.newProspects, icon: <Briefcase size={24} strokeWidth={1.8} />, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-text-muted text-sm mt-1">Vista general de la operación — APM Group</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-text-muted font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Activities / Actividades próximas del calendario */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CalendarDays size={20} className="text-primary" />
          Actividades próximas del calendario
        </h2>
        {loading ? (
          <div className="flex items-center justify-center p-8 gap-2 text-text-muted">
             <Loader2 size={20} className="animate-spin" /> Cargando actividades...
          </div>
        ) : upcomingActivities.length > 0 ? (
          <div className="space-y-3">
            {upcomingActivities.map(act => {
              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
              const actDateStr = act.date.substring(0, 10);
              const isToday = actDateStr === todayStr;
              
              const dateObj = new Date(actDateStr + "T12:00:00Z"); // middle of day to avoid tz shifts
              
              return (
                <div key={act.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  isToday ? "bg-primary/5 border-primary/20" : "bg-surface/50 border-border"
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                    isToday ? "bg-primary text-white" : "bg-surface text-text-muted border border-border"
                  }`}>
                    <span className="text-[10px] font-bold uppercase leading-none">
                      {dateObj.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" })}
                    </span>
                    <span className="text-lg font-black leading-tight">
                      {dateObj.getUTCDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{act.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {isToday ? "📌 Hoy" : dateObj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}
                    </p>
                  </div>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 text-text-muted border border-border border-dashed rounded-xl">
            <p>No hay actividades programadas próximas.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => setCurrentView("usuarios")} className="card flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer text-left">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary-hover">
            <UserPlus size={22} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-sm">Crear Usuario</p>
            <p className="text-xs text-text-muted">Nuevo consultor o cliente</p>
          </div>
        </button>
        <button onClick={() => setCurrentView("proyectos")} className="card flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer text-left">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary-hover">
            <FolderKanban size={22} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-sm">Nuevo Proyecto</p>
            <p className="text-xs text-text-muted">Asignar consultor a cliente</p>
          </div>
        </button>
        <button onClick={() => setCurrentView("prospectos")} className="card flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer text-left">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary-hover">
            <Briefcase size={22} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-sm">CRM Prospectos</p>
            <p className="text-xs text-text-muted">Gestionar pipeline</p>
          </div>
        </button>
      </div>
    </div>
  );
}
