"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResult } from "./result-context";

export default function Home() {
  const router = useRouter();
  const { setResult } = useResult();
  const [url, setUrl] = useState("");

  async function handleClick() {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            status: "avoid";
            avoid_conditions: string[];
            explanation: string;
            confidence: string;
          }
        | { status: "unknown" }
        | null;

      if (data && (data.status === "avoid" || data.status === "unknown")) {
        setResult(data);
      } else {
        setResult({ status: "unknown" });
      }
    } catch {
      setResult({ status: "unknown" });
    } finally {
      router.push("/analyzing");
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
        Check if a product may not be right for you
      </h1>
      <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
        We only flag common failure cases for actives & serums.
        If we&apos;re unsure, we&apos;ll say so.
      </p>

      <input
        placeholder="Paste product URL here"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />

      <button
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 999,
          border: "none",
          background: "#000",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        Check product
      </button>
    </main>
  );
}


