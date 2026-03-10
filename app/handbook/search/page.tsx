import { searchArticles } from "@/lib/db";
import { ArticleCard } from "@/components/handbook/ArticleCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchArticles(q) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h1>

      <form method="get" className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search case studies..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search"
          />
          <button
            type="submit"
            className="bg-[#1a3a5c] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#24537f]"
          >
            Search
          </button>
        </div>
      </form>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          {results.length} result{results.length !== 1 && "s"} for &ldquo;{q}
          &rdquo;
        </p>
      )}

      <div className="space-y-4">
        {results.map((article, idx) => (
          <ArticleCard key={article.id || idx} article={article} />
        ))}
        {q && results.length === 0 && (
          <p className="text-gray-500">
            No results found for &ldquo;{q}&rdquo;. Try different keywords.
          </p>
        )}
      </div>
    </div>
  );
}
