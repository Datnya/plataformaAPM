// ─── Re-export Prisma generated types ─────────────────────────────────────────
// These will be available after running `npx prisma generate`
export type {
  User,
  Client,
  Project,
  TimeLog,
  Goal,
  Prospect,
} from "@/generated/prisma/client";

// Database enum equivalents (since SQLite doesn't have native enums)
export const Role = {
  ADMIN: "ADMIN",
  CONSULTOR: "CONSULTOR",
  CLIENTE: "CLIENTE",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Modality = {
  PRESENCIAL: "PRESENCIAL",
  REMOTO: "REMOTO",
} as const;
export type Modality = (typeof Modality)[keyof typeof Modality];

export const GoalType = {
  SEMANAL: "SEMANAL",
  MENSUAL: "MENSUAL",
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const ClientStatus = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
} as const;
export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

export const ProspectStatus = {
  NUEVO: "NUEVO",
  CONTACTADO: "CONTACTADO",
  NEGOCIACION: "NEGOCIACION",
  CERRADO: "CERRADO",
} as const;
export type ProspectStatus = (typeof ProspectStatus)[keyof typeof ProspectStatus];


// ─── Custom Application Types ─────────────────────────────────────────────────

/** Structure for people_met JSON field in TimeLogs */
export interface PersonMet {
  nombre: string;
  apellido: string;
  cargo: string;
}
