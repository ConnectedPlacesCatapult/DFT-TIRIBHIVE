import roadmapData from "@/data/roadmap/RoadmapContent.json";
import { RoadmapPageClient } from "@/components/roadmap/RoadmapPageClient";

type Workstream = Parameters<typeof RoadmapPageClient>[0]["workstreams"][number];

export default function RoadmapPage() {
  const workstreams = (roadmapData as { Workstreams: Workstream[] }).Workstreams;
  return <RoadmapPageClient workstreams={workstreams} />;
}
