export const dark = {
  bg: "#0A0A0F", bgSecondary: "#12121A", bgCard: "#1A1A26", bgElevated: "#252536",
  accent: "#00D4AA", accentGlow: "rgba(0,212,170,0.15)", accentDim: "rgba(0,212,170,0.08)", accentBorder: "rgba(0,212,170,0.2)",
  danger: "#FF4D6A", text: "#F0F0F5", textSecondary: "#9090A8", textMuted: "#606078",
  border: "rgba(255,255,255,0.06)", navBg: "rgba(18,18,26,0.95)",
};
export const light = {
  bg: "#F5F6FA", bgSecondary: "#FFFFFF", bgCard: "#FFFFFF", bgElevated: "#E8EAF0",
  accent: "#00B894", accentGlow: "rgba(0,184,148,0.12)", accentDim: "rgba(0,184,148,0.06)", accentBorder: "rgba(0,184,148,0.25)",
  danger: "#E74C3C", text: "#1A1A2E", textSecondary: "#5A5A7A", textMuted: "#8A8AA8",
  border: "rgba(0,0,0,0.08)", navBg: "rgba(255,255,255,0.95)",
};
export type Theme = typeof dark;
export function getTheme(isDark: boolean): Theme { return isDark ? dark : light; }
