import Link from "next/link";
import type { InformationManagementDocument } from "@/data/trib/transport-infrastructure-information-management";

type DocumentCollectionEntryProps = {
  document: InformationManagementDocument;
  collectionSlug: string;
};

export function DocumentCollectionEntry({
  document,
  collectionSlug,
}: DocumentCollectionEntryProps) {
  const href = `/${collectionSlug}/${document.slug}`;

  return (
    <Link
      href={href}
      className="group block bg-white border border-[#e5e7eb] rounded-lg p-6 no-underline text-inherit
                 transition-all duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5"
    >
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        <div className="flex-shrink-0 w-[106px] h-[150px] bg-[#f3f4f6] rounded overflow-hidden mx-auto md:mx-0">
          <img
            src={document.coverImage}
            alt={document.coverAlt}
            width={106}
            height={150}
            className="w-full h-full object-contain object-top"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col text-center md:text-left">
          <h2 className="text-[18px] font-semibold text-[#212121] mb-2 leading-snug m-0">
            {document.title}
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-5 m-0">
            {document.description}
          </p>

          <div className="mt-auto pt-4 border-t border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[13px] text-gray-500 leading-relaxed m-0">
              File type: {document.fileType}
              <span className="hidden sm:inline"> · </span>
              <br className="sm:hidden" />
              File size: {document.fileSize}
            </p>
            <span className="inline-flex items-center justify-center gap-1 text-[14px] font-medium text-[#21808B] group-hover:underline shrink-0">
              Open report →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
