"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <h1 style={{ color: "#b91c1c", fontSize: "1.5rem", marginBottom: "1rem" }}>
            Application error
          </h1>
          <p style={{ marginBottom: "1rem", color: "#374151" }}>
            A critical error occurred. Use the button below to try again.
          </p>
          {isDev && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                fontSize: "0.875rem",
                overflow: "auto",
              }}
            >
              <p style={{ fontWeight: 600, color: "#991b1b", marginBottom: "0.5rem" }}>
                Error (dev):
              </p>
              <p style={{ color: "#b91c1c", wordBreak: "break-word" }}>{error.message}</p>
              {error.digest && (
                <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
                  Digest: {error.digest}
                </p>
              )}
              {error.cause != null && (
                <pre style={{ marginTop: "0.5rem", fontSize: "0.75rem", overflow: "auto", maxHeight: "10rem" }}>
                  {String(error.cause)}
                </pre>
              )}
              {error.stack && (
                <pre
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.75rem",
                    overflow: "auto",
                    maxHeight: "15rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              background: "#21808B",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
