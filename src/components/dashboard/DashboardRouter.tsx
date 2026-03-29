"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ConsultorDashboard from "@/components/dashboard/ConsultorDashboard";
import ClienteDashboard from "@/components/dashboard/ClienteDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ConsultorJornada from "@/components/dashboard/ConsultorJornada";
import ConsultorObjetivos from "@/components/dashboard/ConsultorObjetivos";
import ConsultorInformes from "@/components/dashboard/ConsultorInformes";
import ConsultorProyectos from "@/components/dashboard/ConsultorProyectos";
import ConsultorCalendario from "@/components/dashboard/ConsultorCalendario";
import ClienteProyecto from "@/components/dashboard/ClienteProyecto";
import ClienteEvidencias from "@/components/dashboard/ClienteEvidencias";
import AdminUsuarios from "@/components/dashboard/AdminUsuarios";
import AdminProyectos from "@/components/dashboard/AdminProyectos";
import AdminProspectos from "@/components/dashboard/AdminProspectos";
import AdminConsultorGoals from "@/components/dashboard/AdminConsultorGoals";
import AdminCalendario from "@/components/dashboard/AdminCalendario";
import AdminControlClientes from "@/components/dashboard/AdminControlClientes";
import AdminSocialContent from "@/components/dashboard/AdminSocialContent";
import AdminManualUsuario from "@/components/dashboard/AdminManualUsuario";
import ConsultorManualUsuario from "@/components/dashboard/ConsultorManualUsuario";
import AdminCertificados from "@/components/dashboard/AdminCertificados";

const viewMap: Record<string, Record<string, React.FC>> = {
  CONSULTOR: {
    dashboard: ConsultorDashboard,
    "proyectos-consultor": ConsultorProyectos,
    jornada: ConsultorJornada,
    informes: ConsultorInformes,
    "calendario-consultor": ConsultorCalendario,
    "manual-consultor": ConsultorManualUsuario,
  },
  CLIENTE: {
    dashboard: ClienteDashboard,
    proyecto: ClienteProyecto,
    evidencias: ClienteEvidencias,
  },
  ADMIN: {
    dashboard: AdminDashboard,
    usuarios: AdminUsuarios,
    proyectos: AdminProyectos,
    prospectos: AdminProspectos,
    "control-clientes": AdminControlClientes,
    "consultant-goals": AdminConsultorGoals,
    calendario: AdminCalendario,
    redes: AdminSocialContent,
    manual: AdminManualUsuario,
    certificados: AdminCertificados,
    // Admin can see consultor views too
    jornada: ConsultorJornada,
    objetivos: ConsultorObjetivos,
    informes: ConsultorInformes,
  },
};

/**
 * Keep-alive router: components mount once on first visit and stay mounted
 * (hidden via CSS) on subsequent navigations. This eliminates the ~5s reload
 * caused by unmounting + remounting + re-fetching data on every nav click.
 */
export default function DashboardRouter() {
  const { userRole, currentView } = useAuth();
  const roleViews = viewMap[userRole] || {};

  // Track which views have been visited so we only mount them on first access
  const [mountedViews, setMountedViews] = useState<Set<string>>(
    () => new Set([currentView || "dashboard"])
  );

  useEffect(() => {
    setMountedViews((prev) => {
      if (prev.has(currentView)) return prev;
      const next = new Set(prev);
      next.add(currentView);
      return next;
    });
  }, [currentView]);

  return (
    <>
      {(Object.entries(roleViews) as [string, React.FC][]).map(
        ([view, ViewComponent]) => {
          if (!mountedViews.has(view)) return null;
          return (
            <div
              key={view}
              style={{ display: view === currentView ? "block" : "none" }}
            >
              <ViewComponent />
            </div>
          );
        }
      )}
    </>
  );
}
