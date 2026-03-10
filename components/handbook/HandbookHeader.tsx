"use client";

import Link from "next/link";

interface HandbookHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

export function HandbookHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Q Search...",
}: HandbookHeaderProps) {
  return (
    <header className="border-b border-gray-200/80 bg-white shadow-[0_1px_3px_0_rgb(0_0_0_/0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-[#21808B] no-underline hover:opacity-85 transition-opacity"
          >
            <h1 className="text-xl font-bold tracking-tight text-[#21808B]">
              TRIB - CLIMATE ADAPTATION HIVE
            </h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[#374151] no-underline hover:text-[#21808B] transition-colors">Home</Link>
            <Link href="/roadmap" className="text-sm text-[#374151] no-underline hover:text-[#21808B] transition-colors">Roadmap</Link>
            <Link href="/handbook/about" className="text-sm text-[#374151] no-underline hover:text-[#21808B] transition-colors">About</Link>
            <Link href="/handbook/credits" className="text-sm text-[#374151] no-underline hover:text-[#21808B] transition-colors">Credits</Link>
            <a href="mailto:contact@trib.org.uk" className="text-sm text-[#374151] no-underline hover:text-[#21808B] transition-colors">Contact Us</a>
            <div className="relative w-48">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-9 text-sm text-[#111] placeholder:text-gray-400 focus:border-[#21808B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#21808B]/20 transition-colors"
                aria-label="Search case studies"
              />
              <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Link
              href="/handbook/about#info"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21808B] text-white text-xs font-semibold no-underline hover:bg-[#1a6b73] transition-colors"
              title="Information"
              aria-label="Information"
            >
              i
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
