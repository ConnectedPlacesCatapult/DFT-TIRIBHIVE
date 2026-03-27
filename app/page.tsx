import Link from "next/link";
import { NavPill } from "@/components/NavPill";
import { ObjectivesToggle } from "@/components/ObjectivesToggle";

const DESKTOP_NAV = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#members", label: "Our members" },
] as const;

const PROJECTS = [
  {
    href: "/roadmap",
    img: "/images/trib/roadmap.8694b7edb2a21f05066f.png",
    title: "Roadmap and Vision",
    slug: "/roadmap",
    description:
      "Our Vision is to enable a trusted ecosystem of connected digital twins for multi-modal UK transport networks. This will facilitate effective decision making to optimise solutions and deliver efficient, safe, and environmentally conscious mobility for people and goods.",
  },
  {
    href: "/handbook",
    img: "/images/trib/HIVE.c66281bf20b95c630434.png",
    title: "Climate Adaptation Handbook",
    slug: "/handbook",
    description:
      "Filter and browse case studies by sector, asset type, and climate hazard. Use the table view or case study cards to explore and contribute resources.",
  },
] as const;

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

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-[#21808B] text-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight leading-tight">
            Transport Research and Innovation Board
          </span>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Primary">
            {DESKTOP_NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/85 hover:text-white no-underline transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden">
            <NavPill variant="dark" pillClassName="border border-white/30" />
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="bg-white pt-14 pb-10 px-6">
          <div className="max-w-[680px] mx-auto text-center">
            <h2 className="text-[28px] font-bold text-[#21808B] mb-3 leading-tight">
              Transport Research and Innovation Board
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Connecting the organisations that fund, shape, and deliver
              transport innovation in the UK.
            </p>
          </div>
        </section>

        {/* ── About banner ───────────────────────────────────────────────── */}
        <section id="about" className="scroll-mt-16">
          <div className="bg-[#21808B] py-3 text-center">
            <h2 className="text-xl font-bold text-white tracking-wide">About</h2>
          </div>

          <div className="bg-[#f7f7f7] py-10 px-6">
            <div className="max-w-[900px] mx-auto">
              <p className="text-sm leading-relaxed text-gray-700 mb-4">
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
                  className="text-[#21808B] hover:underline"
                >
                  see more.
                </a>
              </p>
              <ObjectivesToggle />
            </div>
          </div>
        </section>

        {/* ── Projects banner ────────────────────────────────────────────── */}
        <section id="projects" className="scroll-mt-16">
          <div className="bg-[#21808B] py-3 text-center">
            <h2 className="text-xl font-bold text-white tracking-wide">Projects</h2>
          </div>

          <div className="bg-white py-10 px-6">
            <div className="max-w-[900px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PROJECTS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="group flex gap-4 bg-white border border-[#e5e7eb] rounded-lg p-5 no-underline text-inherit
                               transition-all duration-150
                               hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5"
                  >
                    {/* Thumbnail */}
                    <span className="flex-shrink-0 w-[120px] h-[80px] block bg-gray-100 rounded overflow-hidden">
                      <img
                        src={p.img}
                        alt=""
                        width={120}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </span>

                    {/* Text */}
                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className="text-[18px] font-semibold text-[#212121] mb-1 leading-snug">
                        {p.title}
                      </span>
                      <span className="text-[13px] text-[#21808B] mb-2 font-medium">
                        {p.slug}
                      </span>
                      <span className="text-[14px] text-gray-500 leading-relaxed flex-1">
                        {p.description}
                      </span>
                      <span className="mt-3 text-[13px] font-medium text-[#21808B] group-hover:underline">
                        Explore →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Members banner ─────────────────────────────────────────── */}
        <section id="members" className="scroll-mt-16">
          <div className="bg-[#21808B] py-3 text-center">
            <h2 className="text-xl font-bold text-white tracking-wide">Our Members</h2>
          </div>

          <div className="bg-white py-10 px-6">
            <div className="max-w-[800px] mx-auto">
              <p className="text-center text-sm text-gray-400 mb-8">
                Bringing together government, industry, and research to drive
                transport innovation.
              </p>
              <div className="grid gap-6"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {MEMBER_LOGOS.map((file) => (
                  <div key={file} className="flex items-center justify-center">
                    <img
                      src={`${TRIB_STATIC}/${file}`}
                      alt=""
                      className="max-h-[40px] max-w-[110px] w-auto object-contain
                                 grayscale-[20%] hover:grayscale-0 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-[#21808B] text-white py-4 px-6 text-center text-sm">
        www.trib.org.uk
      </footer>
    </div>
  );
}
