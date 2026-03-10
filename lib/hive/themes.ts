// Theme tokens for HIVE handbook (Direction B). Applied via CSS variables.

export type ThemeKey = "light" | "dark" | "dft";

export type Theme = {
  key: ThemeKey;
  label: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentText: string;
  navBg: string;
  gradFade: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  inputBg: string;
  inputBorder: string;
  sectionBg: string;
  dftGreen?: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
  light: {
    key: "light",
    label: "Light",
    bg: "#F7F5F0",
    surface: "#ffffff",
    surfaceAlt: "#fafaf9",
    border: "#e7e5e4",
    borderStrong: "#a8a29e",
    textPrimary: "#1c1917",
    textSecondary: "#78716c",
    textMuted: "#a8a29e",
    accent: "#047857",
    accentBg: "#d1fae5",
    accentText: "#065f46",
    navBg: "rgba(255,255,255,0.92)",
    gradFade: "#F7F5F0",
    badgeBg: "#ecfdf5",
    badgeText: "#065f46",
    badgeBorder: "#a7f3d0",
    inputBg: "#ffffff",
    inputBorder: "#d6d3d1",
    sectionBg: "#f5f5f4",
  },
  dark: {
    key: "dark",
    label: "Dark",
    bg: "#0d1117",
    surface: "#161b27",
    surfaceAlt: "#1e2535",
    border: "#2d3446",
    borderStrong: "#4a5568",
    textPrimary: "#e2e8f0",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    accent: "#34d399",
    accentBg: "#064e3b",
    accentText: "#34d399",
    navBg: "rgba(13,17,23,0.96)",
    gradFade: "#0d1117",
    badgeBg: "#064e3b",
    badgeText: "#34d399",
    badgeBorder: "#065f46",
    inputBg: "#1e2535",
    inputBorder: "#2d3446",
    sectionBg: "#161b27",
  },
  dft: {
    key: "dft",
    label: "DfT",
    bg: "#f3f2f1",
    surface: "#ffffff",
    surfaceAlt: "#f8f8f8",
    border: "#b1b4b6",
    borderStrong: "#505a5f",
    textPrimary: "#0b0c0c",
    textSecondary: "#505a5f",
    textMuted: "#6f777b",
    accent: "#1d70b8",
    accentBg: "#e8f1fb",
    accentText: "#003a70",
    navBg: "rgba(255,255,255,0.97)",
    gradFade: "#f3f2f1",
    badgeBg: "#e8f1fb",
    badgeText: "#003a70",
    badgeBorder: "#99c4e8",
    inputBg: "#ffffff",
    inputBorder: "#0b0c0c",
    sectionBg: "#f8f8f8",
    dftGreen: "#006853",
  },
};

export const SECTOR_BORDER: Record<string, string> = {
  Rail: "#5BADD4",
  Aviation: "#9B7FE0",
  Maritime: "#4BB885",
  Highways: "#E8934A",
};
