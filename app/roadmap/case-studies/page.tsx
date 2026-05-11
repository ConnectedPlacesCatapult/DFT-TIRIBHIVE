"use client";

import React, { useEffect, useRef } from "react";
import CaseStudiesContent from "@/data/roadmap/CaseStudiesContent.json";
import { tribAssets } from "@/lib/tribAssets";

type CaseStudyRow = {
  title: string;
  body: string[];
  /** Large hero art (matches live trib.org.uk/roadmap/images/case-study-n.png) */
  image?: string;
  /** Optional Digital Twin Hub deep link */
  url?: string;
  /** Fallback TRIB SVG in Resources root when no raster image */
  illustration?: string;
};

export default function CaseStudiesPage() {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  const data = CaseStudiesContent as { Case_Studies: CaseStudyRow[] };

  return (
    <div ref={focusRef} tabIndex={-1} className="Case_Studies Bordered_Content">
      <h1 className="h1">Case Studies</h1>
      <p className="Case_Studies_Intro p1">
        The TRIB Roadmap case studies page showcases a range of pioneering digital twin initiatives
        transforming transport management across the UK. Each case study illustrates real-world
        applications of digital twin technology—from optimising multimodal journeys and improving
        incident response, to enhancing freight efficiency and revolutionising highway maintenance.
        Presented in partnership with leading industry innovators, these examples highlight both
        immediate and long-term benefits, including cost savings, improved operational resilience,
        and sustainability gains, while addressing the challenges and future potential of a
        data-driven, interconnected transport ecosystem.
      </p>
      <div className="Case_Studies_Container">
        {data.Case_Studies.map((cs, i) => (
          <div key={i} tabIndex={0} className="Case_Study_Card">
            <h1 className="h4">{cs.title}</h1>
            {cs.image ? (
              <div className="Case_Study_Hero">
                <img src={tribAssets.root(cs.image)} alt="" />
              </div>
            ) : cs.illustration ? (
              <div className="Case_Study_Illustration" aria-hidden>
                <img src={tribAssets.root(cs.illustration)} alt="" />
              </div>
            ) : null}
            {cs.body.map((paragraph, pi) => (
              <p key={pi} className="p1">{paragraph}</p>
            ))}
            {cs.url ? (
              <p className="Case_Study_ReadMore">
                <a href={cs.url} target="_blank" rel="noreferrer">
                  Read full case study
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
