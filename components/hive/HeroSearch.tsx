"use client";

import type { RefObject } from "react";

const DEFAULT_QUICK_TERMS = ["Flood", "Sea level rise", "Heatwave", "Rockfall", "SuDS", "Vegetation"];

type HeroSearchProps = {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
  quickTerms?: string[];
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function HeroSearch({
  value,
  onChange,
  onClear,
  placeholder = "e.g. flooding on a rail corridor, heatwave on road bridges, coastal port storm surge...",
  quickTerms = DEFAULT_QUICK_TERMS,
  inputRef,
}: HeroSearchProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[length:1.5px] py-4 pl-11 pr-10 text-base shadow-sm transition-all focus:outline-none"
          style={{
            background: "var(--input-bg)",
            borderColor: value ? "var(--accent)" : "var(--input-border)",
            color: "var(--text-primary)",
          }}
          aria-label="Search case studies"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:opacity-80"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {!value && (
        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
          Describe your challenge — location, asset type, climate risk
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {quickTerms.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onChange(term)}
            className="rounded border px-3 py-1 text-xs transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
