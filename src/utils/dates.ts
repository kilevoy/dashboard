import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

export const TODAY = new Date("2026-05-22T12:00:00+05:00");

export const iso = (date: Date) => format(date, "yyyy-MM-dd");

export const getPresetRange = (preset: "YTD" | "last12" | "quarter" | "custom") => {
  if (preset === "YTD") return { startDate: "2026-01-01", endDate: iso(TODAY) };
  if (preset === "last12") return { startDate: iso(startOfMonth(subMonths(TODAY, 11))), endDate: iso(TODAY) };
  if (preset === "quarter") return { startDate: "2026-04-01", endDate: iso(TODAY) };
  return { startDate: "2026-01-01", endDate: iso(TODAY) };
};

export const monthKey = (isoDate: string) => isoDate.slice(0, 7);

export const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  return `${month}.${year.slice(2)}`;
};

export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

export const endOfMonthIso = (date: Date) => iso(endOfMonth(date));
