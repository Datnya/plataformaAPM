import {
  LayoutDashboard,
  Clock,
  FileText,
  ClipboardList,
  FolderOpen,
  Users,
  FolderKanban,
  Briefcase,
  CalendarDays,
  UserCheck,
  Share2,
  BookOpen,
  Award,
} from "lucide-react";
import type { UserRole } from "@/context/AuthContext";

export interface NavItem {
  label: string;
  view: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.8} />, roles: ["ADMIN", "CONSULTOR", "CLIENTE"] },
  { label: "Control de Proyectos", view: "proyectos-consultor", icon: <FolderKanban size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Mi Jornada", view: "jornada", icon: <Clock size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Mis Informes", view: "informes", icon: <FileText size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Calendario", view: "calendario-consultor", icon: <CalendarDays size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Manual de Usuario", view: "manual-consultor", icon: <BookOpen size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Inicio", view: "dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.8} />, roles: ["CLIENTE"] },
  { label: "Resumen del Proyecto", view: "proyecto", icon: <ClipboardList size={18} strokeWidth={1.8} />, roles: ["CLIENTE"] },
  { label: "Evidencias e Informes", view: "evidencias", icon: <FolderOpen size={18} strokeWidth={1.8} />, roles: ["CLIENTE"] },
  { label: "Gestión de Usuarios", view: "usuarios", icon: <Users size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Proyectos", view: "proyectos", icon: <FolderKanban size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Control de Clientes", view: "control-clientes", icon: <UserCheck size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "CRM Prospectos", view: "prospectos", icon: <Briefcase size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Gestión de Redes", view: "redes", icon: <Share2 size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Calendario APM", view: "calendario", icon: <CalendarDays size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Manual de Usuario", view: "manual", icon: <BookOpen size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Generador de Certificados", view: "certificados", icon: <Award size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
];
