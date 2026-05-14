import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drones: Barriers and Pathways to Adoption | TRIB",
  description:
    "This report summarises the outcomes of the drones barriers and pathways workshop, providing insights to support future cross-sector collaboration and research.",
};

const PDF_URL = "/docs/trib-drones-workshop.pdf";

export default function DronesPage() {
  return (
    <>
      {/* Floating back button — sits on top of the PDF */}
      <div className="fixed top-3 left-3 z-50 flex items-center gap-2">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[#212121] text-xs font-medium shadow border border-gray-200 no-underline hover:bg-white transition-colors"
        >
          ← Projects
        </Link>
        <a
          href={PDF_URL}
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#21808B]/90 backdrop-blur text-white text-xs font-medium shadow no-underline hover:bg-[#21808B] transition-colors"
        >
          ↓ Download
        </a>
      </div>

      {/* Full-viewport PDF embed */}
      <embed
        src={PDF_URL}
        type="application/pdf"
        className="fixed inset-0 w-full h-full"
        title="Drones: Barriers and Pathways to Adoption"
      />
    </>
  );
}
