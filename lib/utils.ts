import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number | null | undefined, currency = "UYU") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function minutesToHours(minutes: number | null | undefined) {
  return Math.round(((minutes ?? 0) / 60) * 10) / 10;
}
