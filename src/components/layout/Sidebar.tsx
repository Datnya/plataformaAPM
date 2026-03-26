"use client";

import { useAuth, UserRole } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Clock,
  Target,
  FileText,
  ClipboardList,
  FolderOpen,
  Users,
  FolderKanban,
  Briefcase,
  CalendarDays,
  UserCheck,
  LogOut,
  Share2
} from "lucide-react";

interface NavItem {
  label: string;
  view: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.8} />, roles: ["ADMIN", "CONSULTOR", "CLIENTE"] },
  { label: "Control de Proyectos", view: "proyectos-consultor", icon: <FolderKanban size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Mi Jornada", view: "jornada", icon: <Clock size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Mis Informes", view: "informes", icon: <FileText size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Calendario", view: "calendario-consultor", icon: <CalendarDays size={18} strokeWidth={1.8} />, roles: ["CONSULTOR"] },
  { label: "Resumen del Proyecto", view: "proyecto", icon: <ClipboardList size={18} strokeWidth={1.8} />, roles: ["CLIENTE"] },
  { label: "Evidencias e Informes", view: "evidencias", icon: <FolderOpen size={18} strokeWidth={1.8} />, roles: ["CLIENTE"] },
  { label: "Gestión de Usuarios", view: "usuarios", icon: <Users size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Proyectos", view: "proyectos", icon: <FolderKanban size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Control de Clientes", view: "control-clientes", icon: <UserCheck size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "CRM Prospectos", view: "prospectos", icon: <Briefcase size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Gestión de Redes", view: "redes", icon: <Share2 size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
  { label: "Calendario APM", view: "calendario", icon: <CalendarDays size={18} strokeWidth={1.8} />, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const { userRole, currentView, setCurrentView, setIsAuthenticated } = useAuth();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="fixed top-[var(--navbar-height)] left-0 bottom-0 w-[var(--sidebar-width)] bg-white border-r border-border flex-col z-40 transition-transform duration-300 hidden md:flex">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] uppercase tracking-widest text-text-light font-semibold px-3 mb-3">
          Navegación
        </p>
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = currentView === item.view;

            return (
              <li key={item.view}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left
                    ${
                      isActive
                        ? "bg-primary/10 text-primary-hover font-semibold"
                        : "text-foreground/70 hover:bg-surface hover:text-foreground"
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => {
            setIsAuthenticated(false);
            setCurrentView("dashboard");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
