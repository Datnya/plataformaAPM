"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCheck,
  Briefcase,
  Share2,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Bell,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Zap,
  Star,
  Info,
  UserPlus,
  BarChart3,
  MessageSquare,
  Target,
  Clock,
  FileText,
  X,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const sections = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    color: "bg-primary/10",
    iconColor: "text-primary-hover",
    accent: "#b4c307",
    badge: "Inicio",
    description:
      "Panel de control central con una vista 360° del estado de la empresa en tiempo real.",
    features: [
      { icon: BarChart3, text: "KPIs clave: proyectos activos, consultores, clientes y prospectos nuevos" },
      { icon: CalendarDays, text: "Próximas actividades agendadas en el Calendario APM" },
      { icon: Zap, text: "Acceso rápido a las secciones más utilizadas" },
    ],
    tips: "El Dashboard se actualiza automáticamente al cargar la página. Úsalo como punto de partida cada vez que ingreses.",
  },
  {
    id: "usuarios",
    title: "Gestión de Usuarios",
    icon: Users,
    color: "bg-info/10",
    iconColor: "text-info",
    accent: "#3b82f6",
    badge: "Administración",
    description:
      "Administra todos los usuarios de la plataforma: consultores, clientes y otros administradores.",
    features: [
      { icon: UserPlus, text: "Crear nuevos usuarios asignando rol, empresa y credenciales" },
      { icon: Pencil, text: "Editar datos del perfil y cambiar el estado (Activo / Inactivo)" },
      { icon: Filter, text: "Filtrar usuarios por rol para una gestión más rápida" },
    ],
    tips: "Desactivar un usuario (estado INACTIVO) le impide el acceso sin eliminar su historial.",
    actions: [
      { icon: Plus, label: "Nuevo Usuario", desc: "Abre el formulario de registro" },
      { icon: Pencil, label: "Editar", desc: "Modifica datos del usuario seleccionado" },
      { icon: Trash2, label: "Eliminar", desc: "Elimina el usuario permanentemente" },
    ],
  },
  {
    id: "proyectos",
    title: "Proyectos",
    icon: FolderKanban,
    color: "bg-primary/10",
    iconColor: "text-primary-hover",
    accent: "#b4c307",
    badge: "Operaciones",
    description:
      "Gestiona el ciclo de vida completo de los proyectos: creación, seguimiento y cierre.",
    features: [
      { icon: Plus, text: "Crear proyectos con cliente, consultor asignado, fechas y modalidad" },
      { icon: Target, text: "Seguimiento de objetivos y metas por proyecto" },
      { icon: Eye, text: "Vista detallada del avance y horas registradas por consultor" },
    ],
    tips: "Puedes acceder a la jornada e informes del consultor asignado directamente desde la vista del proyecto.",
    actions: [
      { icon: Plus, label: "Nuevo Proyecto", desc: "Registra un proyecto nuevo" },
      { icon: Eye, label: "Ver Detalle", desc: "Abre el panel del proyecto con métricas completas" },
    ],
  },
  {
    id: "control-clientes",
    title: "Control de Clientes",
    icon: UserCheck,
    color: "bg-success/10",
    iconColor: "text-success",
    accent: "#22c55e",
    badge: "Clientes",
    description:
      "Directorio centralizado de todos los clientes activos con acceso a su información y proyectos asociados.",
    features: [
      { icon: Search, text: "Buscar clientes por nombre o empresa rápidamente" },
      { icon: FileText, text: "Ver proyectos activos e historial de cada cliente" },
      { icon: Bell, text: "Monitoreo del estado de servicio de cada cuenta" },
    ],
    tips: "Mantén los datos de contacto actualizados para que los consultores puedan coordinarse sin fricciones.",
    actions: [
      { icon: Eye, label: "Ver Cliente", desc: "Abre el perfil completo con proyectos y contactos" },
      { icon: Pencil, label: "Editar", desc: "Actualiza información de la empresa cliente" },
    ],
  },
  {
    id: "prospectos",
    title: "CRM Prospectos",
    icon: Briefcase,
    color: "bg-warning/10",
    iconColor: "text-warning",
    accent: "#f59e0b",
    badge: "Ventas",
    description:
      "Pipeline de ventas para gestionar el ciclo completo desde el primer contacto hasta el cierre del negocio.",
    features: [
      { icon: Target, text: "Etapas del pipeline: Nuevo → Contactado → Negociación → Cerrado" },
      { icon: MessageSquare, text: "Registro de notas, reuniones y personas de contacto" },
      { icon: BarChart3, text: "Valor estimado del negocio y probabilidad de cierre" },
    ],
    tips: "Actualiza el estado del prospecto tras cada interacción para mantener el pipeline limpio y predecible.",
    actions: [
      { icon: Plus, label: "Nuevo Prospecto", desc: "Agrega un lead al pipeline" },
      { icon: Pencil, label: "Actualizar Estado", desc: "Avanza el prospecto en el pipeline" },
    ],
  },
  {
    id: "redes",
    title: "Gestión de Redes",
    icon: Share2,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    accent: "#9333ea",
    badge: "Marketing",
    description:
      "Planificación y organización del contenido para redes sociales de APM Group.",
    features: [
      { icon: Plus, text: "Crear y categorizar piezas de contenido por red social" },
      { icon: Clock, text: "Programar publicaciones con fecha y hora de publicación" },
      { icon: CheckCircle2, text: "Marcar contenido como publicado para llevar el control" },
    ],
    tips: "Usa las categorías para diferenciar contenido educativo, comercial y de marca. Mantén el calendario con al menos 2 semanas de anticipación.",
    actions: [
      { icon: Plus, label: "Nueva Pieza", desc: "Crea un nuevo contenido para publicar" },
      { icon: CheckCircle2, label: "Marcar Publicado", desc: "Confirma que el contenido fue publicado" },
    ],
  },
  {
    id: "calendario",
    title: "Calendario APM",
    icon: CalendarDays,
    color: "bg-info/10",
    iconColor: "text-info",
    accent: "#3b82f6",
    badge: "Planificación",
    description:
      "Agenda institucional para registrar reuniones, eventos, entregables y fechas clave del equipo.",
    features: [
      { icon: Plus, text: "Agregar notas y eventos en fechas específicas del calendario" },
      { icon: Bell, text: "Las próximas actividades aparecen en el Dashboard como recordatorio" },
      { icon: Trash2, text: "Eliminar eventos ya realizados para mantener la agenda limpia" },
    ],
    tips: "Los eventos del Calendario APM son visibles para todos los admins. Úsalo para hitos del equipo, no para agendas personales.",
    actions: [
      { icon: Plus, label: "Agregar Evento", desc: "Crea un nuevo evento o nota en la fecha seleccionada" },
      { icon: Trash2, label: "Eliminar", desc: "Borra el evento del calendario" },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeroHeader() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 mb-8"
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #b4c307, transparent)" }}
      />
      <div
        className="absolute -bottom-8 left-20 w-32 h-32 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
      />

      <div className="relative z-10 flex items-start gap-5">
        <div
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(180,195,7,0.15)", border: "1px solid rgba(180,195,7,0.3)" }}
        >
          <BookOpen size={32} style={{ color: "#b4c307" }} strokeWidth={1.6} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(180,195,7,0.2)", color: "#b4c307" }}
            >
              SOLO ADMINISTRADOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Manual de Usuario</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            Guía completa de todas las herramientas disponibles en tu panel de administración.
            Encuentra aquí cómo usar cada sección de forma eficiente.
          </p>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="relative z-10 mt-6 flex flex-wrap gap-4">
        {[
          { label: "Secciones disponibles", value: "7", icon: Star },
          { label: "Módulos documentados", value: "100%", icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Icon size={14} style={{ color: "#b4c307" }} />
            <span className="text-white font-semibold text-sm">{value}</span>
            <span className="text-xs" style={{ color: "#6b7280" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md bg-surface flex items-center justify-center">
        <Icon size={11} className="text-text-muted" strokeWidth={2} />
      </span>
      <span className="text-sm text-foreground leading-relaxed">{text}</span>
    </li>
  );
}

function ActionBadge({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface/60 border border-border/50">
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
        <Icon size={13} className="text-text-muted" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{label}</p>
        <p className="text-xs text-text-muted leading-tight truncate">{desc}</p>
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: (typeof sections)[0] }) {
  const Icon = section.icon;
  return (
    <div
      className="card flex flex-col gap-5 hover:shadow-md transition-all duration-200"
      style={{ borderTop: `3px solid ${section.accent}` }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={section.iconColor} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-bold text-base text-foreground">{section.title}</h2>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${section.accent}18`, color: section.accent }}
            >
              {section.badge}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-text-light flex-shrink-0 mt-1" />
      </div>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed">{section.description}</p>

      {/* Features */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">Funcionalidades</p>
        <ul className="space-y-2">
          {section.features.map((f, i) => (
            <FeatureItem key={i} icon={f.icon} text={f.text} />
          ))}
        </ul>
      </div>

      {/* Actions (if any) */}
      {section.actions && section.actions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">Botones clave</p>
          <div className="grid grid-cols-1 gap-2">
            {section.actions.map((a, i) => (
              <ActionBadge key={i} icon={a.icon} label={a.label} desc={a.desc} />
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div
        className="flex items-start gap-2.5 p-3 rounded-xl"
        style={{ background: `${section.accent}0d`, border: `1px solid ${section.accent}22` }}
      >
        <Info size={14} style={{ color: section.accent }} className="flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: section.accent === "#b4c307" ? "#7a8605" : section.accent }}>
          <span className="font-semibold">Consejo: </span>{section.tips}
        </p>
      </div>
    </div>
  );
}

// ─── Section Modal ────────────────────────────────────────────────────────────

function SectionModal({
  section,
  onClose,
}: {
  section: (typeof sections)[0];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4"
      style={{
        background: "rgba(17,24,39,0.6)",
        backdropFilter: "blur(4px)",
        paddingTop: "calc(var(--navbar-height) + 3rem)",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-border shadow-md flex items-center justify-center hover:bg-surface transition-colors"
        >
          <X size={14} className="text-text-muted" />
        </button>

        <SectionCard section={section} />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminManualUsuario() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[0] | null>(null);

  return (
    <div className="space-y-2 animate-fade-in">
      <HeroHeader />

      {/* Index bar */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <h2 className="font-bold text-sm text-foreground uppercase tracking-wide">
            Índice de secciones
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-hover hover:border-primary/40 transition-all cursor-pointer"
              >
                <Icon size={12} className={s.iconColor} strokeWidth={2} />
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Support note — right below index */}
      <div
        className="mb-6 p-4 rounded-xl flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, #f9fafb, #f3f4f6)", border: "1px solid #e5e7eb" }}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Star size={15} className="text-primary-hover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">¿Necesitas soporte?</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Este manual cubre las funcionalidades del panel de administrador. Si encuentras algún
            inconveniente o necesitas ayuda adicional, contacta al equipo técnico de APM Group.
          </p>
        </div>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sections.map((section) => (
          <div key={section.id} id={`section-${section.id}`}>
            <SectionCard section={section} />
          </div>
        ))}
      </div>

      {/* Section modal */}
      {activeSection && (
        <SectionModal section={activeSection} onClose={() => setActiveSection(null)} />
      )}
    </div>
  );
}
