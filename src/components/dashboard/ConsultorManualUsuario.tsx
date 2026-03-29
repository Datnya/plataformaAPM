"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  FileText,
  CalendarDays,
  Target,
  TrendingUp,
  CheckCircle2,
  Plus,
  Upload,
  Eye,
  Trash2,
  Download,
  Bell,
  MapPin,
  Users,
  ChevronRight,
  Info,
  BookOpen,
  Star,
  Zap,
  Save,
  X,
  ClipboardList,
  BarChart3,
  CalendarClock,
  AlertTriangle,
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
      "Tu centro de comando personal: visualiza de un vistazo tu progreso, horas acumuladas y los proyectos que tienes asignados.",
    features: [
      { icon: Clock, text: "Total de horas registradas en todos tus proyectos activos" },
      { icon: Target, text: "Objetivos completados vs. pendientes con porcentaje de avance global" },
      { icon: CalendarClock, text: "Próximas actividades del Calendario APM para que no pierdas ningún compromiso" },
      { icon: BarChart3, text: "Progreso individual por proyecto con barra de avance visual" },
    ],
    tips: "Revisa tu Dashboard al inicio de cada jornada para priorizar tus actividades del día.",
  },
  {
    id: "proyectos-consultor",
    title: "Control de Proyectos",
    icon: FolderKanban,
    color: "bg-info/10",
    iconColor: "text-info",
    accent: "#3b82f6",
    badge: "Proyectos",
    description:
      "Vista completa de todos los proyectos que tienes asignados: estado, cliente, fechas y objetivos por proyecto.",
    features: [
      { icon: ClipboardList, text: "Lista de proyectos asignados con cliente, modalidad y fechas de inicio y fin" },
      { icon: Target, text: "Objetivos del proyecto: semanal y mensual, con su estado de avance actual" },
      { icon: TrendingUp, text: "Progreso general del proyecto calculado en base a objetivos completados" },
      { icon: Eye, text: "Vista detallada de cada proyecto con todos los datos relevantes" },
    ],
    tips: "Actualiza el estado de tus objetivos regularmente para que el administrador tenga visibilidad real del avance.",
    actions: [
      { icon: Eye, label: "Ver Proyecto", desc: "Abre el detalle completo: objetivos, horas y progreso" },
      { icon: CheckCircle2, label: "Actualizar Objetivo", desc: "Cambia el estado de un objetivo asignado" },
    ],
  },
  {
    id: "jornada",
    title: "Mi Jornada",
    icon: Clock,
    color: "bg-warning/10",
    iconColor: "text-warning",
    accent: "#f59e0b",
    badge: "Registro",
    description:
      "Registra cada día de trabajo: horas de entrada y salida, modalidad, áreas visitadas y actividades realizadas.",
    features: [
      { icon: Clock, text: "Hora de entrada y salida con selector AM/PM para precisión en el cálculo de horas" },
      { icon: MapPin, text: "Modalidad de trabajo: Presencial o Remoto según corresponda al día" },
      { icon: Users, text: "Registro de personas contactadas y áreas visitadas durante la jornada" },
      { icon: Upload, text: "Adjunta archivos de evidencia (fotos, documentos) directamente al registro" },
      { icon: Save, text: "Guarda el registro del día con descripción detallada de actividades" },
    ],
    tips: "Completa tu jornada el mismo día para evitar imprecisiones. Incluye siempre una descripción clara de las actividades realizadas.",
    actions: [
      { icon: Save, label: "Guardar Jornada", desc: "Registra las horas y actividades del día actual" },
      { icon: Upload, label: "Adjuntar Archivos", desc: "Sube evidencias o documentos relacionados" },
    ],
  },
  {
    id: "informes",
    title: "Mis Informes",
    icon: FileText,
    color: "bg-success/10",
    iconColor: "text-success",
    accent: "#22c55e",
    badge: "Reportes",
    description:
      "Gestiona tus informes de avance: sube reportes semanales o mensuales por proyecto y accede a tu historial completo.",
    features: [
      { icon: Upload, text: "Sube informes en formato PDF o documento, asociados a un proyecto específico" },
      { icon: ClipboardList, text: "Categoriza tu informe como Semanal o Mensual para mejor organización" },
      { icon: Eye, text: "Previsualiza cualquier informe directamente desde la plataforma sin descargarlo" },
      { icon: Download, text: "Descarga informes anteriores cuando los necesites" },
      { icon: Trash2, text: "Elimina informes subidos por error con confirmación de seguridad" },
    ],
    tips: "Sube tu informe semanal cada viernes para mantener al administrador informado del avance del proyecto.",
    actions: [
      { icon: Upload, label: "Subir Informe", desc: "Carga un nuevo informe al proyecto seleccionado" },
      { icon: Eye, label: "Previsualizar", desc: "Abre el informe sin necesidad de descargarlo" },
      { icon: Download, label: "Descargar", desc: "Guarda una copia local del informe" },
      { icon: Trash2, label: "Eliminar", desc: "Borra el informe del historial con confirmación" },
    ],
  },
  {
    id: "calendario-consultor",
    title: "Calendario",
    icon: CalendarDays,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    accent: "#9333ea",
    badge: "Personal · Privado",
    description:
      "Tu agenda personal y privada: organiza tus actividades semanales y mensuales con total confidencialidad. Esta es la única sección de tu panel que el administrador no puede visualizar.",
    features: [
      { icon: CalendarDays, text: "Visualiza y navega el calendario mensual para planificar tu agenda de trabajo" },
      { icon: Plus, text: "Agrega notas, recordatorios y eventos en cualquier fecha de tu elección" },
      { icon: Bell, text: "Los eventos que registres aquí aparecen en tu Dashboard como recordatorios automáticos" },
      { icon: Trash2, text: "Elimina eventos realizados o cancelados para mantener tu agenda ordenada" },
    ],
    tips: "Usa tu calendario para anticipar reuniones, entregables y compromisos importantes. Al ser completamente privado, puedes organizar tu semana con plena libertad.",
    actions: [
      { icon: Plus, label: "Agregar Nota", desc: "Crea un evento o recordatorio en la fecha seleccionada" },
      { icon: Trash2, label: "Eliminar Evento", desc: "Borra un evento de tu calendario personal" },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeroHeader() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 mb-8"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }}
      />
      <div
        className="absolute -bottom-8 left-16 w-36 h-36 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #b4c307, transparent)" }}
      />
      <div
        className="absolute top-6 right-40 w-20 h-20 rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #22c55e, transparent)" }}
      />

      <div className="relative z-10 flex items-start gap-5">
        <div
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          <BookOpen size={32} style={{ color: "#f59e0b" }} strokeWidth={1.6} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
            >
              CONSULTOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Manual de Usuario</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Guía completa de las herramientas disponibles en tu panel de consultor.
            Todo lo que necesitas saber para gestionar tus proyectos, jornadas e informes.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="relative z-10 mt-6 flex flex-wrap gap-4">
        {[
          { label: "Secciones disponibles", value: "5", icon: Star },
          { label: "Módulos documentados", value: "100%", icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Icon size={14} style={{ color: "#f59e0b" }} />
            <span className="text-white font-semibold text-sm">{value}</span>
            <span className="text-xs" style={{ color: "#64748b" }}>{label}</span>
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
            <h2 className="font-bold text-base text-foreground mb-0.5">{section.title}</h2>
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
        <p
          className="text-xs leading-relaxed"
          style={{ color: section.accent === "#b4c307" ? "#7a8605" : section.accent }}
        >
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

export default function ConsultorManualUsuario() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[0] | null>(null);

  return (
    <div className="space-y-2 animate-fade-in">
      <HeroHeader />

      {/* Index bar */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "#f59e0b" }} />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-hover hover:border-warning/40 transition-all cursor-pointer"
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
        className="mb-4 p-4 rounded-xl flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, #f9fafb, #f3f4f6)", border: "1px solid #e5e7eb" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(245,158,11,0.1)" }}
        >
          <Star size={15} style={{ color: "#f59e0b" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">¿Necesitas soporte?</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Este manual cubre todas las funcionalidades del panel de consultor. Si tienes dudas
            sobre el uso de alguna sección, contacta al administrador de APM Group.
          </p>
        </div>
      </div>

      {/* Puntos importantes */}
      <div
        className="mb-6 rounded-2xl overflow-hidden"
        style={{ border: "1px solid #fca5a5" }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #7f1d1d, #991b1b)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <AlertTriangle size={18} style={{ color: "#fca5a5" }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide uppercase">Puntos Importantes</p>
            <p className="text-xs" style={{ color: "#fca5a5" }}>
              Información clave que debes tener presente durante tu trabajo en la plataforma
            </p>
          </div>
        </div>

        {/* Points list */}
        <div className="bg-white divide-y divide-red-50">
          {[
            {
              num: "01",
              icon: ClipboardList,
              title: "Registro obligatorio de jornada laboral",
              text: "Al finalizar cada jornada de trabajo, ya sea presencial o remota, debes completar el formulario de evidencia de jornada en la plataforma. Este registro es obligatorio sin excepción.",
            },
            {
              num: "02",
              icon: Clock,
              title: "Sin registro, sin horas acumuladas",
              text: "Si no completas el formulario de evidencia de tu jornada, esa jornada no quedará registrada en el sistema. Las horas no registradas no se contabilizan en el avance del proyecto ni se incluyen en el cálculo de tu pago mensual, ya que la remuneración se basa en las horas trabajadas y debidamente evidenciadas.",
            },
            {
              num: "03",
              icon: CheckCircle2,
              title: "Marca tus objetivos como completados",
              text: "Cuando finalices un objetivo asignado por el administrador, debes marcarlo como «Completado» en la plataforma. Los objetivos que permanezcan sin este estado no se reflejarán como avance en el proyecto, aunque hayan sido realizados.",
            },
            {
              num: "04",
              icon: FileText,
              title: "Sube tus informes a la plataforma",
              text: "Tienes la obligación de subir tus informes de avance a la plataforma, sean semanales o mensuales. Aunque ya los hayas enviado al cliente y a APM Group por correo electrónico, igualmente debes subirlos aquí para mantener el registro oficial en el sistema.",
            },
          ].map((point, i) => {
            const Icon = point.icon;
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-red-50/40 transition-colors">
                <div className="flex-shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: "#dc2626" }}
                  >
                    {point.num}
                  </span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(220,38,38,0.08)" }}
                  >
                    <Icon size={15} style={{ color: "#dc2626" }} strokeWidth={2} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">{point.title}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{point.text}</p>
                </div>
              </div>
            );
          })}
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
