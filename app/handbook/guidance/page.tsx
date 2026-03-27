"use client";

import Link from "next/link";

const GUIDANCE_GROUPS = [
  {
    label: "UK Government",
    links: [
      {
        title: "Climate Adaptation Strategy for Transport",
        description: "DfT's overarching strategy for adapting the UK transport network to climate change.",
        url: "https://www.gov.uk/government/publications/climate-adaptation-strategy-for-transport",
      },
      {
        title: "Climate Risk Assessment Guidance",
        description: "Official guidance on conducting climate change risk assessments for infrastructure.",
        url: "https://www.gov.uk/guidance/climate-change-risk-assessment-guidance",
      },
      {
        title: "HS2 Learning Legacy — Climate Change",
        description: "Lessons and publications from the HS2 programme on climate resilience and adaptation.",
        url: "https://learninglegacy.hs2.co.uk/categories/climate-change/",
      },
    ],
  },
  {
    label: "Climate Data",
    links: [
      {
        title: "Met Office Climate Data Portal",
        description: "Access to observed and projected climate data for the UK, including UKCP18 projections.",
        url: "https://climatedataportal.metoffice.gov.uk/",
      },
      {
        title: "DARe Publications",
        description: "Research publications from the Decarbonisation and Resilience (DARe) programme.",
        url: "https://dare-uk.org/publications/",
      },
    ],
  },
  {
    label: "Professional Bodies",
    links: [
      {
        title: "CIHT — Climate Change and Resilience",
        description: "Resources from the Chartered Institution of Highways and Transportation on resilience planning.",
        url: "https://www.ciht.org.uk/resilience",
      },
      {
        title: "ADEPT RAPA Toolkit",
        description: "The Rapid Adaptation Pathways Assessment toolkit from ADEPT, supporting local authorities.",
        url: "https://www.adeptnet.org.uk/rapa-toolkit",
      },
    ],
  },
  {
    label: "International (PIARC)",
    note: "PIARC publications may require registration or purchase to access full documents.",
    links: [
      {
        title: "PIARC Climate Change Adaptation Framework 2023",
        description: "International framework for climate change adaptation in road infrastructure — Technical Report.",
        url: "https://www.piarc.org/en/order-library/42628-en-PIARC%20International%20Climate%20Change%20Adaptation%20Framework%202023%20%E2%80%93%20TechnicalReport",
      },
      {
        title: "PIARC Climate Change, Resilience and Disaster Management for Roads",
        description: "Seminar proceedings on resilience and disaster management for road networks.",
        url: "https://www.piarc.org/en/order-library/42098-en-Climate%20Change,%20Resilience%20and%20Disaster%20Management%20forRoads%20-%20Seminar",
      },
      {
        title: "PIARC Ensuring the Network Remains Operational",
        description: "Panel discussion proceedings from Highways UK 2024 on maintaining operations under unprecedented conditions.",
        url: "https://www.piarc.org/en/order-library/45857-en-Ensuring%20theNetwork%20Remains%20Operational%20during%20Unprecedented%20Conditions%20-%20Proceedings%20fromPiarc%20Panel%20Discussion%20at%20Highways%20UK%20in%20October%202024",
      },
      {
        title: "PIARC Case Studies — Climate Change, Hazards and Road Network Resilience",
        description: "Collection of international case studies on climate hazards and road network resilience.",
        url: "https://www.piarc.org/en/order-library/39873-en-Climate%20Change,%20Other%20Hazards%20and%20Resilience%20of%20Road%20Networks%20-%20Collection%20of%20Case%20Studies",
      },
      {
        title: "PIARC Road Bridges — Climate Change Adaptation",
        description: "Literature review on measures for increasing road bridge adaptability to climate change.",
        url: "https://www.piarc.org/en/order-library/38687-en-Measures%20for%20Increasing%20the%20Adaptability%20of%20Road%20Bridges%20to%20Climate%20Change%20-%20Literature%20Review",
      },
      {
        title: "PIARC Preserve Earthworks and Rural Roads",
        description: "Technical report on preserving earthworks and rural roads from the impact of climate change.",
        url: "https://www.piarc.org/en/order-library/34433-en-Preserve%20Earthworks%20and%20Rural%20Roads%20from%20the%20Impact%20ofClimate%20Changes%20-%20Technical%20Report",
      },
      {
        title: "PIARC Adaptation Methodologies and Strategies",
        description: "Technical report on adaptation methodologies to increase road network resilience to climate change.",
        url: "https://www.piarc.org/en/order-library/31335-en-Adaptation%20Methodologies%20and%20Strategies%20to%20Increase%20the%20Resilience%20of%20Roads%20to%20Climate%20Change%20-%20Technical%20Report",
      },
    ],
  },
];

export default function GuidancePage() {
  const totalLinks = GUIDANCE_GROUPS.reduce((n, g) => n + g.links.length, 0);
  const lastUpdated = "March 2026";
  return (
    <main
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/handbook"
          style={{ fontSize: 13, color: "var(--text-muted, #888)", textDecoration: "none" }}
        >
          ← Handbook
        </Link>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            marginTop: 16,
            marginBottom: 8,
            color: "var(--text-primary, #1a1a1a)",
          }}
        >
          Additional Guidance
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted, #666)", lineHeight: 1.65, margin: 0, maxWidth: 760 }}>
          Curated external guidance for climate adaptation in transport infrastructure. This is a growing library and will expand as new sources are validated.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 9999, border: "1px solid var(--border, #e5e7eb)", color: "var(--text-secondary, #555)" }}>
            {totalLinks} sources
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted, #777)" }}>
            Last updated: {lastUpdated}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted, #777)" }}>
            Curated by HIVE editorial team
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {GUIDANCE_GROUPS.map((group) => (
          <section key={group.label}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid var(--border, #e5e7eb)",
              }}
            >
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted, #888)",
                  margin: 0,
                }}
              >
                {group.label}
              </h2>
              {group.note && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#92400e",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {group.note}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.links.map((link) => (
                <a
                  className="guidance-link-card"
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    padding: "16px 20px",
                    borderRadius: 10,
                    border: "1px solid var(--border, #e5e7eb)",
                    background: "var(--surface, #fff)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#1D9E75" }}>
                          External guidance
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-muted, #888)" }}>· {group.label}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--text-primary, #1a1a1a)",
                          marginBottom: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        {link.title}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "var(--text-muted, #666)",
                          lineHeight: 1.6,
                        }}
                      >
                        {link.description}
                      </div>
                    </div>
                    <svg
                      style={{ width: 14, height: 14, color: "#1D9E75", flexShrink: 0, marginTop: 2 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
