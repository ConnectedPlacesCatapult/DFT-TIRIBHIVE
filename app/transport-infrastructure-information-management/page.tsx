import Link from "next/link";
import type { Metadata } from "next";
import { DocumentCollectionEntry } from "@/components/trib/DocumentCollectionEntry";
import { informationManagementCollection } from "@/data/trib/transport-infrastructure-information-management";

export const metadata: Metadata = {
  title: "Transport Infrastructure Information Management | TRIB",
  description: informationManagementCollection.standfirst[0],
};

const shellStyle = {
  width: "100%",
  maxWidth: 960,
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: 24,
  paddingRight: 24,
  boxSizing: "border-box" as const,
};

export default function InformationManagementCollectionPage() {
  const documents = informationManagementCollection.documents
    .slice()
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-white text-[#212121]">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div
          style={{
            ...shellStyle,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            href="/#projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#21808B] no-underline hover:underline"
          >
            ← Projects
          </Link>
          <span className="text-sm text-gray-500 hidden sm:inline">TRIB</span>
        </div>
      </header>

      <div className="bg-[#21808B] py-2.5 text-center">
        <p className="text-[26px] font-semibold text-white leading-tight m-0">
          {informationManagementCollection.title}
        </p>
      </div>

      <main style={{ ...shellStyle, paddingTop: 40, paddingBottom: 48 }}>
        <div
          style={{
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
            marginBottom: 56,
          }}
        >
          {informationManagementCollection.standfirst.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              style={{
                fontSize: 16,
                lineHeight: 1.625,
                color: "#212121",
                margin: "0 0 16px 0",
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div
          style={{
            maxWidth: 820,
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {documents.map((document) => (
            <DocumentCollectionEntry
              key={document.slug}
              document={document}
              collectionSlug={informationManagementCollection.slug}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
