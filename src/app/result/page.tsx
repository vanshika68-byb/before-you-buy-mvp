"use client";

import { useRouter } from "next/navigation";
import { useResult } from "../result-context";

const SKIN_TYPE_LABELS: Record<string, string> = {
  oily: "Oily",
  dry: "Dry",
  combination: "Combination",
  sensitive: "Sensitive",
  normal: "Normal",
};

const SUITABILITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  good: { label: "Good", bg: "#EBF2E4", text: "#2D5016", border: "#B8D49A", dot: "#4A7C2F" },
  neutral: { label: "Neutral", bg: "#F7F4EF", text: "#4B4540", border: "#DDD8CF", dot: "#A09A93" },
  caution: { label: "Caution", bg: "#FFFBEB", text: "#92400E", border: "#FCD34D", dot: "#D97706" },
  avoid: { label: "Avoid", bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5", dot: "#DC2626" },
};

const VERDICT_CONFIG: Record<string, { bg: string; text: string; border: string; accent: string; icon: string; label: string }> = {
  green: {
    bg: "#EBF2E4",
    text: "#2D5016",
    border: "#B8D49A",
    accent: "#4A7C2F",
    icon: "✓",
    label: "Generally Well-Suited",
  },
  yellow: {
    bg: "#FFFBEB",
    text: "#78350F",
    border: "#FCD34D",
    accent: "#D97706",
    icon: "⚠",
    label: "Use with Care",
  },
  red: {
    bg: "#FEF2F2",
    text: "#7F1D1D",
    border: "#FCA5A5",
    accent: "#DC2626",
    icon: "✕",
    label: "Significant Concerns",
  },
};

const INTERACTION_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  conflict: { label: "Conflict", bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
  synergy: { label: "Synergy", bg: "#EBF2E4", text: "#2D5016", border: "#B8D49A" },
  redundancy: { label: "Redundancy", bg: "#F0F4FF", text: "#1E3A8A", border: "#93C5FD" },
};

export default function Result() {
  const router = useRouter();
  const {
    productName: rawProductName,
    productType,
    extraction,
    riskAssessment,
    verdict,
    skinTypeSuitability,
    ingredientInteractions,
    whatThisProductDoes,
    formulationStrengths,
    formulationWeaknesses,
  } = useResult();

  const productName = rawProductName || "Product analysis";
  const detectedActives = extraction?.detected_actives ?? [];
  const assessmentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const useCautionIf = riskAssessment?.avoid_if ?? [];
  const confidenceLevel = riskAssessment?.confidence_level ?? "low";
  const confidenceReason = riskAssessment?.confidence_reason ?? "";

  const verdictCfg = verdict ? VERDICT_CONFIG[verdict.signal] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #F7F4EF;
          --cream-dark: #EDE8DF;
          --ink: #1C1917;
          --ink-muted: #6B6560;
          --ink-faint: #A09A93;
          --green: #2D5016;
          --green-light: #4A7C2F;
          --green-muted: #EBF2E4;
          --border: #DDD8CF;
          --serif: 'DM Serif Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
        }
        body { background: var(--cream); font-family: var(--sans); color: var(--ink); -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page { min-height: 100vh; padding: 0 0 80px; }

        /* Nav */
        .nav {
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          background: var(--cream);
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(8px);
        }
        .nav-logo { font-family: var(--serif); font-size: 17px; color: var(--ink); display: flex; align-items: center; gap: 7px; }
        .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
        .nav-back {
          font-size: 13px;
          color: var(--ink-muted);
          background: none;
          border: 1px solid var(--border);
          padding: 7px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--sans);
          font-weight: 400;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .nav-back:hover { border-color: var(--ink-muted); color: var(--ink); }

        /* Layout */
        .layout { max-width: 760px; margin: 0 auto; padding: 40px 24px 0; }

        /* Product header */
        .product-header {
          margin-bottom: 32px;
          animation: fadeUp 0.4s ease 0.05s both;
        }
        .product-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .product-type-badge {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--green);
          background: var(--green-muted);
          padding: 3px 9px;
          border-radius: 20px;
        }
        .product-date { font-size: 12px; color: var(--ink-faint); font-weight: 300; }
        .product-name {
          font-family: var(--serif);
          font-size: clamp(22px, 4vw, 30px);
          letter-spacing: -0.02em;
          color: var(--ink);
          line-height: 1.15;
        }

        /* Verdict card */
        .verdict-card {
          border-radius: 12px;
          padding: 28px 28px 24px;
          margin-bottom: 24px;
          animation: fadeUp 0.4s ease 0.1s both;
        }
        .verdict-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 14px;
        }
        .verdict-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          font-weight: 600;
        }
        .verdict-meta { flex: 1; }
        .verdict-signal-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 4px;
          opacity: 0.7;
        }
        .verdict-headline {
          font-family: var(--serif);
          font-size: 22px;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .verdict-summary {
          font-size: 14px;
          line-height: 1.65;
          font-weight: 300;
          padding-top: 14px;
          border-top: 1px solid rgba(0,0,0,0.07);
        }

        /* Section cards */
        .section {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .section-anim-1 { animation: fadeUp 0.4s ease 0.15s both; }
        .section-anim-2 { animation: fadeUp 0.4s ease 0.2s both; }
        .section-anim-3 { animation: fadeUp 0.4s ease 0.25s both; }
        .section-anim-4 { animation: fadeUp 0.4s ease 0.3s both; }
        .section-anim-5 { animation: fadeUp 0.4s ease 0.35s both; }
        .section-anim-6 { animation: fadeUp 0.4s ease 0.4s both; }

        .section-header {
          padding: 18px 24px 16px;
          border-bottom: 1px solid var(--cream-dark);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-icon {
          width: 28px;
          height: 28px;
          background: var(--cream);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .section-body { padding: 20px 24px; }

        /* What it does */
        .benefit-list { display: flex; flex-direction: column; gap: 10px; }
        .benefit-item { display: flex; align-items: flex-start; gap: 10px; }
        .benefit-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          flex-shrink: 0;
          margin-top: 7px;
        }
        .benefit-text { font-size: 14px; line-height: 1.6; color: var(--ink-muted); font-weight: 300; }

        /* Active ingredients */
        .actives-grid { display: flex; flex-direction: column; gap: 12px; }
        .active-item {
          background: var(--cream);
          border-radius: 8px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .active-name { font-size: 14px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
        .active-function { font-size: 12px; color: var(--ink-muted); font-weight: 300; line-height: 1.4; }
        .active-concentration {
          font-size: 11px;
          font-weight: 500;
          color: var(--ink-faint);
          background: var(--cream-dark);
          padding: 3px 8px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Skin type grid */
        .skin-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .skin-cell {
          border-radius: 8px;
          padding: 12px 8px;
          text-align: center;
          border: 1px solid;
        }
        .skin-cell-type { font-size: 11px; font-weight: 500; margin-bottom: 6px; }
        .skin-cell-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 auto 5px;
        }
        .skin-cell-label { font-size: 11px; font-weight: 500; }
        .skin-reasoning { font-size: 13px; color: var(--ink-muted); line-height: 1.55; font-weight: 300; }

        /* Interactions */
        .interaction-list { display: flex; flex-direction: column; gap: 12px; }
        .interaction-item { border-radius: 8px; padding: 14px 16px; border: 1px solid; }
        .interaction-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .interaction-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .interaction-ingredients { font-size: 13px; font-weight: 500; }
        .interaction-explanation { font-size: 13px; font-weight: 300; line-height: 1.55; }

        /* Strengths / Weaknesses */
        .sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .sw-column {}
        .sw-column-title { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; }
        .sw-list { display: flex; flex-direction: column; gap: 8px; }
        .sw-item { display: flex; align-items: flex-start; gap: 8px; }
        .sw-dot { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
        .sw-text { font-size: 13px; color: var(--ink-muted); line-height: 1.5; font-weight: 300; }

        /* Caution if */
        .caution-list { display: flex; flex-direction: column; gap: 8px; }
        .caution-item { display: flex; align-items: flex-start; gap: 10px; }
        .caution-icon { font-size: 13px; flex-shrink: 0; margin-top: 2px; }
        .caution-text { font-size: 14px; line-height: 1.55; color: var(--ink); font-weight: 300; }

        /* Confidence */
        .confidence-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .confidence-badge {
          font-size: 13px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 6px;
        }
        .confidence-high { background: var(--green-muted); color: var(--green); }
        .confidence-medium { background: #FFFBEB; color: #92400E; }
        .confidence-low { background: #F3F4F6; color: #374151; }
        .confidence-text { font-size: 13px; color: var(--ink-muted); line-height: 1.55; font-weight: 300; }

        /* Disclaimer */
        .disclaimer {
          background: #F9FAFB;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px 20px;
          margin-top: 24px;
          animation: fadeUp 0.4s ease 0.45s both;
        }
        .disclaimer-text { font-size: 12px; line-height: 1.65; color: var(--ink-faint); font-style: italic; font-weight: 300; }

        .empty-text { font-size: 14px; color: var(--ink-faint); font-weight: 300; font-style: italic; }

        @media (max-width: 600px) {
          .nav { padding: 16px 20px; }
          .layout { padding: 28px 16px 0; }
          .skin-grid { grid-template-columns: repeat(5, 1fr); gap: 6px; }
          .skin-cell { padding: 10px 4px; }
          .sw-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-dot" />
            Before You Buy
          </div>
          <button className="nav-back" type="button" onClick={() => router.push("/")}>
            ← New analysis
          </button>
        </nav>

        <div className="layout">
          {/* Product header */}
          <div className="product-header">
            <div className="product-meta">
              {productType && productType !== "unknown" && (
                <span className="product-type-badge">{productType}</span>
              )}
              <span className="product-date">{assessmentDate}</span>
            </div>
            <h1 className="product-name">{productName}</h1>
          </div>

          {/* Verdict hero */}
          {verdict && verdictCfg && (
            <div
              className="verdict-card"
              style={{
                background: verdictCfg.bg,
                border: `1px solid ${verdictCfg.border}`,
              }}
            >
              <div className="verdict-header">
                <div
                  className="verdict-icon"
                  style={{ background: verdictCfg.accent, color: "#fff" }}
                >
                  {verdictCfg.icon}
                </div>
                <div className="verdict-meta">
                  <div className="verdict-signal-label" style={{ color: verdictCfg.text }}>
                    {verdictCfg.label}
                  </div>
                  <div className="verdict-headline" style={{ color: verdictCfg.text }}>
                    {verdict.headline}
                  </div>
                </div>
              </div>
              <div className="verdict-summary" style={{ color: verdictCfg.text, opacity: 0.85 }}>
                {verdict.summary}
              </div>
            </div>
          )}

          {/* What this product does */}
          {whatThisProductDoes.length > 0 && (
            <div className="section section-anim-1">
              <div className="section-header">
                <div className="section-icon">✦</div>
                <span className="section-title">What this product does</span>
              </div>
              <div className="section-body">
                <div className="benefit-list">
                  {whatThisProductDoes.map((item, i) => (
                    <div className="benefit-item" key={i}>
                      <div className="benefit-dot" />
                      <span className="benefit-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active ingredients */}
          {detectedActives.length > 0 && (
            <div className="section section-anim-2">
              <div className="section-header">
                <div className="section-icon">⚗</div>
                <span className="section-title">Active ingredients ({detectedActives.length})</span>
              </div>
              <div className="section-body">
                <div className="actives-grid">
                  {detectedActives.map((active, i) => (
                    <div className="active-item" key={i}>
                      <div style={{ flex: 1 }}>
                        <div className="active-name">{active.name}</div>
                        <div className="active-function">{active.function}</div>
                      </div>
                      {active.concentration_estimate && (
                        <span className="active-concentration">
                          {active.concentration_estimate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skin type suitability */}
          {skinTypeSuitability && (
            <div className="section section-anim-3">
              <div className="section-header">
                <div className="section-icon">🧬</div>
                <span className="section-title">Skin type suitability</span>
              </div>
              <div className="section-body">
                <div className="skin-grid">
                  {(["oily", "dry", "combination", "sensitive", "normal"] as const).map((type) => {
                    const rating = skinTypeSuitability[type];
                    const cfg = SUITABILITY_CONFIG[rating] ?? SUITABILITY_CONFIG.neutral;
                    return (
                      <div
                        className="skin-cell"
                        key={type}
                        style={{
                          background: cfg.bg,
                          borderColor: cfg.border,
                          color: cfg.text,
                        }}
                      >
                        <div className="skin-cell-type" style={{ color: cfg.text, opacity: 0.7 }}>
                          {SKIN_TYPE_LABELS[type]}
                        </div>
                        <div
                          className="skin-cell-dot"
                          style={{ background: cfg.dot }}
                        />
                        <div className="skin-cell-label" style={{ color: cfg.text }}>
                          {cfg.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="skin-reasoning">{skinTypeSuitability.reasoning}</p>
              </div>
            </div>
          )}

          {/* Ingredient interactions */}
          {ingredientInteractions.length > 0 && (
            <div className="section section-anim-4">
              <div className="section-header">
                <div className="section-icon">⚡</div>
                <span className="section-title">
                  Ingredient interactions ({ingredientInteractions.length})
                </span>
              </div>
              <div className="section-body">
                <div className="interaction-list">
                  {ingredientInteractions.map((interaction, i) => {
                    const cfg = INTERACTION_CONFIG[interaction.interaction_type] ?? INTERACTION_CONFIG.conflict;
                    return (
                      <div
                        className="interaction-item"
                        key={i}
                        style={{ background: cfg.bg, borderColor: cfg.border }}
                      >
                        <div className="interaction-header">
                          <span
                            className="interaction-badge"
                            style={{ background: cfg.border, color: cfg.text }}
                          >
                            {cfg.label}
                          </span>
                          <span className="interaction-ingredients" style={{ color: cfg.text }}>
                            {interaction.ingredients.join(" + ")}
                          </span>
                        </div>
                        <p className="interaction-explanation" style={{ color: cfg.text, opacity: 0.8 }}>
                          {interaction.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {(formulationStrengths.length > 0 || formulationWeaknesses.length > 0) && (
            <div className="section section-anim-5">
              <div className="section-header">
                <div className="section-icon">⚖</div>
                <span className="section-title">Formulation assessment</span>
              </div>
              <div className="section-body">
                <div className="sw-grid">
                  {formulationStrengths.length > 0 && (
                    <div className="sw-column">
                      <div className="sw-column-title" style={{ color: "#2D5016" }}>Strengths</div>
                      <div className="sw-list">
                        {formulationStrengths.map((s, i) => (
                          <div className="sw-item" key={i}>
                            <span className="sw-dot">✓</span>
                            <span className="sw-text">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {formulationWeaknesses.length > 0 && (
                    <div className="sw-column">
                      <div className="sw-column-title" style={{ color: "#991B1B" }}>Weaknesses</div>
                      <div className="sw-list">
                        {formulationWeaknesses.map((s, i) => (
                          <div className="sw-item" key={i}>
                            <span className="sw-dot">✕</span>
                            <span className="sw-text">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Use caution if */}
          {useCautionIf.length > 0 && (
            <div className="section section-anim-5">
              <div className="section-header">
                <div className="section-icon">⚠</div>
                <span className="section-title">Use caution if you have</span>
              </div>
              <div className="section-body">
                <div className="caution-list">
                  {useCautionIf.map((item, i) => (
                    <div className="caution-item" key={i}>
                      <span className="caution-icon">·</span>
                      <span className="caution-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Assessment certainty */}
          <div className="section section-anim-6">
            <div className="section-header">
              <div className="section-icon">◎</div>
              <span className="section-title">Assessment certainty</span>
            </div>
            <div className="section-body">
              <div className="confidence-row">
                <span
                  className={`confidence-badge confidence-${
                    confidenceLevel === "high" ? "high" : confidenceLevel === "medium" ? "medium" : "low"
                  }`}
                >
                  {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)}
                </span>
              </div>
              <p className="confidence-text">
                {confidenceReason ||
                  "Certainty is limited when concentration, formulation details, or the ingredient list are not fully disclosed on the product page."}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <p className="disclaimer-text">
              Before You Buy provides a general, dermatology-informed formulation screen. This is not medical advice, a diagnosis, or a substitute for consultation with a qualified dermatologist or healthcare professional. Individual responses to ingredients vary.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}