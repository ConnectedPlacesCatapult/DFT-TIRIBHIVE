import Link from "next/link";
import { NavPill } from "@/components/NavPill";
import { tribAssets } from "@/lib/tribAssets";

const DESKTOP_NAV = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#members", label: "Our members" },
] as const;

// Live trib.org.uk shows all six objectives inline (no toggle).
const OBJECTIVES = [
  "join-up leaders: identify priority areas; areas with most promise and where to focus effort",
  "join-up activities: co-ordinate activities to meet shared strategic needs, improving value from existing and planned work",
  "leverage funding: enable the funding of larger-scale, more ambitious projects",
  "facilitate demonstrators: accelerating ideas and testing them in practice to bring them to market sooner",
  "engage globally: seize an advantage in the rapidly evolving and economically strategic transport technology sector",
  "create a line of sight to government priorities: understand the priorities of the Secretaries of State of the Department for Transport (DfT) and other relevant departments.",
] as const;

const PROJECTS = [
  {
    href: "/roadmap",
    img: tribAssets.images.background,
    title: "Roadmap and Vision",
    slug: "/roadmap",
    description:
      "Our Vision is to enable a trusted ecosystem of connected digital twins for multi-modal UK transport networks. This will facilitate effective decision making to optimise solutions and deliver efficient, safe, and environmentally conscious mobility for people and goods.",
  },
  {
    href: "/handbook",
    img: "/images/trib/handbook-preview.png",
    title: "Climate Adaptation Handbook",
    slug: "/handbook",
    description:
      "Filter and browse case studies by sector, asset type, and climate hazard. Use the table view or case study cards to explore and contribute resources.",
  },
  {
    href: "/drones",
    img: "/images/trib/drones-workshop.png",
    title: "Drones: Barriers and Pathways to Adoption",
    slug: "/drones",
    description:
      "This report summarises the outcomes of the drones barriers and pathways workshop, providing insights to support future cross-sector collaboration and research.",
  },
] as const;

// Use real files under public/images/trib/Logos (via tribAssets) — old CRA
// hashed /static/media filenames 404 after the Next.js cutover.
const MEMBER_LOGOS = [
  { src: tribAssets.logos.dft, alt: "DfT logo" },
  { src: tribAssets.logos.cpc, alt: "CPC logo" },
  { src: tribAssets.logos.maritimeCoastguard, alt: "Maritime & Coastguard Agency logo" },
  { src: tribAssets.logos.networkRail, alt: "Network Rail logo" },
  { src: tribAssets.logos.ukri, alt: "UKRI logo" },
  { src: tribAssets.logos.hvmCatapult, alt: "HVM Catapult logo" },
  { src: tribAssets.logos.ndtpBlue, alt: "NDTP logo" },
  { src: tribAssets.logos.nationalHighways, alt: "National Highways logo" },
  { src: tribAssets.logos.adept, alt: "ADEPT logo" },
  { src: tribAssets.logos.hs2, alt: "HS2 logo" },
  { src: tribAssets.logos.innovateUk, alt: "Innovate UK logo" },
  { src: tribAssets.logos.epsrc, alt: "EPSRC logo" },
  { src: tribAssets.logos.dsit, alt: "DSIT logo" },
  { src: tribAssets.logos.rssb, alt: "RSSB logo" },
  { src: tribAssets.logos.ati, alt: "Aerospace Technology Institute logo" },
] as const;

/** Shared homepage column — keeps header/about/projects/members left edges aligned. */
const CONTENT =
  "mx-auto w-full max-w-[1120px] px-8";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#212121]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className={`${CONTENT} h-[72px] flex items-center justify-between gap-8`}>
          {/* Site title — black, bold */}
          <Link
            href="/"
            className="text-[#212121] no-underline font-bold text-lg tracking-tight leading-tight shrink-0"
          >
            Transport Research and Innovation Board
          </Link>

          {/* Desktop nav + accessibility icon */}
          <div className="hidden md:flex items-center gap-10">
            <nav className="flex items-center gap-10 text-sm font-medium" aria-label="Primary">
              {DESKTOP_NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[#212121] hover:text-[#21808B] no-underline transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            {/* Accessibility icon */}
            <a
              href="/roadmap/accessibility"
              aria-label="Accessibility statement"
              className="text-[#212121] hover:text-[#21808B] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
                <path d="M9 12h6" />
                <path d="M10 16l-1 3" />
                <path d="M14 16l1 3" />
                <path d="M12 12v4" />
              </svg>
            </a>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden shrink-0">
            <NavPill variant="light" />
          </div>
        </div>
      </header>

      <main>

        {/* ── About ──────────────────────────────────────────────────────── */}
        <section id="about" className="scroll-mt-20">
          <div className="bg-[#21808B] py-2.5 text-center">
            <h2 className="text-[26px] font-semibold text-white leading-tight m-0">
              About
            </h2>
          </div>

          <div className="bg-white pt-10 pb-12">
            <div className={CONTENT}>
              <p className="text-base leading-relaxed text-[#212121] mb-4">
                The Transport Research and Innovation Board (TRIB) brings together
                representatives from key organisations that fund and carry out
                research and innovation in the UK, as well as government departments
                with an interest in transport.
              </p>
              <p className="text-base leading-relaxed text-[#212121] mb-5">
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
              <p className="text-base leading-relaxed text-[#212121] mb-3">
                The objectives of the board are to:
              </p>
              <ul
                className="text-base leading-relaxed text-[#212121] mb-5 space-y-2"
                style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
              >
                {OBJECTIVES.map((obj) => (
                  <li key={obj} style={{ display: "list-item" }}>{obj}</li>
                ))}
              </ul>
              <p className="text-base leading-relaxed text-[#212121] mb-4">
                DfT provides the secretariat for the TRIB Board.
              </p>
              <p className="text-base leading-relaxed text-[#212121] mb-4">
                The TRIB Board has awarded Connected Places Catapult (CPC) a grant
                to develop this shared 2035 Vision and Roadmap.
              </p>
              <p className="text-base leading-relaxed text-[#212121]">
                We would like to thank the following organisations for their
                contribution to the project.
              </p>
            </div>
          </div>
        </section>

        {/* ── Projects ───────────────────────────────────────────────────── */}
        <section id="projects" className="scroll-mt-20">
          <div className="bg-[#21808B] py-2.5 text-center">
            <h2 className="text-[26px] font-semibold text-white leading-tight m-0">
              Projects
            </h2>
          </div>

          <div className="bg-white py-12">
            <div className={CONTENT}>
              {/* 3-up on desktop so three cards share one row (no orphan left card). */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROJECTS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="group flex flex-col gap-4 bg-white border border-[#e5e7eb] rounded-lg p-5 no-underline text-inherit
                               transition-all duration-150
                               hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5"
                  >
                    <span className="flex-shrink-0 w-full h-[120px] block bg-gray-100 rounded overflow-hidden">
                      <img
                        src={p.img}
                        alt=""
                        width={320}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </span>

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

        {/* ── Our Members ────────────────────────────────────────────────── */}
        <section id="members" className="scroll-mt-20">
          <div className="bg-[#21808B] py-2.5 text-center">
            <h2 className="text-[26px] font-semibold text-white leading-tight m-0">
              Our Members
            </h2>
          </div>

          <div className="bg-white py-12">
            <div className={CONTENT}>
              <p className="text-center text-sm text-gray-400 mb-8">
                Bringing together government, industry, and research to drive
                transport innovation.
              </p>
              <div className="grid justify-items-center gap-x-6 gap-y-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                {MEMBER_LOGOS.map((logo) => (
                  <div key={logo.src} className="flex h-12 w-full items-center justify-center">
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-10 max-w-[120px] w-auto object-contain
                                 grayscale-[20%] hover:grayscale-0 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-[#21808B] text-white py-4 text-center text-sm">
        <div className={CONTENT}>
          <a
            href="https://www.trib.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-2 hover:no-underline"
          >
            www.trib.org.uk
          </a>
        </div>
      </footer>
    </div>
  );
}
