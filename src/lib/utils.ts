// ─── Date Formatting ─────────────────────────────────────────────────────────

const DATE_LOCALE = "es-ES";

/** Format a date string to "12 ene 2025" */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Format a date string to "12 de enero de 2025" */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Returns today as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Calculations ────────────────────────────────────────────────────────────

/** Calculate goal progress as a percentage (0-100) */
export function calcGoalProgress(
  goals: { status: string }[]
): { progress: number; total: number; completed: number } {
  const total = goals.length;
  const completed = goals.filter((g) => g.status === "COMPLETADO").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { progress, total, completed };
}

/** Calculate total hours from check-in/check-out time log pairs */
export function calcTotalHours(
  timeLogs: { check_in_time?: string; check_out_time?: string }[]
): number {
  let total = 0;
  for (const tl of timeLogs) {
    if (tl.check_in_time && tl.check_out_time) {
      const diffMs =
        new Date(tl.check_out_time).getTime() -
        new Date(tl.check_in_time).getTime();
      if (diffMs > 0) total += diffMs / (1000 * 60 * 60);
    }
  }
  return Math.round(total * 10) / 10;
}

// ─── JSON Safety ─────────────────────────────────────────────────────────────

/** Safely parse a JSON string, returning fallback on failure */
export function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
