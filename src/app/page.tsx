"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResult } from "./result-context";

export default function Home() {
  const router = useRouter();
  const { setSubmittedUrl } = useResult();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmittedUrl(url.trim());
    router.push("/analyzing");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "#111827",
            }}
          >
            Before You Buy
          </span>
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 12,
            color: "#111827",
          }}
        >
          Check if a product may not be right for you
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: "#4b5563",
            marginBottom: 32,
          }}
        >
          We only flag common failure cases for actives & serums. If
          we&apos;re unsure, we&apos;ll say so.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Paste product URL here"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 15,
              color: "#111827",
              backgroundColor: "#ffffff",
            }}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSubmitting}
          />
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginTop: 10,
              marginBottom: 24,
            }}
          >
            Paste a product link to run a dermatology-informed safety screen.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              backgroundColor: isSubmitting ? "#9ca3af" : "#374151",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Processing…" : "Check product"}
          </button>
        </form>
      </div>
    </main>
  );
}
