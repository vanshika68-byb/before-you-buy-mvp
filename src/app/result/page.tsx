"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useResult } from "../result-context";
import type { ProductRecommendation } from "../result-context";

/* ─── Colour tokens (inline, shared across components) ─────────── */
const C = {
  bg:          "#0D0D0B",
  surface:     "#1C1C18",
  surface2:    "#242420",
  surface3:    "#2E2E28",
  border:      "#2E2E28",
  borderLight: "#3A3A34",
  gold:        "#C9A84C",
  goldLight:   "rgba(201,168,76,0.12)",
  goldMuted:   "#A8884A",
  cream:       "#F2EDE4",   // primary text
  creamMuted:  "#B8B0A4",   // secondary text — ~4.8:1 on surface ✓
  creamFaint:  "#8A8480",   // tertiary/labels — ~3.8:1 on surface, used only for decorative/small ✓
  creamDim:    "#6B6560",   // used ONLY for 10px decorative elements — not body text
  green:       "#4ADE80",
  red:         "#F87171",
  greenBg:     "rgba(74,222,128,0.1)",
  greenBorder: "rgba(74,222,128,0.2)",
};

const BUDGET_MAX: Record<string, number> = {
  all: Infinity, budget: 500, mid: 2000, premium: 6000, luxury: Infinity,
};

/* ─── Match score ring ──────────────────────────────────────────── */
function MatchRing({ score }: { score: number }) {
  // ≥85 green, ≥70 gold, <70 red — clear semantic meaning
  const ringColor = score >= 85 ? C.green : score >= 70 ? C.gold : C.red;
  const r = 16, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
      <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke={C.surface3} strokeWidth={2.5} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={ringColor} strokeWidth={2.5}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ringColor }}>
        {score}
      </div>
    </div>
  );
}

/* ─── Inline tag chip ───────────────────────────────────────────── */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: C.surface2, color: C.creamMuted, border: `1px solid ${C.border}` }}>
      {children}
    </span>
  );
}

/* ─── Product card ──────────────────────────────────────────────── */
function ProductCard({ product, rank }: { product: ProductRecommendation; rank: number }) {
  const [open, setOpen] = useState(false);
  const isTop = rank === 0;

  return (
    <div style={{
      background: isTop ? "linear-gradient(135deg,#1E1E1A,#1F1C12)" : C.surface,
      border: `1px solid ${isTop ? C.gold : C.border}`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Gold banner for top pick */}
      {isTop && (
        <div style={{ background: C.gold, padding: "5px 16px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.bg, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ★ Best match for your skin
          </span>
        </div>
      )}

      <div style={{ padding: "16px 18px" }}>

        {/* ── Header row: swatch | info | score+price ── */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>

          {/* Colour swatch */}
          <div style={{
            width: 46, height: 46, borderRadius: 9, flexShrink: 0,
            background: product.image_placeholder_color || C.surface2,
            border: "1px solid rgba(255,255,255,0.07)",
          }} />

          {/* Name + tags — flex:1 with minWidth:0 prevents overflow */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
              {product.brand}
            </div>
            <div style={{ fontSize: 14, color: C.cream, fontWeight: 500, lineHeight: 1.3, marginBottom: 6, wordBreak: "break-word" }}>
              {product.name}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {product.fragrance_free && <Tag>Frag-free</Tag>}
              {product.vegan && <Tag>Vegan</Tag>}
              {product.cruelty_free && <Tag>Cruelty-free</Tag>}
              {product.texture && <Tag>{product.texture}</Tag>}
            </div>
          </div>

          {/* Score ring + price — stacked, right-aligned */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            <MatchRing score={product.match_score} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, color: C.cream, fontWeight: 600 }}>₹{product.price_inr.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: C.creamFaint }}>${product.price_usd}</div>
            </div>
          </div>
        </div>

        {/* ── Explanation ── */}
        <p style={{ fontSize: 13, color: C.creamMuted, lineHeight: 1.6, marginBottom: 12 }}>
          {product.explanation}
        </p>

        {/* ── Key ingredients ── */}
        {product.key_ingredients?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
            {product.key_ingredients.slice(0, 5).map((ing, i) => (
              <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: C.surface2, color: C.creamMuted, border: `1px solid ${C.border}` }}>
                {ing}
              </span>
            ))}
          </div>
        )}

        {/* ── Expand toggle ── */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: "none", border: "none", color: C.creamMuted, fontSize: 12, cursor: "pointer", padding: "4px 0", marginBottom: open ? 12 : 0, display: "flex", alignItems: "center", gap: 5 }}
        >
          <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
          {open ? "Show less" : "Why this works"}
        </button>

        {/* ── Expanded detail ── */}
        {open && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 4 }}>
            {product.match_reasons?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {product.match_reasons.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.creamMuted, marginBottom: 7, lineHeight: 1.5 }}>
                    <span style={{ color: C.green, flexShrink: 0, marginTop: 1 }}>✓</span>{r}
                  </div>
                ))}
              </div>
            )}
            {product.avoid_if?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: C.creamFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  Use caution if
                </div>
                {product.avoid_if.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.creamMuted, marginBottom: 6, lineHeight: 1.5 }}>
                    <span style={{ color: C.red, flexShrink: 0 }}>·</span>{a}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Buy links ── */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          {Object.entries(product.links).map(([store, url]) => {
            if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
            return (
              <a
                key={store}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "7px 13px",
                  background: C.surface2,
                  border: `1px solid ${C.borderLight}`,
                  borderRadius: 8,
                  color: C.creamMuted,
                  fontSize: 12,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s",
                  // Touch-friendly tap target
                  minHeight: 36,
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = C.gold; el.style.color = C.cream; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = C.borderLight; el.style.color = C.creamMuted; }}
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

/* ─── Results page ──────────────────────────────────────────────── */
export default function Results() {
  const router = useRouter();
  const { skinAnalysis, recommendations, skinProfile } = useResult();
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [fragranceFree, setFragranceFree] = useState(false);
  const [veganOnly, setVeganOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "price_asc" | "price_desc">("match");
  const [skinPanelOpen, setSkinPanelOpen] = useState(false);

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

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Build a concise acne label
  const acneLabel = skinAnalysis.active_acne.severity === "none"
    ? "Clear"
    : `${cap(skinAnalysis.active_acne.severity)} (${
        [
          skinAnalysis.active_acne.papules  > 0 ? `${skinAnalysis.active_acne.papules}p` : "",
          skinAnalysis.active_acne.pustules > 0 ? `${skinAnalysis.active_acne.pustules}pu` : "",
          skinAnalysis.active_acne.nodules_cysts > 0 ? `${skinAnalysis.active_acne.nodules_cysts}n` : "",
        ].filter(Boolean).join(" ") || "comedones"
      })`;

  // PIE / PIH summary
  const marksLabel = [
    skinAnalysis.acne_sequelae.pie_red_marks !== "none" ? `PIE: ${skinAnalysis.acne_sequelae.pie_red_marks}` : "",
    skinAnalysis.acne_sequelae.pih_brown_marks !== "none" ? `PIH: ${skinAnalysis.acne_sequelae.pih_brown_marks}` : "",
  ].filter(Boolean).join(" · ") || "None";

  const skinStats = [
    { label: "Skin type",    value: cap(skinAnalysis.skin_type.replace(/-/g, " ")) },
    { label: "Tone",         value: skinAnalysis.apparent_skin_tone.descriptive },
    { label: "Barrier",      value: cap(skinAnalysis.barrier_integrity.replace(/-/g, " ")) },
    { label: "Acne",         value: acneLabel },
    { label: "Marks",        value: marksLabel },
    { label: "Sensitivity",  value: cap(skinAnalysis.sensitivity_level) },
    { label: "Pigmentation", value: skinAnalysis.hyperpigmentation.level === "none" ? "None" : `${cap(skinAnalysis.hyperpigmentation.level)} (${skinAnalysis.hyperpigmentation.pattern.join(", ") || "—"})` },
    { label: "Active tolerance", value: cap(skinAnalysis.tolerance_for_strong_actives) },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          background: #0D0D0B; color: #F2EDE4;
          font-family: 'Syne', system-ui, sans-serif;
          min-height: 100vh; -webkit-font-smoothing: antialiased;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        /* Nav */
        .nav {
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #2E2E28;
          position: sticky; top: 0;
          background: rgba(13,13,11,0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 30;
        }
        .nav-logo { font-family:'Playfair Display',Georgia,serif; font-size:15px; color:#F2EDE4; display:flex; align-items:center; gap:7px; }
        .nav-dot { width:5px; height:5px; border-radius:50%; background:#C9A84C; flex-shrink:0; }
        .nav-btn { background:none; border:1px solid #2E2E28; color:#B8B0A4; padding:6px 14px; border-radius:8px; font-family:'Syne',system-ui,sans-serif; font-size:12px; cursor:pointer; transition:all 0.15s; }
        .nav-btn:hover { border-color:#3A3A34; color:#F2EDE4; }

        /* Page layout — desktop: sidebar + main; mobile: stacked */
        .page-wrap { max-width: 1040px; margin: 0 auto; padding: 28px 16px 80px; }

        /* Desktop two-col */
        .layout { display: grid; grid-template-columns: 250px 1fr; gap: 24px; animation: fadeUp 0.4s ease both; }

        /* Skin card */
        .skin-panel { position: sticky; top: 62px; height: fit-content; }
        .skin-card { background: #1C1C18; border: 1px solid #2E2E28; border-radius: 14px; overflow: hidden; }
        .skin-card-top { padding: 18px 18px 14px; border-bottom: 1px solid #2E2E28; }
        .skin-card-icon { font-size: 20px; margin-bottom: 8px; }
        .skin-card-title { font-family:'Playfair Display',Georgia,serif; font-size:14px; color:#F2EDE4; margin-bottom:2px; }
        .skin-card-sub { font-size:11px; color:#8A8480; }
        .skin-stats { padding: 2px 18px; }
        .stat-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #2E2E28; }
        .stat-row:last-child { border-bottom:none; }
        .stat-lbl { font-size:11px; color:#8A8480; text-transform:uppercase; letter-spacing:0.06em; }
        .stat-val { font-size:12px; color:#B8B0A4; font-weight:500; }
        .skin-summary { padding:12px 18px; background:rgba(201,168,76,0.08); border-top:1px solid rgba(201,168,76,0.15); font-size:12px; color:#B8B0A4; line-height:1.6; font-style:italic; }

        /* Mobile skin accordion */
        .skin-accordion { display:none; }
        .skin-acc-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:#1C1C18; border:1px solid #2E2E28; border-radius:10px; cursor:pointer; margin-bottom:16px; }
        .skin-acc-title { font-size:13px; color:#F2EDE4; font-weight:500; display:flex; align-items:center; gap:8px; }
        .skin-acc-arrow { font-size:11px; color:#8A8480; transition:transform 0.2s; }
        .skin-acc-arrow.open { transform:rotate(180deg); }
        .skin-acc-body { background:#1C1C18; border:1px solid #2E2E28; border-radius:10px; overflow:hidden; margin-bottom:16px; }

        /* Main col */
        .main-col { animation: fadeUp 0.4s ease 0.08s both; min-width: 0; }
        .results-eyebrow { font-size:11px; color:#8A8480; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:5px; }
        .results-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(20px,3vw,26px); color:#F2EDE4; line-height:1.2; margin-bottom:18px; }
        .results-title em { font-style:italic; color:#C9A84C; }

        /* Filter bar */
        .filter-bar { display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:16px; padding:12px 14px; background:#1C1C18; border:1px solid #2E2E28; border-radius:12px; }
        .f-btn { padding:5px 11px; border-radius:20px; border:1px solid #2E2E28; background:#0D0D0B; color:#B8B0A4; font-family:'Syne',system-ui,sans-serif; font-size:11px; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .f-btn:hover { border-color:#3A3A34; color:#F2EDE4; }
        .f-btn.on { border-color:#C9A84C; background:rgba(201,168,76,0.12); color:#F2EDE4; }
        .filter-row-break { width:100%; height:0; } /* forces a row break in flex */
        .sort-sel { padding:5px 10px; border-radius:20px; border:1px solid #2E2E28; background:#0D0D0B; color:#B8B0A4; font-family:'Syne',system-ui,sans-serif; font-size:11px; cursor:pointer; outline:none; margin-left:auto; }

        /* Products */
        .products { display:flex; flex-direction:column; gap:10px; }
        .empty { padding:40px 16px; text-align:center; color:#8A8480; font-size:13px; }
        .disclaimer { margin-top:24px; padding:12px 14px; background:#1C1C18; border:1px solid #2E2E28; border-radius:10px; font-size:11px; color:#8A8480; line-height:1.6; }

        /* Responsive */
        @media (max-width: 720px) {
          .layout { grid-template-columns: 1fr; }
          .skin-panel { position:static; display:none; }
          .skin-accordion { display:block; }
          .page-wrap { padding: 20px 12px 60px; }
        }
        @media (max-width: 400px) {
          .filter-bar { gap:5px; }
          .f-btn { font-size:10px; padding:4px 9px; }
        }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo"><div className="nav-dot" />Before You Buy</div>
        <button className="nav-btn" onClick={() => router.push("/find")}>← New search</button>
      </nav>

      <div className="page-wrap">

        {/* Mobile skin accordion — only visible on mobile */}
        <div className="skin-accordion">
          <div className="skin-acc-header" onClick={() => setSkinPanelOpen(o => !o)}>
            <div className="skin-acc-title">
              <span>◎</span> Your skin profile
            </div>
            <span className={`skin-acc-arrow ${skinPanelOpen ? "open" : ""}`}>▼</span>
          </div>
          {skinPanelOpen && (
            <div className="skin-acc-body">
              <div style={{ padding: "2px 18px" }}>
                {skinStats.map(({ label, value }) => (
                  <div key={label} className="stat-row">
                    <span className="stat-lbl">{label}</span>
                    <span className="stat-val">{value}</span>
                  </div>
                ))}
              </div>
              <div className="skin-summary">
                {skinAnalysis.treatment_priorities.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 6 }}>Treatment priorities</div>
                    {skinAnalysis.treatment_priorities.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, fontSize: 11, color: "#B8B0A4", marginBottom: 4, lineHeight: 1.4 }}>
                        <span style={{ color: "#C9A84C", flexShrink: 0 }}>{i + 1}.</span>{p}
                      </div>
                    ))}
                  </div>
                )}
                {skinAnalysis.confidence_score > 0 && skinAnalysis.confidence_score < 70 && skinAnalysis.limitations && (
                  <div style={{ fontSize: 11, color: "#F87171", marginTop: 6, lineHeight: 1.4 }}>
                    ⚠ {skinAnalysis.limitations}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="layout">

          {/* Desktop sidebar */}
          <div className="skin-panel">
            <div className="skin-card">
              <div className="skin-card-top">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="skin-card-icon" style={{ marginBottom: 0 }}>◎</div>
                  {skinAnalysis.confidence_score > 0 && (
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                      background: skinAnalysis.confidence_score >= 70 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                      color: skinAnalysis.confidence_score >= 70 ? "#4ADE80" : "#F87171",
                      border: `1px solid ${skinAnalysis.confidence_score >= 70 ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                    }}>
                      {skinAnalysis.confidence_score}% confidence
                    </span>
                  )}
                </div>
                <div className="skin-card-title">Your skin profile</div>
                <div className="skin-card-sub">Fitzpatrick est. {skinAnalysis.estimated_fitzpatrick.range} · {skinAnalysis.apparent_skin_tone.undertone} undertone</div>
              </div>
              <div className="skin-stats">
                {skinStats.map(({ label, value }) => (
                  <div key={label} className="stat-row">
                    <span className="stat-lbl">{label}</span>
                    <span className="stat-val">{value}</span>
                  </div>
                ))}
              </div>
              <div className="skin-summary">
                {skinAnalysis.treatment_priorities.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 6 }}>Treatment priorities</div>
                    {skinAnalysis.treatment_priorities.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, fontSize: 11, color: "#B8B0A4", marginBottom: 4, lineHeight: 1.4 }}>
                        <span style={{ color: "#C9A84C", flexShrink: 0 }}>{i + 1}.</span>{p}
                      </div>
                    ))}
                  </div>
                )}
                {skinAnalysis.confidence_score > 0 && skinAnalysis.confidence_score < 70 && skinAnalysis.limitations && (
                  <div style={{ fontSize: 11, color: "#F87171", marginTop: 6, lineHeight: 1.4 }}>
                    ⚠ {skinAnalysis.limitations}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main results column */}
          <div className="main-col">
            <div className="results-eyebrow">{recommendations.length} products found</div>
            <div className="results-title">
              Best <em>{categoryLabel}s</em> for your skin
            </div>

            {/* Filter bar — no separator dividers, just wraps naturally */}
            <div className="filter-bar">
              {["all", "budget", "mid", "premium", "luxury"].map(b => (
                <button key={b} className={`f-btn ${budgetFilter === b ? "on" : ""}`} onClick={() => setBudgetFilter(b)}>
                  {b === "all" ? "Any price" : b.charAt(0).toUpperCase() + b.slice(1)}
                </button>
              ))}
              <button className={`f-btn ${fragranceFree ? "on" : ""}`} onClick={() => setFragranceFree(f => !f)}>Frag-free</button>
              <button className={`f-btn ${veganOnly ? "on" : ""}`} onClick={() => setVeganOnly(v => !v)}>Vegan</button>
              <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                <option value="match">Best match</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="empty">No products match these filters — try adjusting your criteria.</div>
            ) : (
              <div className="products">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} rank={i} />)}
              </div>
            )}

            <div className="disclaimer">
              Before You Buy uses AI skin analysis and ingredient matching to surface relevant products. This is not medical advice. Individual results vary — consult a dermatologist for persistent skin concerns.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}