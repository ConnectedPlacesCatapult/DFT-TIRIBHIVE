export type InformationManagementDocument = {
  order: number;
  slug: string;
  title: string;
  description: string;
  pdfPath: string;
  coverImage: string;
  coverAlt: string;
  fileType: "pdf";
  fileSize: string;
};

export const informationManagementCollection = {
  slug: "transport-infrastructure-information-management",
  title: "Transport Infrastructure Information Management",
  standfirst: [
    "How transport infrastructure is planned, delivered, and operated increasingly depends on the quality of its digital information. While the UK has led internationally on BIM policy and standards, the benefits of digital construction and Information Management are not yet being realised consistently across transport programmes or asset lifecycles.",
    "Connected Places Catapult has published two reports that together set out a clear direction for the UK transport sector. One defines a shared vision for Information Management, developed with the Department for Transport and its Arm's-Length Bodies. The other captures observations from a DfT visit to Norway, a country that has embedded a model-based approach to delivery across road and rail infrastructure through strong public-sector leadership and consistent implementation.",
    "The shared vision, informed by the Norway visit, sets out a future for the UK transport infrastructure sector, why this matters now, and the areas to focus on to achieve lasting, and valuable change.",
  ],
  documents: [
    {
      order: 1,
      slug: "shared-vision",
      title: "Transport Infrastructure Information Management: A Shared Vision",
      description:
        "Defines a shared vision for information management across UK transport infrastructure, developed with DfT and its Arm's-Length Bodies.",
      pdfPath: "/docs/trib-shared-vision-information-management.pdf",
      coverImage: "/images/trib/transport-infrastructure-cover.png",
      coverAlt:
        "Night-time aerial view of roads and transport networks on the Shared Vision report cover",
      fileType: "pdf",
      fileSize: "13.3Mb",
    },
    {
      order: 2,
      slug: "norway-visit-report",
      title: "Digital Construction in Norwegian Infrastructure: visit report",
      description:
        "Observations from a DfT visit to Norway on embedding a model-based approach to road and rail infrastructure delivery.",
      pdfPath: "/docs/trib-norwegian-infrastructure-visit-report.pdf",
      coverImage: "/images/trib/norwegian-infrastructure-cover.png",
      coverAlt:
        "Aerial coastal view on the Digital Construction in Norwegian Infrastructure visit report cover",
      fileType: "pdf",
      fileSize: "65.69Mb",
    },
  ] satisfies InformationManagementDocument[],
} as const;

export function getInformationManagementDocument(slug: string) {
  return informationManagementCollection.documents.find((doc) => doc.slug === slug);
}
