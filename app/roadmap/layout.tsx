import "./trib.css";
import RoadmapShell from "@/components/roadmap/RoadmapShell";

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <RoadmapShell>{children}</RoadmapShell>;
}
