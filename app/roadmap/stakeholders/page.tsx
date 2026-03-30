"use client";

import React, { useEffect, useRef } from "react";
import stakeholdersData from "@/data/roadmap/Stakeholders.json";

export default function StakeholdersPage() {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  const data = stakeholdersData as { Stakeholders: string[] };

  return (
    <div ref={focusRef} tabIndex={-1} className="Stakeholders Bordered_Content">
      <h1 className="Stakeholders_Title">Stakeholders</h1>
      <p className="Stakeholders_Intro p1">
        Involvement and collaboration from a wide range of stakeholders has been critical for the
        development of the vision and roadmap and reviews of drafts. Over 80 organisations have been
        engaged in workshops and one-to-one sessions to explore how digital twins are currently used
        and how they might be used and connected in future. This includes stakeholders across the
        transport sector, as well as adjacent sectors of energy, telecommunications and the built
        environment. Experts in both digital twins and transport systems were consulted from industry
        (both large business and SMEs,) academia, public sector, and representatives from the
        research and innovation community. This was supplemented by engagement with the{" "}
        <a href="https://digitaltwinhub.co.uk/">Digital Twin Hub</a> community via a survey.
      </p>
      <ul className="Stakeholders_Collection">
        {data.Stakeholders.map((stakeholder, index) => (
          <li key={index} className="Stakeholder p1">
            {stakeholder}
          </li>
        ))}
      </ul>
    </div>
  );
}
