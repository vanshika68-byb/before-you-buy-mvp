"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useResult } from "./result-context";
import type { SkinProfile } from "./result-context";

const CONCERNS = [
  { id: "acne", label: "Acne & breakouts", icon: "●" },
  { id: "dark_spots", label: "Dark spots", icon: "◐" },
  { id: "dryness", label: "Dryness & dehydration", icon: "◌" },
  { id: "oiliness", label: "Oiliness & shine", icon: "◉" },
  { id: "anti_aging", label: "Anti-aging", icon: "◎" },
  { id: "sensitivity", label: "Redness & sensitivity", icon: "◇" },
  { id: "uneven_tone", label: "Uneven skin tone", icon: "◑" },
  { id: "pores", label: "Large pores", icon: "⊙" },
];

const PRODUCT_CATEGORIES = [
  { id: "cleanser", label: "Cleanser", icon: "◌", sub: "Face wash or cleansing balm" },
  { id: "toner", label: "Toner", icon: "◎", sub: "Balancing & hydrating toner" },
  { id: "serum", label: "Serum", icon: "✦", sub: "Targeted treatment serum" },
  { id: "moisturizer", label: "Moisturizer", icon: "◉", sub: "Hydrating face cream or gel" },
  { id: "sunscreen", label: "Sunscreen", icon: "☀", sub: "SPF protection" },
  { id: "eye_cream", label: "Eye cream", icon: "◑", sub: "Under-eye treatment" },
  { id: "face_mask", label: "Face mask", icon: "⊙", sub: "Weekly treatment mask" },
  { id: "exfoliant", label: "Exfoliant", icon: "⚗", sub: "AHA / BHA / enzyme" },
];

const BUDGET_OPTIONS = [
  { id: "budget", label: "Budget", sub: "Under ₹500" },
  { id: "mid", label: "Mid-range", sub: "₹500–2000" },
  { id: "premium", label: "Premium", sub: "₹2000–6000" },
  { id: "luxury", label: "Luxury", sub: "₹6000+" },
];

type Step = "upload" | "concerns" | "product" | "filters";

export default function Home() {
  const router = useRouter();
  const { setSkinProfile, setUploadedImageBase64 } = useResult();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [profile, setProfile] = useState({
    budget: "mid" as SkinProfile["budget"],
    fragrance_free: false,
    vegan_only: false,
    pregnancy_safe: false,
    known_allergies: "",
  });

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleSubmit = () => {
    const finalProfile: SkinProfile = {
      primary_concern: selectedConcerns[0] || "general",
      product_category: selectedCategory,
      budget: profile.budget,
      known_allergies: profile.known_allergies,
      pregnancy_safe: profile.pregnancy_safe,
      fragrance_free: profile.fragrance_free,
      vegan_only: profile.vegan_only,
    };
    setSkinProfile(finalProfile);
    setUploadedImageBase64(imageBase64);
    router.push("/analyzing");
  };

  const stepIndex = ["upload", "concerns", "product", "filters"].indexOf(step);
  const stepLabels = ["Your skin", "Concerns", "Product", "Filters"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0D0D0B; --bg2: #141410; --surface: #1C1C18; --surface2: #242420;
          --border: #2E2E28; --border-light: #3A3A34;
          --gold: #C9A84C; --gold-muted: #A8884A; --gold-light: rgba(201,168,76,0.12); --gold-glow: rgba(201,168,76,0.06);
          --cream: #F2EDE4; --cream-muted: #B8B0A4; --cream-faint: #6B6560;
          --serif: 'Playfair Display', Georgia, serif; --sans: 'Syne', system-ui, sans-serif;
        }
        html, body { background: var(--bg); color: var(--cream); font-family: var(--sans); -webkit-font-smoothing: antialiased; min-height: 100vh; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .page { min-height: 100vh; display: flex; flex-direction: column; }
        .nav { padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
        .nav-logo { font-family: var(--serif); font-size: 16px; color: var(--cream); display: flex; align-items: center; gap: 8px; }
        .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
        .nav-tag { font-size: 11px; color: var(--cream-faint); letter-spacing: 0.1em; text-transform: uppercase; }

        .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; }

        /* Step bar */
        .stepbar { display: flex; align-items: center; gap: 0; margin-bottom: 44px; animation: fadeUp 0.3s ease both; }
        .step-item { display: flex; align-items: center; gap: 7px; }
        .step-num { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--border); font-size: 10px; font-weight: 500; color: var(--cream-faint); display: flex; align-items: center; justify-content: center; transition: all 0.3s; flex-shrink: 0; }
        .step-num.active { border-color: var(--gold); color: var(--gold); background: var(--gold-light); }
        .step-num.done { background: var(--gold); border-color: var(--gold); color: var(--bg); }
        .step-lbl { font-size: 11px; color: var(--cream-faint); letter-spacing: 0.04em; text-transform: uppercase; transition: color 0.3s; }
        .step-lbl.active { color: var(--gold); }
        .step-connector { width: 32px; height: 1px; background: var(--border); margin: 0 8px; transition: background 0.3s; }
        .step-connector.done { background: var(--gold-muted); }

        /* Card */
        .card { width: 100%; max-width: 540px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; animation: fadeUp 0.4s ease 0.08s both; }
        .card-head { padding: 28px 32px 0; }
        .card-eyebrow { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
        .card-title { font-family: var(--serif); font-size: clamp(20px, 4vw, 26px); color: var(--cream); line-height: 1.2; margin-bottom: 6px; }
        .card-sub { font-size: 13px; color: var(--cream-faint); line-height: 1.5; }
        .card-body { padding: 24px 32px 28px; }

        /* Upload */
        .drop-zone { border: 1.5px dashed var(--border-light); border-radius: 12px; padding: 36px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--bg2); position: relative; overflow: hidden; }
        .drop-zone:hover, .drop-zone.drag { border-color: var(--gold-muted); background: var(--gold-glow); }
        .drop-zone.filled { border-style: solid; border-color: var(--gold); padding: 0; }
        .drop-icon { font-size: 28px; margin-bottom: 10px; display: block; }
        .drop-title { font-size: 14px; font-weight: 500; color: var(--cream); margin-bottom: 4px; }
        .drop-sub { font-size: 12px; color: var(--cream-faint); }
        .drop-preview { width: 100%; height: 220px; object-fit: cover; display: block; }
        .drop-change { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.75)); padding: 20px 12px 10px; font-size: 11px; color: var(--cream-muted); cursor: pointer; }
        .tips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
        .tip { font-size: 11px; color: var(--cream-faint); background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 3px 10px; }

        /* Grid selectors */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .sel-btn { padding: 11px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg2); color: var(--cream-muted); font-family: var(--sans); font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 9px; transition: all 0.15s; text-align: left; }
        .sel-btn:hover { border-color: var(--border-light); color: var(--cream); }
        .sel-btn.on { border-color: var(--gold); background: var(--gold-light); color: var(--cream); }
        .sel-btn .ico { font-size: 13px; color: var(--cream-faint); flex-shrink: 0; }
        .sel-btn.on .ico { color: var(--gold); }

        /* Product category cards — bigger with subtitle */
        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cat-btn { padding: 14px 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg2); color: var(--cream-muted); font-family: var(--sans); cursor: pointer; display: flex; align-items: flex-start; gap: 10px; transition: all 0.15s; text-align: left; }
        .cat-btn:hover { border-color: var(--border-light); color: var(--cream); }
        .cat-btn.on { border-color: var(--gold); background: var(--gold-light); color: var(--cream); }
        .cat-ico { font-size: 16px; color: var(--cream-faint); flex-shrink: 0; margin-top: 1px; }
        .cat-btn.on .cat-ico { color: var(--gold); }
        .cat-name { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
        .cat-sub { font-size: 11px; color: var(--cream-faint); }
        .cat-btn.on .cat-sub { color: var(--gold-muted); }

        /* Budget row */
        .budget-row { display: flex; gap: 8px; }
        .bud-btn { flex: 1; padding: 9px 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg2); color: var(--cream-muted); font-family: var(--sans); font-size: 12px; cursor: pointer; text-align: center; transition: all 0.15s; }
        .bud-btn:hover { border-color: var(--border-light); }
        .bud-btn.on { border-color: var(--gold); background: var(--gold-light); color: var(--cream); }
        .bud-sub { font-size: 10px; color: var(--cream-faint); margin-top: 2px; }
        .bud-btn.on .bud-sub { color: var(--gold-muted); }

        /* Toggles */
        .toggle-group { margin-top: 16px; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border); }
        .toggle-row:last-of-type { border-bottom: none; }
        .toggle-lbl { font-size: 13px; color: var(--cream-muted); }
        .tog { width: 34px; height: 19px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border); cursor: pointer; position: relative; transition: all 0.2s; flex-shrink: 0; }
        .tog.on { background: var(--gold); border-color: var(--gold); }
        .tog::after { content: ''; position: absolute; width: 13px; height: 13px; border-radius: 50%; background: var(--cream-faint); top: 2px; left: 2px; transition: all 0.2s; }
        .tog.on::after { left: 17px; background: var(--bg); }

        /* Allergy input */
        .txt-input { width: 100%; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--cream); font-family: var(--sans); font-size: 13px; outline: none; transition: border-color 0.15s; margin-top: 10px; }
        .txt-input:focus { border-color: var(--border-light); }
        .txt-input::placeholder { color: var(--cream-faint); }

        /* Labels */
        .lbl { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cream-faint); margin-bottom: 10px; margin-top: 20px; display: block; }
        .lbl:first-child { margin-top: 0; }
        .hint { font-size: 11px; color: var(--cream-faint); text-align: center; margin-top: 10px; }

        /* CTA */
        .cta { width: 100%; padding: 13px; background: var(--gold); color: var(--bg); border: none; border-radius: 10px; font-family: var(--sans); font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 22px; transition: all 0.2s; letter-spacing: 0.02em; }
        .cta:hover { background: #D4B05A; transform: translateY(-1px); }
        .cta:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .back-btn { background: none; border: none; color: var(--cream-faint); font-family: var(--sans); font-size: 12px; cursor: pointer; padding: 0 0 14px; display: flex; align-items: center; gap: 5px; transition: color 0.15s; }
        .back-btn:hover { color: var(--cream-muted); }

        .footer { text-align: center; padding: 20px; font-size: 11px; color: var(--cream-faint); }
        @media (max-width: 480px) {
          .nav { padding: 16px 20px; }
          .card-head { padding: 22px 22px 0; }
          .card-body { padding: 18px 22px 22px; }
          .cat-grid { grid-template-columns: 1fr; }
          .budget-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="page">
        <nav className="nav">
          <div className="nav-logo"><div className="nav-dot" />Before You Buy</div>
          <div className="nav-tag">Skin-first. Brand-neutral.</div>
        </nav>

        <main className="main">
          {/* Step bar */}
          <div className="stepbar">
            {stepLabels.map((lbl, i) => (
              <div key={lbl} className="step-item">
                {i > 0 && <div className={`step-connector ${i <= stepIndex ? "done" : ""}`} />}
                <div className={`step-num ${i === stepIndex ? "active" : i < stepIndex ? "done" : ""}`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`step-lbl ${i === stepIndex ? "active" : ""}`}>{lbl}</span>
              </div>
            ))}
          </div>

          {/* ── Step 1: Upload ── */}
          {step === "upload" && (
            <div className="card">
              <div className="card-head">
                <div className="card-eyebrow">Step 1 of 4</div>
                <div className="card-title">Show us your skin</div>
                <div className="card-sub">A clear selfie in natural light, no makeup. We use AI to analyse your skin conditions.</div>
              </div>
              <div className="card-body">
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                <div
                  className={`drop-zone ${isDragging ? "drag" : ""} ${imagePreview ? "filled" : ""}`}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Your skin" className="drop-preview" />
                      <div className="drop-change" onClick={() => fileInputRef.current?.click()}>Tap to change photo</div>
                    </>
                  ) : (
                    <>
                      <span className="drop-icon">◎</span>
                      <div className="drop-title">Upload a selfie</div>
                      <div className="drop-sub">Drag & drop or tap to browse</div>
                    </>
                  )}
                </div>
                {!imagePreview && (
                  <div className="tips">
                    <span className="tip">Natural light</span>
                    <span className="tip">No makeup</span>
                    <span className="tip">Front-facing</span>
                    <span className="tip">Bare skin</span>
                  </div>
                )}
                <button className="cta" disabled={!imagePreview} onClick={() => setStep("concerns")}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Concerns ── */}
          {step === "concerns" && (
            <div className="card">
              <div className="card-head">
                <div className="card-eyebrow">Step 2 of 4</div>
                <div className="card-title">What are your main concerns?</div>
                <div className="card-sub">Pick up to 3. We'll prioritise products that target these specifically.</div>
              </div>
              <div className="card-body">
                <button className="back-btn" onClick={() => setStep("upload")}>← Back</button>
                <div className="grid-2">
                  {CONCERNS.map(c => (
                    <button
                      key={c.id}
                      className={`sel-btn ${selectedConcerns.includes(c.id) ? "on" : ""}`}
                      onClick={() => {
                        setSelectedConcerns(prev =>
                          prev.includes(c.id) ? prev.filter(x => x !== c.id) : prev.length < 3 ? [...prev, c.id] : prev
                        );
                      }}
                    >
                      <span className="ico">{c.icon}</span>{c.label}
                    </button>
                  ))}
                </div>
                {selectedConcerns.length === 3 && <div className="hint">Maximum 3 selected</div>}
                <button className="cta" disabled={selectedConcerns.length === 0} onClick={() => setStep("product")}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Product category ── */}
          {step === "product" && (
            <div className="card">
              <div className="card-head">
                <div className="card-eyebrow">Step 3 of 4</div>
                <div className="card-title">What are you looking to buy?</div>
                <div className="card-sub">Pick one. We'll find the best options for your specific skin profile.</div>
              </div>
              <div className="card-body">
                <button className="back-btn" onClick={() => setStep("concerns")}>← Back</button>
                <div className="cat-grid">
                  {PRODUCT_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      className={`cat-btn ${selectedCategory === c.id ? "on" : ""}`}
                      onClick={() => setSelectedCategory(c.id)}
                    >
                      <span className="cat-ico">{c.icon}</span>
                      <div>
                        <div className="cat-name">{c.label}</div>
                        <div className="cat-sub">{c.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <button className="cta" disabled={!selectedCategory} onClick={() => setStep("filters")}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Filters ── */}
          {step === "filters" && (
            <div className="card">
              <div className="card-head">
                <div className="card-eyebrow">Step 4 of 4</div>
                <div className="card-title">Almost done</div>
                <div className="card-sub">Set your budget and any preferences. We'll filter accordingly.</div>
              </div>
              <div className="card-body">
                <button className="back-btn" onClick={() => setStep("product")}>← Back</button>

                <span className="lbl">Budget per product</span>
                <div className="budget-row">
                  {BUDGET_OPTIONS.map(b => (
                    <button
                      key={b.id}
                      className={`bud-btn ${profile.budget === b.id ? "on" : ""}`}
                      onClick={() => setProfile(p => ({ ...p, budget: b.id as SkinProfile["budget"] }))}
                    >
                      {b.label}
                      <div className="bud-sub">{b.sub}</div>
                    </button>
                  ))}
                </div>

                <div className="toggle-group">
                  {[
                    { key: "fragrance_free", label: "Fragrance-free only" },
                    { key: "vegan_only", label: "Vegan products only" },
                    { key: "pregnancy_safe", label: "Pregnancy-safe formulas" },
                  ].map(({ key, label }) => (
                    <div key={key} className="toggle-row">
                      <span className="toggle-lbl">{label}</span>
                      <div
                        className={`tog ${profile[key as keyof typeof profile] ? "on" : ""}`}
                        onClick={() => setProfile(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      />
                    </div>
                  ))}
                </div>

                <span className="lbl" style={{ marginTop: 16 }}>Known allergies or sensitivities</span>
                <input
                  type="text"
                  className="txt-input"
                  placeholder="e.g. fragrance, niacinamide, lanolin"
                  value={profile.known_allergies}
                  onChange={e => setProfile(p => ({ ...p, known_allergies: e.target.value }))}
                />

                <button className="cta" onClick={handleSubmit}>
                  Find my {PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase() || "products"} →
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">For informational use only — not a substitute for medical advice</footer>
      </div>
    </>
  );
}