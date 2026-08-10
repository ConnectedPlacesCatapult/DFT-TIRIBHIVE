import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getInformationManagementDocument,
  informationManagementCollection,
} from "@/data/trib/transport-infrastructure-information-management";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return informationManagementCollection.documents.map((document) => ({
    slug: document.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getInformationManagementDocument(slug);

  if (!document) {
    return { title: "Report not found | TRIB" };
  }

  return {
    title: `${document.title} | TRIB`,
    description: document.description,
  };
}

export default async function InformationManagementDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = getInformationManagementDocument(slug);

  if (!document) {
    notFound();
  }

  return (
    <>
      <div className="fixed top-3 left-3 z-50 flex items-center gap-2">
        <Link
          href={`/${informationManagementCollection.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[#212121] text-xs font-medium shadow border border-gray-200 no-underline hover:bg-white transition-colors"
        >
          ← Reports
        </Link>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[#212121] text-xs font-medium shadow border border-gray-200 no-underline hover:bg-white transition-colors"
        >
          Projects
        </Link>
        <a
          href={document.pdfPath}
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#21808B]/90 backdrop-blur text-white text-xs font-medium shadow no-underline hover:bg-[#21808B] transition-colors"
        >
          ↓ Download
        </a>
      </div>

      <embed
        src={document.pdfPath}
        type="application/pdf"
        className="fixed inset-0 w-full h-full"
        title={document.title}
      />
    </>
  );
}
