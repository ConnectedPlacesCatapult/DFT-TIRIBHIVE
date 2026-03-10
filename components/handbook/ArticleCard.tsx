import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const title = article.adaptation_measure_title || article.title || "Untitled";
  const subtitle = article.title && article.title !== article.adaptation_measure_title
    ? article.title
    : null;
  const href = article.source_url || "#";
  const description = article.adaptation_measure || article.case_study || "";

  return (
    <article
      className="p-6 border rounded-xl transition-shadow hover:shadow-md"
      style={{
        backgroundColor: "var(--case-study-green)",
        borderColor: "var(--border-case-study-green)",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
      }}
    >
      <p
        className="text-sm font-normal mb-2"
        style={{ color: "var(--green-text)" }}
      >
        <span aria-hidden className="mr-1">&lt;</span> Case Study
      </p>
      <h3 className="text-lg font-bold mb-1" style={{ color: "var(--TRIB-Green-Primary)" }}>
        {href && href !== "#" ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--TRIB-Green-Primary)" }}
          >
            {title}
          </a>
        ) : (
          <span>{title}</span>
        )}
      </h3>
      {subtitle && (
        <p className="text-sm font-bold mb-3" style={{ color: "rgba(0, 0, 0, 0.87)" }}>
          {subtitle}
        </p>
      )}
      {description && (
        <div
          className="mb-4 whitespace-pre-line"
          style={{
            fontSize: "14px",
            lineHeight: "1.4285em",
            color: "rgba(0, 0, 0, 0.87)",
          }}
        >
          {description}
        </div>
      )}
      {article.source_url && (
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--button-dark)" }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Go to resource
        </a>
      )}
    </article>
  );
}
