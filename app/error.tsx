"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-white p-8 text-[#212121] font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="mb-4 text-gray-700">
          The page failed to load. Use the button below to try again.
        </p>
        {isDev && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm overflow-auto">
            <p className="font-semibold text-red-800 mb-2">Error (dev):</p>
            <p className="text-red-700 break-words">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-gray-600">Digest: {error.digest}</p>
            )}
            {error.cause != null && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {String(error.cause)}
              </pre>
            )}
            {error.stack && (
              <pre className="mt-2 text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-[#21808B] text-white rounded hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
