"use client";

import type { ThemeKey } from "@/lib/hive/themes";
import { THEMES } from "@/lib/hive/themes";

type ThemeSwitcherProps = {
  value: ThemeKey;
  onChange: (v: ThemeKey) => void;
};

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs sm:block" style={{ color: "var(--text-muted)" }}>
        Theme:
      </span>
      <div
        className="flex items-center gap-1 rounded-full border p-0.5"
        style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
      >
        {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
          const theme = THEMES[key];
          const isActive = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: isActive ? "var(--accent)" : "transparent",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              {theme.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
