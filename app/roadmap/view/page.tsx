import Link from "next/link";
import { RoadmapTable } from "@/components/roadmap/RoadmapTable";
import roadmapData from "@/data/roadmap/RoadmapContent.json";

type Workstream = Parameters<typeof RoadmapTable>[0]["workstreams"][number];

export default function RoadmapViewPage() {
  const workstreams = (roadmapData as { Workstreams: Workstream[] }).Workstreams;

  return (
    <div className="min-h-screen bg-[#15335E]">
      <header className="bg-[#15335E] text-white border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#9DEDDA]">
            TRIB - DIGITAL TWIN ROADMAP 2035
          </h1>
          <nav className="flex items-center gap-6 text-sm text-white/90">
            <Link href="/roadmap" className="hover:text-white">
              Vision
            </Link>
            <Link href="/roadmap" className="hover:text-white">
              About
            </Link>
            <Link href="/roadmap" className="hover:text-white">
              Future scenarios
            </Link>
            <Link href="/roadmap" className="hover:text-white">
              Case studies
            </Link>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/handbook" className="hover:text-white">
              Handbook
            </Link>
          </nav>
        </div>
      </header>

      <RoadmapTable workstreams={workstreams} />

      <footer className="bg-[#15335E] border-t border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-white">ROADMAP</span>
          <Link
            href="/roadmap"
            className="border border-white bg-transparent text-white px-4 py-2 rounded text-sm font-medium hover:bg-white/10"
          >
            View Roadmap ↑
          </Link>
        </div>
      </footer>
    </div>
  );
}
