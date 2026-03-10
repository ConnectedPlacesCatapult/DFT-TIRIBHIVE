"use client";

type SectorFilterProps = {
  sectors: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  showAllPill?: boolean;
};

export function SectorFilter({
  sectors,
  selected,
  onChange,
  showAllPill = true,
}: SectorFilterProps) {
  const toggle = (s: string) => {
    if (selected.includes(s)) {
      onChange(selected.filter((x) => x !== s));
    } else {
      onChange([...selected, s]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {showAllPill && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            background: selected.length === 0 ? "var(--accent)" : "var(--surface)",
            borderColor: selected.length === 0 ? "var(--accent)" : "var(--border)",
            color: selected.length === 0 ? "#fff" : "var(--text-secondary)",
          }}
        >
          All
        </button>
      )}
      {sectors.map((s) => {
        const isSelected = selected.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: isSelected ? "var(--accent)" : "var(--surface)",
              borderColor: isSelected ? "var(--accent)" : "var(--border)",
              color: isSelected ? "#fff" : "var(--text-secondary)",
            }}
          >
            {isSelected && "✓ "}
            {s}
          </button>
        );
      })}
    </div>
  );
}
