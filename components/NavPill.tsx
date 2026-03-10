"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export type NavPillVariant = "light" | "dark";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/handbook", label: "Handbook" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/hive", label: "HIVE" },
] as const;

export interface NavPillProps {
  /** Light = dark text (for light headers). Dark = light text (for teal/dark headers). */
  variant?: NavPillVariant;
  /** Optional label override. Default "Menu". */
  label?: string;
  /** Wrapper div (positioning). */
  className?: string;
  /** Extra classes for the pill button — use to match page (e.g. border color, shadow). */
  pillClassName?: string;
  /** Extra classes for the dropdown panel — use to match page. */
  dropdownClassName?: string;
}

export function NavPill({
  variant = "light",
  label = "Menu",
  className = "",
  pillClassName = "",
  dropdownClassName = "",
}: NavPillProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const isDark = variant === "dark";
  const pillBg = isDark ? "bg-white/15 hover:bg-white/25" : "bg-black/6 hover:bg-black/10";
  const pillText = isDark ? "text-white" : "text-[#212121]";
  const dropdownBg = "bg-white";
  const dropdownBorder = "border border-gray-200";
  const dropdownShadow = "shadow-lg";

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
          transition-colors ${pillBg} ${pillText} ${pillClassName}
        `}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open site navigation"
      >
        <span>{label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-lg py-1 ${dropdownBg} ${dropdownBorder} ${dropdownShadow} ${dropdownClassName}`}
          role="menu"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[#212121] hover:bg-gray-100 no-underline"
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
