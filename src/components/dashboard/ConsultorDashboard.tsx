"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Clock,
  CheckCircle2,
  FileText,
  Target,
  TrendingUp,
  CalendarDays,
  CalendarClock,
  Loader2,
} from "lucide-react";

interface ProjectData {
  id: string;
  name: string;
  totalGoals: number;
  completedGoals: number;
  progress: number;
  totalHours: number;
}

interface CalendarNote {
  id: string;
  description: string;
  date: string;
}

export default function ConsultorDashboard() {
  const { userId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [upcomingActivities, setUpcomingActivities] = useState<CalendarNote[]>([]);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch projects (includes goals + timeLogs)
      const projRes = await fetch(`/api/consultant/projects?consultantId=${userId}`);
      const projData = await projRes.json();
      const projects: ProjectData[] = projData.projects || [];

      // Calculate global totals from all projects
      let hours = 0;
      let goals = 0;
      let completed = 0;
      projects.forEach((p) => {
        hours += p.totalHours;
        goals += p.totalGoals;
        completed += p.completedGoals;
      });
      setTotalHours(Math.round(hours * 10) / 10);
      setTotalGoals(goals);
      setCompletedGoals(completed);
      setGlobalProgress(goals === 0 ? 0 : Math.round((completed / goals) * 100));

      // Fetch reports count
      const repRes = await fetch(`/api/consultant/reports?consultantId=${userId}`);
      const repData = await repRes.json();
      setTotalReports((repData.reports || []).length);

      // Fetch calendar activities (upcoming)
      const calRes = await fetch(`/api/consultant/calendar?consultantId=${userId}`);
      const calData = await calRes.json();
      const allNotes: CalendarNote[] = calData.notes || [];
      const todayStr = new Date().toLocaleDateString("en-CA").split("T")[0];
      const upcoming = allNotes
        .filter((n) => {
          const dbDateStr = n.date.substring(0, 10);
          return dbDateStr >= todayStr;
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3);
      setUpcomingActivities(upcoming);
    } catch (e) {
      console.error("Dashboard fetch error", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-text-muted gap-3">
        <Loader2 size={24} className="animate-spin" />
        Cargando tu Dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "Total de horas trabajadas",
      value: `${totalHours}h`,
      icon: <Clock size={28} strokeWidth={1.8} />,
      sub: "Acumuladas en todos tus proyectos",
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "Objetivos completados",
      value: `${completedGoals}`,
      icon: <CheckCircle2 size={28} strokeWidth={1.8} />,
      sub: `${globalProgress}% de avance global`,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Avance global",
      value: `${globalProgress}%`,
      icon: <TrendingUp size={28} strokeWidth={1.8} />,
      sub: `${completedGoals} de ${totalGoals} objetivos`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Informes subidos",
      value: `${totalReports}`,
      icon: <FileText size={28} strokeWidth={1.8} />,
      sub: totalReports === 0 ? "Sin informes aún" : "Informes en el sistema",
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Panel del Consultor</h1>
        <p className="text-text-muted text-sm mt-1">
          Resumen de tu actividad —{" "}
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid — 2x2 large cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="card flex items-center gap-5 p-6 animate-scale-in"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}
            >
              {stat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-3xl font-black leading-tight">{stat.value}</p>
              <p className="text-sm text-text-muted font-semibold mt-0.5">
                {stat.label}
              </p>
              <p className={`text-xs font-bold mt-1 ${stat.color}`}>
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target size={20} className="text-primary" /> Progreso Global de
            Objetivos
          </h2>
          <span className="text-2xl font-black text-primary">
            {globalProgress}%
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          {completedGoals} de {totalGoals} objetivos completados en todos tus
          proyectos
        </p>
      </div>

      {/* Upcoming Activities */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CalendarClock size={20} className="text-primary" /> Actividades
          Próximas del Calendario
        </h2>
        {upcomingActivities.length > 0 ? (
          <div className="space-y-3">
            {upcomingActivities.map((act) => {
              const actDateStr = act.date.substring(0, 10);
              const dateObj = new Date(actDateStr + "T12:00:00Z");
              const todayStr = new Date().toLocaleDateString("en-CA").split("T")[0]; // yyyy-mm-dd
              const isToday = actDateStr === todayStr;
              return (
                <div
                  key={act.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    isToday
                      ? "bg-primary/5 border-primary/20"
                      : "bg-surface/50 border-border"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isToday
                        ? "bg-primary text-white"
                        : "bg-surface text-text-muted border border-border"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase leading-none">
                      {dateObj.toLocaleDateString("es-ES", { month: "short" })}
                    </span>
                    <span className="text-lg font-black leading-tight">
                      {dateObj.getUTCDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {act.description}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {isToday ? "📌 Hoy" : dateObj.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC"
                      })}
                    </p>
                  </div>
                  {isToday && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 text-text-muted">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              No tienes actividades próximas registradas.
            </p>
            <p className="text-xs mt-1">
              Registra actividades desde tu Calendario para verlas aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
