"use client";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { CSSProperties, ReactNode } from "react";

export function GlassCard({ children, style, onClick, className, glow }: { children: ReactNode; style?: CSSProperties; onClick?: () => void; className?: string; glow?: boolean }) {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div onClick={onClick} className={`glass ${className || ""} ${glow ? "gradient-border" : ""}`} style={{ background: t.bgCard, border: `1px solid ${t.borderGlass}`, borderRadius: 18, padding: 16, boxShadow: t.shadow, cursor: onClick ? "pointer" : "default", transition: "all .2s", ...style }}>{children}</div>;
}

export function GlassInput({ value, onChange, placeholder, type, style, icon }: any) {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: t.bgGlass, border: `1px solid ${t.borderGlass}`, borderRadius: 14, ...style }} className="glass">
    {icon && <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>}
    <input value={value} onChange={onChange} placeholder={placeholder} type={type || "text"} style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%" }} />
  </div>;
}

export function GlassButton({ children, onClick, variant, disabled, style, full }: any) {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const styles: Record<string, CSSProperties> = {
    primary: { background: t.accentSolid, color: "#07070D", fontWeight: 700 },
    secondary: { background: t.bgGlass, color: t.text, border: `1px solid ${t.borderGlass}` },
    outline: { background: "transparent", color: t.accent, border: `1px solid ${t.accentBorder}` },
    danger: { background: "rgba(255,77,106,0.12)", color: t.danger, border: `1px solid rgba(255,77,106,0.2)` },
    ghost: { background: "transparent", color: t.textSecondary },
  };
  return <button onClick={onClick} disabled={disabled} className="glass" style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: "inherit", border: "none", transition: "all .2s", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", ...(styles[variant || "primary"] || styles.primary), ...style }}>{children}</button>;
}

export function GlassChip({ label, active, onClick, icon }: any) {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <button onClick={onClick} className="glass" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${active ? t.accentBorder : t.borderGlass}`, background: active ? t.accentDim : t.bgGlass, color: active ? t.accent : t.textSecondary, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all .2s" }}>{icon && <span>{icon}</span>}{label}</button>;
}

export function Spinner() {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}><div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} /></div>;
}

export function EmptyState({ icon, title, desc, action, actionLabel }: any) {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <GlassCard style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 40, marginBottom: 8 }}>{icon}</p><p style={{ fontWeight: 700, fontSize: 16 }}>{title}</p>{desc && <p style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>{desc}</p>}{action && <GlassButton onClick={action} style={{ marginTop: 14 }}>{actionLabel}</GlassButton>}</GlassCard>;
}
