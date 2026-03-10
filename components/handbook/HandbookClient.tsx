"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Article, Option } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";
import { FilterForm } from "./FilterForm";
import { HandbookHeader } from "./HandbookHeader";
import { OptionsTableView } from "./OptionsTableView";

interface HandbookClientProps {
  initialArticles: Article[];
  initialOptions: Option[];
  allRisks: string[];
  allAssets: string[];
  riskToAssetMap: Record<string, string[]>;
  assetToRiskMap: Record<string, string[]>;
  sectors: string[];
  effects: string[];
}

export function HandbookClient({
  initialArticles,
  initialOptions,
  allRisks,
  allAssets,
  riskToAssetMap,
  assetToRiskMap,
  sectors,
  effects,
}: HandbookClientProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cases" | "options">("cases");
  const [hasExplored, setHasExplored] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableAssets = selectedRisk
    ? riskToAssetMap[selectedRisk] || allAssets
    : allAssets;

  const availableRisks = selectedAsset
    ? assetToRiskMap[selectedAsset] || allRisks
    : allRisks;

  const handleExplore = useCallback(async () => {
    setHasExplored(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSector) params.set("sector", selectedSector);
      if (selectedRisk) params.set("risk", selectedRisk);
      if (selectedAsset) params.set("asset", selectedAsset);
      if (selectedEffect) params.set("effect", selectedEffect);
      const res = await fetch(`/api/handbook/data?${params}`);
      const data = await res.json();
      setArticles(data.rows);
    } catch {
      console.error("Filter failed");
    } finally {
      setLoading(false);
    }
  }, [selectedSector, selectedRisk, selectedAsset, selectedEffect]);

  const runSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setArticles(initialArticles);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/handbook/search?search=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setArticles(data.rows);
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    },
    [initialArticles]
  );

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      runSearch(searchQuery);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, runSearch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedSector("");
    setSelectedRisk("");
    setSelectedAsset("");
    setSelectedEffect("");
    setSearchQuery("");
    setArticles(initialArticles);
    setHasExplored(false);
  }, [initialArticles]);

  const showRiskBanner = !selectedRisk;
  const showAssetBanner = !selectedAsset;

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <HandbookHeader
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Q Search..."
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100/80 w-fit mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("cases")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "cases"
                ? "bg-white text-[#21808B] shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            Case Study View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("options")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "options"
                ? "bg-white text-[#21808B] shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            Options Table View
          </button>
        </div>

        {activeTab === "cases" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
              <div className="lg:col-span-5 xl:col-span-6 flex items-center">
                <p className="text-[22px] leading-[1.35] text-[#374151] font-normal max-w-lg">
                  Explore and contribute resources and best practices for climate change adaptation from all transport modes
                </p>
              </div>
              <div className="lg:col-span-7 xl:col-span-6 space-y-5">
                <div className="rounded-xl border border-gray-200/90 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Refine results</p>
                  <FilterForm
                    sectors={sectors}
                    allRisks={availableRisks}
                    allAssets={availableAssets}
                    effects={effects}
                    selectedSector={selectedSector}
                    selectedRisk={selectedRisk}
                    selectedAsset={selectedAsset}
                    selectedEffect={selectedEffect}
                    onSectorChange={setSelectedSector}
                    onRiskChange={setSelectedRisk}
                    onAssetChange={setSelectedAsset}
                    onEffectChange={setSelectedEffect}
                    onExplore={handleExplore}
                    onReset={handleReset}
                  />
                </div>
                <div className="rounded-lg bg-gray-50/80 border border-gray-100 p-4 text-sm text-[#4B5563] leading-relaxed space-y-2">
                  <p>
                    If you do not select any filters, the full case study library will be shown. Any number of filters can be selected to refine the case studies returned. Please note that the selected hazard cause and hazard effect may not always be compatible.
                  </p>
                  <p>
                    Before selecting the right adaptation method, it is important that you conduct a full{" "}
                    <a href="https://www.gov.uk/government/publications/climate-change-risk-assessment-transport-sector" target="_blank" rel="noopener noreferrer" className="text-[#21808B] hover:underline font-medium">climate risk assessment</a>.{" "}
                    <a href="https://www.gov.uk/government/collections/climate-change-adaptation-reporting-fourth-round-reports" target="_blank" rel="noopener noreferrer" className="text-[#21808B] font-medium hover:underline">Find risk assessment policy and guidance</a> from different organisations.
                  </p>
                </div>
              </div>
            </div>

            <section className="border-t border-gray-200/80 pt-10 pb-12 bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(0_0_0_/0.06)] px-6 sm:px-8 -mx-6 sm:-mx-8">
              <div className="space-y-6">
                {(showRiskBanner || showAssetBanner) && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {showRiskBanner && (
                      <div className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-[#FEF2F2] text-[#991B1B] text-sm font-medium border border-[#FECACA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" aria-hidden />
                        Risk not provided
                      </div>
                    )}
                    {showAssetBanner && (
                      <div className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-[#FFFBEB] text-[#92400E] text-sm font-medium border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" aria-hidden />
                        Asset not provided
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <a href="#" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#21808B] text-white text-sm font-medium hover:bg-[#1a6b73] transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    Upload a resource
                  </a>
                  <a href="#" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#21808B] text-white text-sm font-medium hover:bg-[#1a6b73] transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Suggest a link
                  </a>
                </div>

                {loading && (
                  <p className="text-sm text-[#6B7280]">Loading…</p>
                )}

                <p className="text-sm font-medium text-[#374151]">
                  {articles.length} result{articles.length !== 1 ? "s" : ""} found
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                  {articles.map((article, idx) => (
                    <ArticleCard key={article.id ?? idx} article={article} />
                  ))}
                  {articles.length === 0 && !loading && (
                    <div className="sm:col-span-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-14 text-center">
                      <p className="text-[#374151] font-medium mb-1">No results found</p>
                      <p className="text-sm text-[#6B7280]">Try adjusting your filters or click Explore to see the full library.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "options" && (
          <div className="mt-4">
            <OptionsTableView options={initialOptions} loading={false} />
          </div>
        )}
      </main>
    </div>
  );
}
