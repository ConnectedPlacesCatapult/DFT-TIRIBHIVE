"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { TribHeader } from "@/components/TribHeader";
import { RoadmapTable } from "@/components/roadmap/RoadmapTable";

type Workstream = Parameters<typeof RoadmapTable>[0]["workstreams"][number];

interface RoadmapPageClientProps {
  workstreams: Workstream[];
}

export function RoadmapPageClient({ workstreams }: RoadmapPageClientProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const scrollToTable = () => {
    setRevealed(true);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#15335E]">
      <style>{`
        @keyframes roadmap-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .roadmap-table-reveal {
          animation: roadmap-slide-up 0.5s ease-out forwards;
        }
      `}</style>

      <header className="bg-[#15335E] text-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            TRIB - Digital Twin Roadmap 2035
          </h1>
          <TribHeader className="!text-white" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-[40px] font-bold mb-6" style={{ fontFamily: "Roboto, sans-serif" }}>
          2035 Vision
        </h2>
        <p className="text-[20px] leading-relaxed mb-6" style={{ fontFamily: "Roboto, sans-serif" }}>
          Our Vision is to enable a trusted ecosystem of connected digital twins
          for multi-modal UK transport networks. This will facilitate effective
          decision making to optimise solutions and deliver efficient, safe, and
          environmentally conscious mobility for people and goods.
        </p>
        <p className="text-[20px] leading-relaxed mb-2">
          The Roadmap will:
        </p>
        <ul className="list-disc pl-6 text-[20px] leading-relaxed space-y-2 mb-8">
          <li>Be an essential tool for engagement and alignment around common strategic priorities</li>
          <li>Provide an outline of the activities and building blocks to deliver the vision</li>
          <li>Enable improved facilitation and coordination across TRIB member bodies and other broader stakeholders in future investment in digital twinning research and innovation, connected digital twins and cyber-physical infrastructure</li>
          <li>Enable a socio-environmental and technical change in the transport sector</li>
        </ul>
      </main>

      <footer className="bg-[#15335E] text-white py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xl font-bold">ROADMAP</span>
          <button
            type="button"
            onClick={scrollToTable}
            className="border border-white bg-transparent text-white px-5 py-2 rounded-[10px] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            View Roadmap ↑
          </button>
        </div>
      </footer>

      <div
        ref={tableRef}
        id="roadmap-table"
        className={`bg-[#15335E] ${revealed ? "roadmap-table-reveal" : "opacity-0 translate-y-6"}`}
      >
        <RoadmapTable workstreams={workstreams} onHideClick={scrollToTop} />
      </div>
    </div>
  );
}
