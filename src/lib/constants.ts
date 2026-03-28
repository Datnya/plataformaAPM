// Constants and configuration values
export const APP_NAME = "APM Group - Control de Proyectos";
export const MAX_CLIENT_ACCOUNTS_PER_COMPANY = 3;
export const LOGO_PATH = "/Im%C3%A1genes/LOGO APM.png";

// ─── Goal / Status UI Mappings ───────────────────────────────────────────────

export const GOAL_STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  EN_PROCESO: "bg-blue-100 text-blue-700 border-blue-200",
  REVISION: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETADO: "bg-green-100 text-green-700 border-green-200",
};

export const GOAL_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  REVISION: "Revisión",
  COMPLETADO: "Completado",
};

export const PROSPECT_STATUS_OPTIONS = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "CONTACTADO", label: "Contactado" },
  { value: "NEGOCIACION", label: "Negociación" },
  { value: "CERRADO", label: "Cerrado" },
] as const;

export const PROSPECT_STATUS_COLORS: Record<string, string> = {
  NUEVO: "text-primary",
  CONTACTADO: "text-warning",
  NEGOCIACION: "text-info",
  CERRADO: "text-success",
};

export const USER_STATUS_BADGE: Record<string, string> = {
  ACTIVO: "bg-green-50 border-green-200 text-green-700",
  INACTIVO: "bg-gray-100 border-gray-200 text-gray-500",
};
