"use client";

import type { Option } from "@/lib/types";

interface OptionsTableViewProps {
  options: Option[];
  loading?: boolean;
}

const COLUMNS = [
  { key: "transport_subsector", label: "Transport sector" },
  { key: "transport_assets", label: "Asset type" },
  { key: "climate_hazard_cause", label: "Climate hazard (cause)" },
  { key: "climate_hazard_effect", label: "Climate hazard (effect)" },
  { key: "adaptation_measure", label: "Adaptation measure" },
  { key: "relevant_case_studies", label: "Relevant case studies" },
] as const;

export function OptionsTableView({ options, loading }: OptionsTableViewProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200/90 bg-white p-10 text-center text-[#6B7280] shadow-sm">
        Loading options…
      </div>
    );
  }

  if (!options.length) {
    return (
      <div className="rounded-2xl border border-gray-200/90 bg-gray-50/50 p-12 text-center shadow-sm">
        <p className="text-[#374151] font-medium mb-2">Options table</p>
        <p className="text-sm text-[#6B7280] max-w-md mx-auto">
          Adaptation options will appear here when the dataset is loaded. Use the Case Study View to explore the current library.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 font-semibold text-[#212121] whitespace-nowrap"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {options.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                {COLUMNS.map(({ key }) => (
                  <td
                    key={key}
                    className="px-4 py-3 text-gray-700 max-w-[240px]"
                    title={String(row[key as keyof Option] ?? "")}
                  >
                    <span className="line-clamp-2">
                      {String(row[key as keyof Option] ?? "—")}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
