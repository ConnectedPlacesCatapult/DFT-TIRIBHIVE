"use client";

import { useState } from "react";

function yearBucket(endYear: number): "2023-2025" | "2026-2030" | "2031-2035" | null {
  if (endYear <= 2025) return "2023-2025";
  if (endYear <= 2030) return "2026-2030";
  if (endYear <= 2035) return "2031-2035";
  return null;
}

interface Output {
  title: string;
  end_date?: number;
  start_date?: number;
}

interface Comp {
  title: string;
  icon?: string;
  outputs: Output[];
  outcomes?: string[];
  relevant_links?: { src: string; title: string }[];
}

interface WS {
  title: string;
  colour: string;
  "text-colour": string;
  icon?: string;
  components: Comp[];
}

export function RoadmapTable({
  workstreams,
  onHideClick,
}: {
  workstreams: WS[];
  onHideClick?: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hideTable, setHideTable] = useState(false);

  const buckets: ("2023-2025" | "2026-2030" | "2031-2035")[] = [
    "2023-2025",
    "2026-2030",
    "2031-2035",
  ];

  return (
    <div className="bg-[#15335E] text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">ROADMAP</h1>
          <button
            type="button"
            onClick={() => {
              setHideTable(!hideTable);
              if (!hideTable && onHideClick) onHideClick();
            }}
            className="border border-white px-4 py-2 rounded text-sm font-medium hover:bg-white/10"
          >
            {hideTable ? "Show Roadmap ↑" : "Hide Roadmap ↓"}
          </button>
        </div>

        {!hideTable && (
          <>
            <div className="space-y-4 mb-8 text-white/95 text-sm leading-relaxed">
              <p>
                The TRIB-commissioned Vision and Roadmap, produced by the
                Connected Places Catapult, consists of workstreams, components,
                outputs, outcomes and activities, which collectively guide us
                towards a future in which we achieve the shared vision in 2035.
              </p>
              <p>
                At the top level, the roadmap shows different workstreams
                together with their corresponding components. A click on each
                component opens up the expected output and target delivery date.
                A further click on &ldquo;Explore this workstream&rdquo; presents
                the output and associated activities, the key contributors and
                supporting organisations, outcomes, and a selection of relevant
                publications.
              </p>
              <p>
                These activities are the building blocks which can be used to
                achieve the 2035 Vision and have been selected based on those
                which are likely to have the most impact.
              </p>
              <a
                href="/roadmap"
                className="inline-block text-white font-medium hover:underline mt-2"
              >
                Learn More &gt;
              </a>
            </div>

            {/* Table headers */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-4 border-b border-white/30 pb-2 mb-4 text-sm font-bold">
              <div>Workstream</div>
              <div>Component</div>
              <div className="text-right">Target output end year</div>
            </div>

            {workstreams.map((ws, wi) => (
              <div key={wi} className="mb-6">
                {/* Workstream row */}
                <div
                  className="rounded-lg p-4 mb-2 flex items-center justify-between"
                  style={{
                    backgroundColor: ws.colour,
                    color: ws["text-colour"],
                  }}
                >
                  <span className="font-bold">{ws.title}</span>
                  <span className="text-sm">Explore this Workstream &gt;</span>
                </div>

                {/* Component rows */}
                {ws.components.map((comp, ci) => {
                  const key = `${wi}-${ci}`;
                  const isOpen = expanded[key];
                  const outputBuckets = new Set(
                    comp.outputs
                      .map((o) => o.end_date && yearBucket(o.end_date))
                      .filter(Boolean)
                  );

                  return (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_1.5fr_1fr] gap-4 items-center py-2 border-b border-white/20"
                    >
                      <div className="text-white/70 text-sm" />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded({ ...expanded, [key]: !isOpen })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded bg-white/20 text-lg font-bold hover:bg-white/30"
                        >
                          {isOpen ? "−" : "+"}
                        </button>
                        <span className="font-medium">{comp.title}</span>
                      </div>
                      <div className="flex justify-end gap-6">
                        {buckets.map((b) => (
                          <div
                            key={b}
                            className="w-8 text-center text-xs text-white/80"
                          >
                            {outputBuckets.has(b) ? (
                              <span className="inline-block w-3 h-3 rounded-full bg-[#9DEDDA]" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                      {isOpen && (
                        <div className="col-span-3 pl-10 pb-4 text-sm text-white/90 space-y-2">
                          <p className="font-semibold">Outputs</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {comp.outputs.map((o, oi) => (
                              <li key={oi}>
                                {o.title}
                                {o.end_date && (
                                  <span className="text-white/70 ml-2">
                                    ({o.end_date})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                          {comp.relevant_links && comp.relevant_links.length > 0 && (
                            <p className="pt-2">
                              <a
                                href={comp.relevant_links[0].src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#9DEDDA] hover:underline"
                              >
                                Explore this Component &gt;
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
