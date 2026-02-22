"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useResult } from "../result-context";
import type { ProductRecommendation } from "../result-context";

const BUDGET_MAX: Record<string, number> = {
  all: Infinity, budget: 500, mid: 2000, premium: 6000, luxury: Infinity,
};

function MatchRing({ score }: { score: number }) {
  const color = score >= 85 ? "#4ADE80" : score >= 70 ? "#C9A84C" : "#F87171";
  const r = 16, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
      <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke="#2E2E28" strokeWidth={2.5} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={2.5}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color }}>
        {score}
      </div>
    </div>
  );
}

function ProductCard({ product, rank }: { product: ProductRecommendation; rank: number }) {
  const [open, setOpen] = useState(false);
  const isTop = rank === 0;

  return (
    <div style={{
      background: isTop ? "linear-gradient(135deg,#1E1E1A,#221F14)" : "#1C1C18",
      border: `1px solid ${isTop ? "#C9A84C" : "#2E2E28"}`,
      borderRadius: 14,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {isTop && (
        <div style={{ background: "#C9A84C", padding: "4px 16px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#0D0D0B", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ★ Best match for your skin
          </span>
        </div>
      )}

      <div style={{ padding: "18px 22px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          {/* Colour swatch */}
          <div style={{
            width: 52, height: 52, borderRadius: 10, flexShrink: 0,
            background: product.image_placeholder_color || "#2A2A24",
            border: "1px solid rgba(255,255,255,0.07)",
          }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
              {product.brand}
            </div>
            <div style={{ fontSize: 15, color: "#F2EDE4", fontWeight: 500, lineHeight: 1.3, marginBottom: 6 }}>
              {product.name}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {product.fragrance_free && <Tag>Frag-free</Tag>}
              {product.vegan && <Tag>Vegan</Tag>}
              {product.cruelty_free && <Tag>Cruelty-free</Tag>}
              <Tag>{product.texture}</Tag>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <MatchRing score={product.match_score} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, color: "#F2EDE4", fontWeight: 600 }}>₹{product.price_inr.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "#6B6560" }}>${product.price_usd}</div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p style={{ fontSize: 13, color: "#B8B0A4", lineHeight: 1.55, marginBottom: 14 }}>
          {product.explanation}
        </p>

        {/* Key ingredients */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {product.key_ingredients.slice(0, 5).map((ing, i) => (
            <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "#242420", color: "#B8B0A4", border: "1px solid #2E2E28" }}>
              {ing}
            </span>
          ))}
        </div>

        {/* Expand */}
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", color: "#6B6560", fontSize: 11, cursor: "pointer", padding: 0, marginBottom: open ? 14 : 0 }}>
          {open ? "▲ Less" : "▼ Why this works"}
        </button>

        {open && (
          <div style={{ borderTop: "1px solid #2E2E28", paddingTop: 14 }}>
            {product.match_reasons.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {product.match_reasons.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#B8B0A4", marginBottom: 6 }}>
                    <span style={{ color: "#4ADE80", flexShrink: 0 }}>✓</span>{r}
                  </div>
                ))}
              </div>
            )}
            {product.avoid_if.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#6B6560", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Use caution if</div>
                {product.avoid_if.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#B8B0A4", marginBottom: 4 }}>
                    <span style={{ color: "#F87171", flexShrink: 0 }}>·</span>{a}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buy links */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid #2E2E28" }}>
          {Object.entries(product.links).map(([store, url]) => {
            if (!url || typeof url !== "string" || url.length === 0) return null;
            return (
              <a key={store} href={url} target="_blank" rel="noopener noreferrer" style={{
                padding: "7px 14px", background: "#242420", border: "1px solid #3A3A34",
                borderRadius: 8, color: "#B8B0A4", fontSize: 12, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 4,
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "#C9A84C"; el.style.color = "#F2EDE4"; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "#3A3A34"; el.style.color = "#B8B0A4"; }}
              >
                {store.charAt(0).toUpperCase() + store.slice(1)} →
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#242420", color: "#B8B0A4", border: "1px solid #2E2E28" }}>
      {children}
    </span>
  );
}

export default function Results() {
  const router = useRouter();
  const { skinAnalysis, recommendations, skinProfile } = useResult();
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [fragranceFree, setFragranceFree] = useState(false);
  const [veganOnly, setVeganOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "price_asc" | "price_desc">("match");

  const filtered = useMemo(() => {
    let list = [...recommendations];
    const maxP = BUDGET_MAX[budgetFilter] ?? Infinity;
    list = list.filter(r => r.price_inr <= maxP);
    if (fragranceFree) list = list.filter(r => r.fragrance_free);
    if (veganOnly) list = list.filter(r => r.vegan);
    if (sortBy === "match") list.sort((a, b) => b.match_score - a.match_score);
    else if (sortBy === "price_asc") list.sort((a, b) => a.price_inr - b.price_inr);
    else list.sort((a, b) => b.price_inr - a.price_inr);
    return list;
  }, [recommendations, budgetFilter, fragranceFree, veganOnly, sortBy]);

  if (!skinAnalysis || recommendations.length === 0) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  const categoryLabel = skinProfile?.product_category?.replace(/_/g, " ") || "products";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0D0D0B; --surface: #1C1C18; --surface2: #242420; --border: #2E2E28; --border-light: #3A3A34;
          --gold: #C9A84C; --gold-light: rgba(201,168,76,0.12); --gold-muted: #A8884A;
          --cream: #F2EDE4; --cream-muted: #B8B0A4; --cream-faint: #6B6560;
          --serif: 'Playfair Display', Georgia, serif; --sans: 'Syne', system-ui, sans-serif;
        }
        html, body { background: var(--bg); color: var(--cream); font-family: var(--sans); min-height: 100vh; -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .nav { padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(13,13,11,0.92); backdrop-filter: blur(12px); z-index: 20; }
        .nav-logo { font-family: var(--serif); font-size: 16px; color: var(--cream); display: flex; align-items: center; gap: 8px; }
        .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
        .nav-back { background: none; border: 1px solid var(--border); color: var(--cream-faint); padding: 6px 14px; border-radius: 8px; font-family: var(--sans); font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .nav-back:hover { border-color: var(--border-light); color: var(--cream-muted); }

        .layout { max-width: 1060px; margin: 0 auto; padding: 32px 24px 80px; display: grid; grid-template-columns: 260px 1fr; gap: 28px; }

        /* Skin panel */
        .skin-panel { position: sticky; top: 72px; height: fit-content; animation: fadeUp 0.4s ease both; }
        .skin-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .skin-card-top { padding: 18px 20px 14px; border-bottom: 1px solid var(--border); }
        .skin-avatar { font-size: 22px; margin-bottom: 10px; }
        .skin-card-title { font-family: var(--serif); font-size: 15px; color: var(--cream); margin-bottom: 2px; }
        .skin-card-sub { font-size: 11px; color: var(--cream-faint); }
        .skin-stats { padding: 4px 20px; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
        .stat-row:last-child { border-bottom: none; }
        .stat-lbl { font-size: 11px; color: var(--cream-faint); text-transform: uppercase; letter-spacing: 0.06em; }
        .stat-val { font-size: 12px; color: var(--cream-muted); font-weight: 500; }
        .skin-summary { padding: 13px 20px; background: var(--gold-light); border-top: 1px solid rgba(201,168,76,0.15); font-size: 12px; color: var(--cream-muted); line-height: 1.55; font-style: italic; }

        /* Main */
        .main-col { animation: fadeUp 0.4s ease 0.1s both; }
        .results-eyebrow { font-size: 11px; color: var(--cream-faint); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
        .results-title { font-family: var(--serif); font-size: clamp(22px, 3vw, 28px); color: var(--cream); line-height: 1.2; margin-bottom: 22px; }
        .results-title em { font-style: italic; color: var(--gold); }

        /* Filter bar */
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
        .filter-group { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .filter-sep { width: 1px; height: 18px; background: var(--border); margin: 0 4px; }
        .f-btn { padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg); color: var(--cream-muted); font-family: var(--sans); font-size: 11px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .f-btn:hover { border-color: var(--border-light); }
        .f-btn.on { border-color: var(--gold); background: var(--gold-light); color: var(--cream); }
        .sort-sel { padding: 5px 10px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg); color: var(--cream-muted); font-family: var(--sans); font-size: 11px; cursor: pointer; outline: none; }

        /* Products */
        .products { display: flex; flex-direction: column; gap: 10px; }
        .empty { padding: 48px 20px; text-align: center; color: var(--cream-faint); font-size: 13px; }

        .disclaimer { margin-top: 28px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; font-size: 11px; color: var(--cream-faint); line-height: 1.6; }

        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .skin-panel { position: static; }
          .nav { padding: 14px 20px; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-logo"><div className="nav-dot" />Before You Buy</div>
        <button className="nav-back" onClick={() => router.push("/")}>← New search</button>
      </nav>

      <div className="layout">
        {/* Skin profile panel */}
        <div className="skin-panel">
          <div className="skin-card">
            <div className="skin-card-top">
              <div className="skin-avatar">◎</div>
              <div className="skin-card-title">Your skin profile</div>
              <div className="skin-card-sub">Analysed from your photo</div>
            </div>
            <div className="skin-stats">
              {[
                { label: "Skin type", value: skinAnalysis.skin_type.charAt(0).toUpperCase() + skinAnalysis.skin_type.slice(1) },
                { label: "Tone", value: skinAnalysis.tone },
                { label: "Acne", value: skinAnalysis.acne_severity === "none" ? "Clear" : skinAnalysis.acne_severity.charAt(0).toUpperCase() + skinAnalysis.acne_severity.slice(1) },
                { label: "Oiliness", value: skinAnalysis.oiliness.charAt(0).toUpperCase() + skinAnalysis.oiliness.slice(1) },
                { label: "Sensitivity", value: skinAnalysis.sensitivity.charAt(0).toUpperCase() + skinAnalysis.sensitivity.slice(1) },
                { label: "Pigmentation", value: skinAnalysis.hyperpigmentation === "none" ? "None" : skinAnalysis.hyperpigmentation.charAt(0).toUpperCase() + skinAnalysis.hyperpigmentation.slice(1) },
              ].map(({ label, value }) => (
                <div key={label} className="stat-row">
                  <span className="stat-lbl">{label}</span>
                  <span className="stat-val">{value}</span>
                </div>
              ))}
            </div>
            <div className="skin-summary">{skinAnalysis.summary}</div>
          </div>
        </div>

        {/* Results */}
        <div className="main-col">
          <div className="results-eyebrow">{recommendations.length} products found</div>
          <div className="results-title">
            Best <em>{categoryLabel}s</em><br />for your skin
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <div className="filter-group">
              {["all", "budget", "mid", "premium", "luxury"].map(b => (
                <button key={b} className={`f-btn ${budgetFilter === b ? "on" : ""}`} onClick={() => setBudgetFilter(b)}>
                  {b === "all" ? "Any price" : b.charAt(0).toUpperCase() + b.slice(1)}
                </button>
              ))}
            </div>
            <div className="filter-sep" />
            <div className="filter-group">
              <button className={`f-btn ${fragranceFree ? "on" : ""}`} onClick={() => setFragranceFree(f => !f)}>Frag-free</button>
              <button className={`f-btn ${veganOnly ? "on" : ""}`} onClick={() => setVeganOnly(v => !v)}>Vegan</button>
            </div>
            <div className="filter-sep" />
            <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
              <option value="match">Best match</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">No products match these filters. Try adjusting your criteria.</div>
          ) : (
            <div className="products">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} rank={i} />)}
            </div>
          )}

          <div className="disclaimer">
            Before You Buy uses AI skin analysis and ingredient matching to surface relevant products. This is not medical advice. Individual results vary. Consult a dermatologist for persistent skin concerns.
          </div>
        </div>
      </div>
    </>
  );
}