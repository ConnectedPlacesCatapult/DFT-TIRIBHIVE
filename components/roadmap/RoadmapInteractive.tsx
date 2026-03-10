"use client";

import { useState } from "react";

export interface Output {
  title: string;
  activities: string[];
  start_date?: number;
  end_date?: number;
  lead_contributor?: string;
  other_contributors?: string[];
}

interface Component {
  title: string;
  icon?: string;
  outputs: Output[];
  outcomes?: string[];
  relevant_links?: { src: string; title: string }[];
}

export interface Workstream {
  title: string;
  colour: string;
  "text-colour": string;
  icon?: string;
  components: Component[];
}

export function RoadmapInteractive({
  workstreams,
}: {
  workstreams: Workstream[];
}) {
  const [openWorkstream, setOpenWorkstream] = useState<number | null>(0);
  const [openComponent, setOpenComponent] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {workstreams.map((ws, wi) => (
        <div
          key={wi}
          className="rounded-lg border-2 overflow-hidden"
          style={{ borderColor: ws.colour }}
        >
          <button
            type="button"
            onClick={() =>
              setOpenWorkstream(openWorkstream === wi ? null : wi)
            }
            className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-lg"
            style={{ backgroundColor: ws.colour, color: ws["text-colour"] }}
          >
            <span>{ws.title}</span>
            <span className="text-2xl">
              {openWorkstream === wi ? "−" : "+"}
            </span>
          </button>
          {openWorkstream === wi && (
            <div className="bg-white p-4 space-y-4">
              {ws.components.map((comp, ci) => {
                const key = `${wi}-${ci}`;
                const isOpen = openComponent === key;
                return (
                  <div key={key} className="border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenComponent(isOpen ? null : key)
                      }
                      className="w-full text-left px-4 py-3 font-semibold text-[#15335E] flex justify-between items-center"
                    >
                      {comp.title}
                      <span>{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                        {comp.outcomes && comp.outcomes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Outcomes
                            </h4>
                            <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
                              {comp.outcomes.map((o, i) => (
                                <li key={i}>{o}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Outputs
                          </h4>
                          <div className="space-y-3">
                            {comp.outputs.map((out, oi) => (
                              <div
                                key={oi}
                                className="pl-3 border-l-2 border-[#9DEDDA]"
                              >
                                <p className="font-medium text-[#15335E]">
                                  {out.title}
                                </p>
                                {(out.start_date || out.end_date) && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {out.start_date} – {out.end_date}
                                  </p>
                                )}
                                {out.lead_contributor && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Lead: {out.lead_contributor}
                                    {out.other_contributors?.length
                                      ? `; ${out.other_contributors.join(", ")}`
                                      : ""}
                                  </p>
                                )}
                                {out.activities && out.activities.length > 0 && (
                                  <ul className="list-disc pl-4 mt-2 text-sm text-gray-600 space-y-1">
                                    {out.activities.slice(0, 3).map((a, ai) => (
                                      <li key={ai}>{a}</li>
                                    ))}
                                    {out.activities.length > 3 && (
                                      <li>
                                        … and {out.activities.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {comp.relevant_links &&
                          comp.relevant_links.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">
                                Relevant publications
                              </h4>
                              <ul className="text-sm space-y-1">
                                {comp.relevant_links.slice(0, 5).map((l, i) => (
                                  <li key={i}>
                                    <a
                                      href={l.src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#15335E] hover:underline"
                                    >
                                      {l.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
