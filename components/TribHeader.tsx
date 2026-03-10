import Link from "next/link";

export interface TribHeaderProps {
  /** Use handbook sub-nav (About, Credits, Search). Default false. */
  showHandbookLinks?: boolean;
  /** Optional class for header container (e.g. roadmap uses dark bg) */
  className?: string;
}

export function TribHeader({
  showHandbookLinks = false,
  className = "",
}: TribHeaderProps) {
  return (
    <div
      className={
        "flex items-center justify-between px-6 py-3 max-w-7xl mx-auto " +
        className
      }
    >
      <Link href="/" className="font-bold text-lg text-inherit no-underline">
        TRIB
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/" className="text-inherit no-underline hover:underline">
          Home
        </Link>
        <Link
          href="/handbook"
          className="text-inherit no-underline hover:underline"
        >
          Handbook
        </Link>
        <Link
          href="/roadmap"
          className="text-inherit no-underline hover:underline"
        >
          Roadmap
        </Link>
        {showHandbookLinks && (
          <>
            <Link
              href="/handbook/about"
              className="text-inherit no-underline hover:underline"
            >
              About
            </Link>
            <Link
              href="/handbook/credits"
              className="text-inherit no-underline hover:underline"
            >
              Credits
            </Link>
            <Link
              href="/handbook/search"
              className="text-inherit no-underline hover:underline"
            >
              Search
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
