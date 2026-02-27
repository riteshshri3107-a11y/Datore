import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCurrency(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n); }
export function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "Just now"; if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
}
export function statusColor(s: string) {
  const m: Record<string, string> = { active: "#00D4AA", completed: "#00D4AA", in_progress: "#60A5FA", pending: "#FBBF24", requested: "#FBBF24", rejected: "#FF4D6A", cancelled: "#FF4D6A", disputed: "#FF4D6A" };
  return m[s] || "#606078";
}
