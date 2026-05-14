"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/status";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Incorrect password");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { success?: boolean };
      if (!data.success) {
        setError("Incorrect password");
        setLoading(false);
        return;
      }
      const dest = next.startsWith("/") ? next : "/admin/status";
      router.replace(dest);
    } catch {
      setError("Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 320,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "22px 20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Admin sign-in
        </div>
        <h1 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#111827" }}>
          HIVE admin
        </h1>
        <label htmlFor="admin-password" style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 6,
            marginBottom: 12,
            fontSize: 14,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
          }}
        />
        {error && (
          <div style={{ fontSize: 12, color: "#b91c1c", marginBottom: 10 }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            fontSize: 14,
            fontWeight: 700,
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: loading ? "#9ca3af" : "#1d70b8",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <a
          href="/handbook"
          style={{ display: "block", marginTop: 14, fontSize: 12, color: "#6b7280", textAlign: "center" }}
        >
          ← Back to handbook
        </a>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
