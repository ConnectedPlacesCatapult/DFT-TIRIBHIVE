import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_STUDIES } from "@/lib/hive/seed-data";
import { CasePageClient } from "@/components/handbook/case/CasePageClient";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { id } = await params;
  const cs = CASE_STUDIES.find((c) => c.id === id);
  if (!cs) {
    return { title: "Case study — HIVE" };
  }
  return {
    title: `${cs.title} — HIVE`,
    description: cs.summary ?? "Case study from the HIVE Climate Adaptation Handbook.",
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const cs = CASE_STUDIES.find((c) => c.id === id);
  if (!cs) return notFound();
  return <CasePageClient id={id} />;
}
