"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResult, type Extraction, type RiskAssessment } from "../result-context";

type StepState = "waiting" | "active" | "done";

const STEPS = [
  { id: "fetch", label: "Fetching product page", detail: "Retrieving formulation details" },
  { id: "analyse", label: "Analysing ingredients", detail: "Identifying actives & interactions" },
  { id: "assess", label: "Generating safety screen", detail: "Applying clinical heuristics" },
];

export default function Analyzing() {
  const router = useRouter();
  const {
    submittedUrl,
    setSubmittedUrl,
    setExtraction,
    setRiskAssessment,
    setProductName,
    setProductType,
    setVerdict,
    setSkinTypeSuitability,
    setIngredientInteractions,
    setWhatThisProductDoes,
    setFormulationStrengths,
    setFormulationWeaknesses,
    skinProfile,
  } = useResult();

  const [steps, setSteps] = useState<StepState[]>(["waiting", "waiting", "waiting"]);
  const [error, setError] = useState<string | null>(null);

  function setStep(index: number, state: StepState) {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = state;
      return next;
    });
  }

  useEffect(() => {
    const url = submittedUrl;
    if (!url) return;

    let cancelled = false;

    async function runAnalysis() {
      setError(null);

      // Step 1 active
      setStep(0, "active");
      await new Promise((r) => setTimeout(r, 300));

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, ...(skinProfile ? { skin_profile: skinProfile } : {}) }),
        });

        if (cancelled) return;

        // Step 1 done, step 2 active
        setStep(0, "done");
        setStep(1, "active");

        const json = await response.json().catch(() => null);

        if (cancelled) return;

        // Step 2 done, step 3 active
        setStep(1, "done");
        setStep(2, "active");

        await new Promise((r) => setTimeout(r, 400));

        if (cancelled) return;

        // Map the response
        const rawProductName = typeof json?.product_name === "string" ? json.product_name : "";
        const rawProductType = typeof json?.product_type === "string" ? json.product_type : "";
        const raw = json?.extraction ?? null;
        const rawRisk = json?.risk_assessment ?? null;

        const safeExtraction: Extraction = {
          ingredients: Array.isArray(raw?.ingredients)
            ? raw.ingredients.map((i: unknown) => String(i))
            : [],
          detected_actives: Array.isArray(raw?.detected_actives)
            ? raw.detected_actives.map((a: unknown) => {
                if (typeof a === "string") return { name: a, function: "" };
                const obj = a as Record<string, unknown>;
                return {
                  name: typeof obj.name === "string" ? obj.name : "",
                  function: typeof obj.function === "string" ? obj.function : "",
                  ...(typeof obj.concentration_estimate === "string"
                    ? { concentration_estimate: obj.concentration_estimate }
                    : {}),
                };
              })
            : [],
          concentration_clues:
            raw && typeof raw.concentration_clues === "string"
              ? raw.concentration_clues
              : "unknown",
          usage_instructions:
            raw && typeof raw.usage_instructions === "string"
              ? raw.usage_instructions
              : "unknown",
          ph_notes:
            raw && typeof raw.ph_notes === "string" ? raw.ph_notes : "unknown",
        };

        const validLevel = (v: unknown): "low" | "medium" | "high" =>
          v === "low" || v === "medium" || v === "high" ? v : "low";

        const safeRiskAssessment: RiskAssessment | null = rawRisk
          ? {
              avoid_if: Array.isArray(rawRisk.avoid_if)
                ? rawRisk.avoid_if.map((s: unknown) => String(s))
                : [],
              risk_reasons: Array.isArray(rawRisk.risk_reasons)
                ? rawRisk.risk_reasons.map((s: unknown) => String(s))
                : [],
              confidence_level: validLevel(rawRisk.confidence_level),
              confidence_reason:
                typeof rawRisk.confidence_reason === "string"
                  ? rawRisk.confidence_reason
                  : "unknown",
              disclaimer:
                typeof rawRisk.disclaimer === "string"
                  ? rawRisk.disclaimer
                  : "This is a general, dermatologist-informed assessment, not a medical diagnosis.",
            }
          : null;

        // Step 3 done
        setStep(2, "done");

        // Commit all state
        setProductName(rawProductName || null);
        setProductType(rawProductType || null);
        setExtraction(safeExtraction);
        setRiskAssessment(safeRiskAssessment);

        // Verdict
        const rawVerdict = json?.verdict;
        if (rawVerdict && typeof rawVerdict === "object") {
          const signal = rawVerdict.signal;
          if (signal === "green" || signal === "yellow" || signal === "red") {
            setVerdict({
              signal,
              headline: typeof rawVerdict.headline === "string" ? rawVerdict.headline : "",
              summary: typeof rawVerdict.summary === "string" ? rawVerdict.summary : "",
            });
          }
        }

        // Skin type suitability
        const rawSkin = json?.skin_type_suitability;
        if (rawSkin && typeof rawSkin === "object") {
          setSkinTypeSuitability(rawSkin);
        }

        // Interactions
        if (Array.isArray(json?.ingredient_interactions)) {
          setIngredientInteractions(json.ingredient_interactions);
        }

        // What it does
        if (Array.isArray(json?.what_this_product_does)) {
          setWhatThisProductDoes(json.what_this_product_does.map(String));
        }

        // Strengths / weaknesses
        if (Array.isArray(json?.formulation_strengths)) {
          setFormulationStrengths(json.formulation_strengths.map(String));
        }
        if (Array.isArray(json?.formulation_weaknesses)) {
          setFormulationWeaknesses(json.formulation_weaknesses.map(String));
        }

        await new Promise((r) => setTimeout(r, 500));
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

  const doneCount = steps.filter((s) => s === "done").length;
  const progressPct = Math.round((doneCount / STEPS.length) * 100);

  if (error) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root { --cream: #F7F4EF; --ink: #1C1917; --ink-muted: #6B6560; --green: #2D5016; --border: #DDD8CF; --serif: 'DM Serif Display', Georgia, serif; --sans: 'DM Sans', system-ui, sans-serif; }
          body { background: var(--cream); font-family: var(--sans); color: var(--ink); -webkit-font-smoothing: antialiased; }
        `}</style>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "var(--cream)" }}>
          <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 12, padding: 40, border: "1px solid #DDD8CF" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 18 }}>⚠</div>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, marginBottom: 10, color: "#1C1917", letterSpacing: "-0.01em" }}>
              Analysis unavailable
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#6B6560", marginBottom: 28, fontWeight: 300 }}>
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              style={{ padding: "12px 24px", borderRadius: 8, border: "1.5px solid #DDD8CF", background: "#fff", color: "#1C1917", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              ← Try another URL
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #F7F4EF;
          --ink: #1C1917;
          --ink-muted: #6B6560;
          --ink-faint: #A09A93;
          --green: #2D5016;
          --green-muted: #EBF2E4;
          --border: #DDD8CF;
          --serif: 'DM Serif Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
        }
        body { background: var(--cream); font-family: var(--sans); color: var(--ink); -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
        .card {
          width: 100%;
          max-width: 480px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 40px;
          animation: fadeUp 0.4s ease;
        }

        .card-header { margin-bottom: 32px; }
        .card-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--green);
          margin-bottom: 8px;
        }
        .card-title {
          font-family: var(--serif);
          font-size: 24px;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin-bottom: 6px;
        }
        .card-sub { font-size: 14px; color: var(--ink-faint); font-weight: 300; }

        .progress-track {
          height: 3px;
          background: var(--cream);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 36px;
        }
        .progress-bar {
          height: 100%;
          background: var(--green);
          border-radius: 2px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .steps { display: flex; flex-direction: column; gap: 0; }
        .step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--cream);
          transition: all 0.3s ease;
        }
        .step:last-child { border-bottom: none; padding-bottom: 0; }
        .step:first-child { padding-top: 0; }

        .step-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          transition: all 0.3s ease;
          font-size: 13px;
        }

        .step-icon-waiting {
          background: var(--cream);
          border: 1.5px solid var(--border);
        }
        .step-icon-active {
          background: var(--green-muted);
          border: 1.5px solid var(--green);
        }
        .step-icon-done {
          background: var(--green);
          border: 1.5px solid var(--green);
          color: white;
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid var(--green);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .step-content { flex: 1; }
        .step-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          transition: color 0.3s ease;
        }
        .step-label-waiting { color: var(--ink-faint); }
        .step-label-active { color: var(--ink); }
        .step-label-done { color: var(--ink); }

        .step-detail {
          font-size: 12px;
          font-weight: 300;
          transition: color 0.3s ease;
        }
        .step-detail-waiting { color: transparent; }
        .step-detail-active { color: var(--ink-muted); animation: pulse 1.5s ease infinite; }
        .step-detail-done { color: var(--ink-faint); }
      `}</style>

      <main className="page">
        <div className="card">
          <div className="card-header">
            <div className="card-eyebrow">Running analysis</div>
            <h1 className="card-title">Formulation screen</h1>
            <p className="card-sub">This usually takes 10–20 seconds</p>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="steps">
            {STEPS.map((step, i) => {
              const state = steps[i];
              return (
                <div className="step" key={step.id}>
                  <div className={`step-icon step-icon-${state}`}>
                    {state === "done" && "✓"}
                    {state === "active" && <div className="spinner" />}
                    {state === "waiting" && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="3.5" stroke="#A09A93" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>
                  <div className="step-content">
                    <div className={`step-label step-label-${state}`}>{step.label}</div>
                    <div className={`step-detail step-detail-${state}`}>{step.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}