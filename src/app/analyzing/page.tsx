"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useResult,
  type Extraction,
  type RiskAssessment,
} from "../result-context";

type Step = "idle" | "done";

export default function Analyzing() {
  const router = useRouter();
  const {
    submittedUrl,
    setSubmittedUrl,
    setExtraction,
    setRiskAssessment,
    setProductName,
  } = useResult();

  const [step1, setStep1] = useState<Step>("idle");
  const [step2, setStep2] = useState<Step>("idle");
  const [step3, setStep3] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = submittedUrl;
    if (!url) {
      return;
    }

    let cancelled = false;

    async function runAnalysis() {
      setError(null);
      setStep1("done"); // Extracting formulation details (request sent)

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (cancelled) return;
        setStep2("done"); // Identifying active compounds (response received)

        const json = (await response.json().catch(() => null)) as
          | {
              product_name?: string;
              extraction?: Partial<Extraction>;
              risk_assessment?: Partial<RiskAssessment> | null;
            }
          | null;

        const rawProductName =
          typeof json?.product_name === "string" ? json.product_name : "";
        const raw = json?.extraction ?? null;
        const rawRisk = json?.risk_assessment ?? null;

        const safeExtraction: Extraction = {
          ingredients: Array.isArray(raw?.ingredients)
            ? raw.ingredients.map((item) => String(item))
            : [],
          detected_actives: Array.isArray(raw?.detected_actives)
            ? raw.detected_actives.map((item) => String(item))
            : [],
          concentration_clues:
            raw && typeof raw.concentration_clues === "string"
              ? raw.concentration_clues
              : "unknown",
          usage_instructions:
            raw && typeof raw.usage_instructions === "string"
              ? raw.usage_instructions
              : "unknown",
        };

        const validLevel = (v: unknown): "low" | "medium" | "high" =>
          v === "low" || v === "medium" || v === "high" ? v : "low";

        const safeRiskAssessment: RiskAssessment | null = rawRisk
          ? {
              avoid_if: Array.isArray(rawRisk.avoid_if)
                ? rawRisk.avoid_if.map((s) => String(s))
                : [],
              risk_reasons: Array.isArray(rawRisk.risk_reasons)
                ? rawRisk.risk_reasons.map((s) => String(s))
                : [],
              confidence_level: validLevel(rawRisk.confidence_level),
              confidence_reason:
                typeof rawRisk.confidence_reason === "string"
                  ? rawRisk.confidence_reason
                  : "unknown",
              disclaimer:
                typeof rawRisk.disclaimer === "string"
                  ? rawRisk.disclaimer
                  : "This is a general, dermatologist-informed assessment, not a medical diagnosis",
            }
          : null;

        if (cancelled) return;
        setStep3("done"); // Applying safety heuristics (parsed)

        setProductName(rawProductName || null);
        setExtraction(safeExtraction);
        setRiskAssessment(safeRiskAssessment);

        // Brief pause so the user sees all three steps completed
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (cancelled) return;
        setSubmittedUrl(null);
        router.replace("/result");
      } catch {
        if (!cancelled) {
          setError(
            "The safety screen could not be completed. The link may be invalid or the service is temporarily unavailable."
          );
        }
      }
    }

    runAnalysis();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 8,
            padding: 32,
            border: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              color: "#111827",
            }}
          >
            Processing could not be completed
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.5,
              color: "#4b5563",
              marginBottom: 24,
            }}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Return to start
          </button>
        </div>
      </main>
    );
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
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          padding: "40px 32px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 6,
            color: "#111827",
          }}
        >
          Processing Dermatology Safety Screen
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: "#6b7280",
            marginBottom: 28,
          }}
        >
          Reviewing formulation details and active ingredients.
        </p>

        {/* Progress bar */}
        {(() => {
          const done = [step1, step2, step3].filter((s) => s === "done").length;
          const pct = Math.round((done / 3) * 100);
          return (
            <div
              style={{
                height: 4,
                backgroundColor: "#e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  backgroundColor: "#6b7280",
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          );
        })()}

        {/* Step checklist */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
              fontSize: 14,
              color: step1 === "done" ? "#111827" : "#6b7280",
            }}
          >
            <span style={{ flexShrink: 0 }}>
              {step1 === "done" ? "✓" : "○"}
            </span>
            Extracting formulation details
          </li>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
              fontSize: 14,
              color: step2 === "done" ? "#111827" : "#6b7280",
            }}
          >
            <span style={{ flexShrink: 0 }}>
              {step2 === "done" ? "✓" : "○"}
            </span>
            Identifying active compounds
          </li>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 14,
              color: step3 === "done" ? "#111827" : "#6b7280",
            }}
          >
            <span style={{ flexShrink: 0 }}>
              {step3 === "done" ? "✓" : "○"}
            </span>
            Applying safety heuristics
          </li>
        </ul>
      </div>
    </main>
  );
}
