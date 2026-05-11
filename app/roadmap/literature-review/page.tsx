"use client";

import React, { useEffect, useRef, useState } from "react";
import LitReviewData from "@/data/roadmap/Lit Review.json";
import { tribAssets } from "@/lib/tribAssets";

interface LitEntry {
  Name: string;
  Source: string;
  Author: string;
  "Publication date": string;
  Description: string;
}

type SortKey = keyof LitEntry;

export default function LiteratureReviewPage() {
  const focusRef = useRef<HTMLDivElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>("Name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  const rows = (LitReviewData as LitEntry[]).slice().sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv));
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const cols: { key: SortKey; label: string }[] = [
    { key: "Name", label: "Name" },
    { key: "Source", label: "Source" },
    { key: "Author", label: "Author" },
    { key: "Publication date", label: "Publication date" },
    { key: "Description", label: "Description" },
  ];

  return (
    <div ref={focusRef} tabIndex={-1} className="Literature_Review Bordered_Content">
      <h1 className="h1">Relevant Publications</h1>
      <p className="Intro p1">
        To understand the landscape of existing and emerging digital twins, a literature review was
        conducted of 58 documents including academic research, market analysis and the UK&rsquo;s
        competitiveness in digital twins, transport related digital twin documents and case studies.
        The review identified key blockers and enablers to accelerate the implementation and adoption
        of digital twins in transport, identified existing standards and the key digital twin
        components these apply to, in addition to guiding principles for the development of digital
        twins amongst other key themes which have been represented in the Roadmap.
      </p>
      <p className="p1" style={{ marginTop: "16px" }}>
        For more information on the literature review performed as part of the roadmap development,
        please contact{" "}
        <a href="mailto:contact@trib.org.uk">contact@trib.org.uk</a>
      </p>
      <div className="Lit_Table_Scroll">
        <table className="Lit_Table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={{ cursor: "pointer" }}>
                  {c.label} {sortKey === c.key ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="p1">{row.Name}</td>
                <td>
                  {row.Source ? (
                    <a href={row.Source} target="_blank" rel="noreferrer">
                      <img src={tribAssets.root("Link.png")} alt="Link" />
                    </a>
                  ) : null}
                </td>
                <td className="p1">{row.Author}</td>
                <td className="p1">{row["Publication date"]}</td>
                <td className="p1">{row.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
