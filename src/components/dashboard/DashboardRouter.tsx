"use client";

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

const viewMap: Record<string, Record<string, React.FC>> = {
  CONSULTOR: {
    dashboard: ConsultorDashboard,
    "proyectos-consultor": ConsultorProyectos,
    jornada: ConsultorJornada,
    informes: ConsultorInformes,
    "calendario-consultor": ConsultorCalendario,
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
    // Admin can see all consultor/client views too
    jornada: ConsultorJornada,
    objetivos: ConsultorObjetivos,
    informes: ConsultorInformes,
  },
};

export default function DashboardRouter() {
  const { userRole, currentView } = useAuth();

  const roleViews = viewMap[userRole] || {};
  const ViewComponent = roleViews[currentView] || roleViews["dashboard"];

  if (!ViewComponent) return null;

  return <ViewComponent />;
}
