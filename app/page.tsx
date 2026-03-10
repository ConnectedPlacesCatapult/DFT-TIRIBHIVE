import Link from "next/link";
import { NavPill } from "@/components/NavPill";

const TRIB_STATIC = "https://trib.org.uk/static/media";
const MEMBER_LOGOS = [
  "DfT_3298_AW%20(002).3c2a74265186dc09b768.png",
  "CPC_Logo_RGB_green.2e844a0ec0f236955a2e.png",
  "MCA.ee49a64ef695f2a790ae.png",
  "Network_Rail.7f9e82f680eb52f17be1.jpg",
  "UKRI-Logo_Horiz-RGB.18cd2fdd3d8cc787ac7d.png",
  "HVM_Catapult.4512adeec38d48394518.jpg",
  "NDTP-logo-v3-HM%20Gov-Blue.1f9900163c2670069e34.jpg",
  "National_Highways.9317ede34501e1baea9b.png",
  "Adept_Master_Logo_RGB_HR.bec5bf910613036e29ae.png",
  "Innovate_UK.82d14e83727652da2230.png",
  "UKRI_EPSR_Council-Logo_Horiz-RGB.cbe3fd283578f5f43971.png",
  "DSIT_Colour_Main.f6d14a64802789dbbecd.png",
  "RSSB_MASTER_LOGO_DIGITAL_LR.2d41fffa42a484cc0019.png",
  "__sitelogo__Hi%20Res%20Logo.536f7b02f91c9dc16f81.png",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#212121]">
      <header className="bg-[#21808B] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              Transport Research and Innovation Board
            </h1>
            <NavPill variant="dark" pillClassName="border border-white/30" />
          </div>
        </div>
      </header>

      <main>
        {/* About - light band */}
        <section className="bg-[#f5f5f5] py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[28px] font-bold mb-4 text-[#212121]">
              About
            </h2>
            <p className="text-[14.67px] leading-relaxed mb-4">
              The Transport Research and Innovation Board (TRIB) brings together
              representatives from key organisations that fund and carry out
              research and innovation in the UK, as well as government departments
              with an interest in transport.
              <br />
              For more information about TRIB, please{" "}
              <a
                href="https://www.gov.uk/government/groups/transport-research-and-innovation-board"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#21BA45] hover:underline"
              >
                see more.
              </a>
            </p>
            <p className="text-[14.67px] leading-relaxed mb-2">
              The objectives of the board are to:
            </p>
            <ul className="list-disc pl-6 text-[14.67px] leading-relaxed space-y-1">
              <li>join-up leaders: identify priority areas; areas with most promise and where to focus effort</li>
              <li>join-up activities: co-ordinate activities to meet shared strategic needs, improving value from existing and planned work</li>
              <li>leverage funding: enable the funding of larger-scale, more ambitious projects</li>
              <li>facilitate demonstrators: accelerating ideas and testing them in practice to bring them to market sooner</li>
              <li>engage globally: seize an advantage in the rapidly evolving and economically strategic transport technology sector</li>
              <li>create a line of sight to government priorities: understand the priorities of the Secretaries of State of the Department for Transport (DfT) and other relevant departments.</li>
            </ul>
          </div>
        </section>

        {/* Projects - teal band header + light content */}
        <section className="bg-[#21808B] text-white py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[28px] font-bold">Projects</h2>
          </div>
        </section>
        <section className="bg-white py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link
                href="/roadmap"
                className="group flex gap-4 p-4 border border-gray-200 rounded-[4px] hover:border-[#21808B] hover:shadow-md transition-colors no-underline text-inherit"
              >
                <span className="flex-shrink-0 w-40 h-24 block bg-gray-100 rounded overflow-hidden">
                  <img
                    src="/images/trib/roadmap.8694b7edb2a21f05066f.png"
                    alt=""
                    width={160}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className="min-w-0 block">
                  <span className="text-lg font-semibold mb-1 block text-[#212121]">
                    Roadmap and Vision
                  </span>
                  <span className="text-[14.67px] text-[#21BA45] mb-2 block">/roadmap</span>
                  <span className="text-[14.67px] text-gray-700 block">
                    Our Vision is to enable a trusted ecosystem of connected digital
                    twins for multi-modal UK transport networks. This will
                    facilitate effective decision making to optimise solutions and
                    deliver efficient, safe, and environmentally conscious mobility
                    for people and goods.
                  </span>
                </span>
              </Link>

              <Link
                href="/handbook"
                className="group flex gap-4 p-4 border border-gray-200 rounded-[4px] hover:border-[#21808B] hover:shadow-md transition-colors no-underline text-inherit"
              >
                <span className="flex-shrink-0 w-40 h-24 block bg-gray-100 rounded overflow-hidden">
                  <img
                    src="/images/trib/HIVE.c66281bf20b95c630434.png"
                    alt=""
                    width={160}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className="min-w-0 block">
                  <span className="text-lg font-semibold mb-1 block text-[#212121]">
                    Climate Adaptation Handbook
                  </span>
                  <span className="text-[14.67px] text-[#21BA45] mb-2 block">/handbook</span>
                  <span className="text-[14.67px] text-gray-700 block">
                    Filter and browse case studies by sector, asset type, and climate
                    hazard. Use the table view or case study cards to explore and
                    contribute resources.
                  </span>
                </span>
              </Link>

              <Link
                href="/hive"
                className="group flex gap-4 p-4 border border-gray-200 rounded-[4px] hover:border-[#21808B] hover:shadow-md transition-colors no-underline text-inherit"
              >
                <span className="flex-shrink-0 w-40 h-24 block bg-gray-100 rounded overflow-hidden">
                  <img
                    src="/images/trib/HIVE.c66281bf20b95c630434.png"
                    alt=""
                    width={160}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className="min-w-0 block">
                  <span className="text-lg font-semibold mb-1 block text-[#212121]">
                    Explore HIVE
                  </span>
                  <span className="text-[14.67px] text-[#21BA45] mb-2 block">/hive</span>
                  <span className="text-[14.67px] text-gray-700 block">
                    Search in plain English, explore the case study marquee, and build
                    AI briefs. New experience based on the HIVE design directions.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Our Members - teal band for heading only; logos on white (per live site) */}
        <section className="bg-[#21808B] text-white py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[28px] font-bold">Our Members</h2>
          </div>
        </section>
        <section className="bg-white py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-6 items-center justify-start">
              {MEMBER_LOGOS.map((file) => (
                <img
                  key={file}
                  src={`${TRIB_STATIC}/${file}`}
                  alt=""
                  className="h-12 w-auto object-contain rounded px-1 py-0.5"
                />
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-[#21808B] text-white py-4 px-6 text-center text-sm">
          www.trib.org.uk
        </footer>
      </main>
    </div>
  );
}
