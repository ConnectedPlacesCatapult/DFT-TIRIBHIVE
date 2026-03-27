"use client";

import { useCallback, useEffect, useState } from "react";

type ServiceResult = {
  healthy: boolean;
  latencyMs: number;
  detail?: string;
  count?: number;
};

type StatusData = {
  provider: string;
  checkedAt: string;
  services: {
    azure: ServiceResult;
    supabase: ServiceResult;
    openai: ServiceResult;
  };
};

function dot(healthy: boolean) {
  return (
    <span style={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: healthy ? "#10b981" : "#ef4444",
      boxShadow: healthy ? "0 0 6px #10b981aa" : "0 0 6px #ef4444aa",
      flexShrink: 0,
    }} />
  );
}

function latencyColor(ms: number) {
  if (ms < 200) return "#10b981";
  if (ms < 800) return "#f59e0b";
  return "#ef4444";
}

function ProviderBadge({ provider }: { provider: string }) {
  const isAzure = provider === "azure";
  const isSupabase = provider === "supabase";
  const bg = isAzure ? "#eff6ff" : isSupabase ? "#f0fdf4" : "#f9fafb";
  const color = isAzure ? "#1d4ed8" : isSupabase ? "#15803d" : "#6b7280";
  const border = isAzure ? "#bfdbfe" : isSupabase ? "#bbf7d0" : "#e5e7eb";
  const label = isAzure ? "Azure PostgreSQL (primary)" : isSupabase ? "Supabase (primary)" : "JSON / static data (offline mode)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 13, fontWeight: 700, padding: "4px 14px",
      borderRadius: 9999, background: bg, color, border: `1.5px solid ${border}`,
    }}>
      {label}
    </span>
  );
}

function ServiceCard({
  name,
  icon,
  role,
  result,
  isPrimary,
  isFallback,
}: {
  name: string;
  icon: string;
  role: string;
  result: ServiceResult;
  isPrimary?: boolean;
  isFallback?: boolean;
}) {
  return (
    <div style={{
      background: "#fff",
      border: isPrimary ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      position: "relative",
      flex: "1 1 260px",
      minWidth: 260,
    }}>
      {isPrimary && (
        <span style={{
          position: "absolute", top: -11, left: 16,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          background: "#3b82f6", color: "#fff",
          padding: "2px 10px", borderRadius: 9999, textTransform: "uppercase",
        }}>
          Primary
        </span>
      )}
      {isFallback && (
        <span style={{
          position: "absolute", top: -11, left: 16,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          background: "#8b5cf6", color: "#fff",
          padding: "2px 10px", borderRadius: 9999, textTransform: "uppercase",
        }}>
          Fallback
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{name}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>{dot(result.healthy)}</div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13, fontWeight: 600,
        color: result.healthy ? "#065f46" : "#991b1b",
      }}>
        <span>{result.healthy ? "Connected" : "Unreachable"}</span>
        {result.latencyMs > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: latencyColor(result.latencyMs),
            background: "#f9fafb", border: "1px solid #e5e7eb",
            padding: "1px 8px", borderRadius: 9999,
          }}>
            {result.latencyMs}ms
          </span>
        )}
      </div>

      {result.detail && (
        <div style={{
          fontSize: 12, color: "#6b7280", lineHeight: 1.5,
          background: "#f9fafb", borderRadius: 6, padding: "8px 10px",
          borderLeft: `3px solid ${result.healthy ? "#10b981" : "#ef4444"}`,
        }}>
          {result.detail}
        </div>
      )}
    </div>
  );
}

function SyncCard({ onSync }: { onSync: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync-azure", { method: "POST" });
      const data = await res.json();
      setResult(data.message ?? (res.ok ? "Sync complete" : "Sync failed"));
      if (res.ok) onSync();
    } catch {
      setResult("Network error — sync failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10,
      flex: "1 1 260px", minWidth: 260,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🔄</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Sync Azure ← Supabase</div>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Data management</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
        Run after adding new content to Supabase. Copies new sources, articles, and chunks to Azure. Existing rows are not overwritten.
      </p>
      <button
        onClick={handleSync}
        disabled={running}
        style={{
          marginTop: 4,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 8,
          border: "none",
          background: running ? "#e5e7eb" : "#3b82f6",
          color: running ? "#9ca3af" : "#fff",
          cursor: running ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {running ? "Syncing…" : "Sync now"}
      </button>
      {result && (
        <div style={{
          fontSize: 12, padding: "6px 10px", borderRadius: 6,
          background: result.includes("failed") || result.includes("error") ? "#fef2f2" : "#f0fdf4",
          color: result.includes("failed") || result.includes("error") ? "#991b1b" : "#065f46",
          border: `1px solid ${result.includes("failed") || result.includes("error") ? "#fecaca" : "#bbf7d0"}`,
        }}>
          {result}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const provider = data?.provider ?? "json";
  const services = data?.services;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/admin/sources" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          ← Admin
        </a>
        <div style={{ width: 1, height: 16, background: "#e5e7eb" }} />
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>System Status</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {data && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              Last checked {new Date(data.checkedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              fontSize: 12, fontWeight: 600, padding: "6px 14px",
              borderRadius: 8, border: "1px solid #d1d5db",
              background: "#fff", color: "#374151", cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Checking…" : "Refresh"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Active provider banner */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          padding: "16px 24px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Active data provider:</span>
          <ProviderBadge provider={provider} />
          {provider === "azure" && (
            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}>
              Automatic fallback: Supabase → JSON
            </span>
          )}
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
            padding: "12px 16px", marginBottom: 24, color: "#991b1b", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Service cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          {services ? (
            <>
              <ServiceCard
                name="Azure PostgreSQL"
                icon="🟦"
                role="Primary database · UK South"
                result={services.azure}
                isPrimary={provider === "azure"}
                isFallback={provider === "supabase"}
              />
              <ServiceCard
                name="Supabase"
                icon="🟩"
                role="Fallback database · AWS eu-west-1"
                result={services.supabase}
                isPrimary={provider === "supabase"}
                isFallback={provider === "azure"}
              />
              <ServiceCard
                name="OpenAI"
                icon="⚡"
                role="AI embeddings & chat"
                result={services.openai}
              />
              <SyncCard onSync={refresh} />
            </>
          ) : loading ? (
            <div style={{ color: "#9ca3af", fontSize: 14, padding: 24 }}>Checking all connections…</div>
          ) : null}
        </div>

        {/* Quick links */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          padding: "16px 24px", marginTop: 8,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Admin pages
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Source candidates", href: "/admin/sources" },
              { label: "Eval runs", href: "/admin/evals" },
              { label: "Handbook", href: "/handbook" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{
                fontSize: 13, fontWeight: 500, color: "#3b82f6",
                textDecoration: "none", padding: "6px 14px",
                border: "1px solid #bfdbfe", borderRadius: 8, background: "#eff6ff",
              }}>
                {l.label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
