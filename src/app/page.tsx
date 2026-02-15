"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResult, type SkinProfile } from "./result-context";

const SKIN_TYPES = [
  { value: "oily", label: "Oily" },
  { value: "dry", label: "Dry" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
  { value: "normal", label: "Normal" },
] as const;

const CONCERNS = [
  { value: "acne", label: "Acne & breakouts" },
  { value: "anti-aging", label: "Anti-aging" },
  { value: "hyperpigmentation", label: "Dark spots" },
  { value: "redness", label: "Redness & rosacea" },
  { value: "dryness", label: "Dryness" },
  { value: "sensitivity", label: "Sensitivity" },
  { value: "large-pores", label: "Large pores" },
  { value: "dullness", label: "Dullness" },
];

export default function Home() {
  const router = useRouter();
  const { setSubmittedUrl, setSkinProfile } = useResult();

  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Profile state
  const [skinType, setSkinType] = useState<SkinProfile["skin_type"] | "">("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState("");
  const [knownAllergies, setKnownAllergies] = useState("");

  function toggleConcern(value: string) {
    setSelectedConcerns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || isSubmitting) return;
    setIsSubmitting(true);

    // Build skin profile if any data entered
    const hasProfile = skinType || selectedConcerns.length > 0 || currentRoutine.trim() || knownAllergies.trim();
    if (hasProfile) {
      const profile: SkinProfile = {
        ...(skinType ? { skin_type: skinType } : {}),
        ...(selectedConcerns.length > 0 ? { concerns: selectedConcerns } : {}),
        ...(currentRoutine.trim() ? { current_routine: currentRoutine.trim() } : {}),
        ...(knownAllergies.trim() ? { known_allergies: knownAllergies.trim() } : {}),
      };
      setSkinProfile(profile);
    } else {
      setSkinProfile(null);
    }

    setSubmittedUrl(url.trim());
    router.push("/analyzing");
  }

  const profileFilled = skinType || selectedConcerns.length > 0 || currentRoutine.trim() || knownAllergies.trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

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

        body {
          background: var(--cream);
          font-family: var(--sans);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        /* Nav */
        .nav {
          padding: 24px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          animation: fadeIn 0.4s ease;
        }
        .nav-logo {
          font-family: var(--serif);
          font-size: 18px;
          color: var(--ink);
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-logo-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
        }
        .nav-badge {
          font-size: 12px;
          font-weight: 500;
          color: var(--green);
          background: var(--green-muted);
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.01em;
        }

        /* Main */
        .main {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 56px 24px 64px;
        }
        .container {
          width: 100%;
          max-width: 620px;
        }

        /* Eyebrow */
        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease 0.1s both;
        }
        .eyebrow-line { width: 24px; height: 1px; background: var(--green); }
        .eyebrow-text {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--green);
        }

        /* Headline */
        .headline {
          font-family: var(--serif);
          font-size: clamp(36px, 6vw, 54px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 20px;
          animation: fadeUp 0.5s ease 0.15s both;
        }
        .headline em { font-style: italic; color: var(--green); }

        .subtext {
          font-size: 16px;
          line-height: 1.65;
          color: var(--ink-muted);
          font-weight: 300;
          margin-bottom: 36px;
          max-width: 480px;
          animation: fadeUp 0.5s ease 0.2s both;
        }

        /* Form */
        .form { animation: fadeUp 0.5s ease 0.25s both; }

        .input-wrapper {
          position: relative;
          margin-bottom: 12px;
        }
        .input {
          width: 100%;
          padding: 16px 20px;
          padding-right: 160px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: #fff;
          font-family: var(--sans);
          font-size: 15px;
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          font-weight: 300;
        }
        .input::placeholder { color: var(--ink-faint); }
        .input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(45, 80, 22, 0.08);
        }
        .input:disabled { opacity: 0.6; cursor: not-allowed; }

        .submit-btn {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          padding: 10px 20px;
          border-radius: 7px;
          border: none;
          background: var(--green);
          color: #fff;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) { background: var(--green-light); }
        .submit-btn:disabled { background: var(--ink-faint); cursor: not-allowed; }

        .input-hint {
          font-size: 13px;
          color: var(--ink-faint);
          font-weight: 300;
          margin-bottom: 16px;
        }

        /* Profile toggle */
        .profile-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1.5px dashed var(--border);
          border-radius: 8px;
          padding: 11px 16px;
          cursor: pointer;
          width: 100%;
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-muted);
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
          margin-bottom: 24px;
          text-align: left;
        }
        .profile-toggle:hover {
          border-color: var(--green);
          color: var(--green);
          background: var(--green-muted);
        }
        .profile-toggle.active {
          border-color: var(--green);
          border-style: solid;
          color: var(--green);
          background: var(--green-muted);
        }
        .profile-toggle-icon {
          font-size: 15px;
          flex-shrink: 0;
        }
        .profile-toggle-text { flex: 1; }
        .profile-toggle-chevron {
          font-size: 11px;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .profile-toggle-chevron.open { transform: rotate(180deg); }
        .profile-badge {
          font-size: 11px;
          font-weight: 600;
          background: var(--green);
          color: #fff;
          padding: 2px 7px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        /* Profile panel */
        .profile-panel {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 24px;
          animation: slideDown 0.2s ease;
        }

        .profile-section { margin-bottom: 22px; }
        .profile-section:last-child { margin-bottom: 0; }

        .profile-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 10px;
          display: block;
        }
        .profile-optional {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          color: var(--ink-faint);
          margin-left: 6px;
        }

        /* Skin type pills */
        .skin-type-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skin-type-pill {
          padding: 7px 14px;
          border-radius: 20px;
          border: 1.5px solid var(--border);
          background: var(--cream);
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .skin-type-pill:hover {
          border-color: var(--green);
          color: var(--green);
        }
        .skin-type-pill.selected {
          border-color: var(--green);
          background: var(--green);
          color: #fff;
          font-weight: 500;
        }

        /* Concern checkboxes */
        .concerns-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .concern-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--cream);
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .concern-item:hover {
          border-color: var(--green);
          background: var(--green-muted);
        }
        .concern-item.checked {
          border-color: var(--green);
          background: var(--green-muted);
        }
        .concern-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid var(--border);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
          font-size: 10px;
          color: #fff;
        }
        .concern-item.checked .concern-checkbox {
          border-color: var(--green);
          background: var(--green);
        }
        .concern-label {
          font-size: 13px;
          color: var(--ink-muted);
          font-weight: 400;
          transition: color 0.15s ease;
        }
        .concern-item.checked .concern-label {
          color: var(--green);
          font-weight: 500;
        }

        /* Text inputs */
        .profile-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--cream);
          font-family: var(--sans);
          font-size: 14px;
          color: var(--ink);
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .profile-input::placeholder { color: var(--ink-faint); }
        .profile-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(45, 80, 22, 0.08);
          background: #fff;
        }
        .profile-input-hint {
          font-size: 12px;
          color: var(--ink-faint);
          font-weight: 300;
          margin-top: 6px;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          animation: fadeUp 0.5s ease 0.3s both;
        }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 12px; color: var(--ink-faint); font-weight: 400; letter-spacing: 0.03em; }

        /* Pillars */
        .pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          animation: fadeUp 0.5s ease 0.35s both;
        }
        .pillar {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
        }
        .pillar-icon {
          width: 32px;
          height: 32px;
          background: var(--green-muted);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          font-size: 15px;
        }
        .pillar-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 4px; }
        .pillar-desc { font-size: 12px; line-height: 1.5; color: var(--ink-muted); font-weight: 300; }

        /* Footer */
        .footer {
          padding: 20px 48px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: fadeIn 0.4s ease 0.4s both;
        }
        .footer-text { font-size: 12px; color: var(--ink-faint); font-weight: 300; }
        .footer-disclaimer { font-size: 12px; color: var(--ink-faint); font-weight: 300; font-style: italic; }

        /* Responsive */
        @media (max-width: 600px) {
          .nav { padding: 20px 24px; }
          .main { padding: 40px 16px 56px; }
          .footer { flex-direction: column; gap: 8px; padding: 20px 24px; text-align: center; }
          .pillars { grid-template-columns: 1fr; }
          .input { padding-right: 16px; }
          .submit-btn { position: static; transform: none; width: 100%; margin-top: 8px; padding: 14px; border-radius: 8px; }
          .input-wrapper { display: flex; flex-direction: column; }
          .concerns-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            Before You Buy
          </div>
          <span className="nav-badge">Dermatology-informed</span>
        </nav>

        <main className="main">
          <div className="container">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Formulation Analysis</span>
            </div>

            <h1 className="headline">
              Know what&rsquo;s really<br />
              <em>in your skincare.</em>
            </h1>

            <p className="subtext">
              Paste any product link for a dermatologist-level formulation screen.
              We flag real risks, ingredient conflicts, and skin-type mismatches — before you buy.
            </p>

            <form className="form" onSubmit={handleSubmit}>
              {/* URL input */}
              <div className="input-wrapper">
                <input
                  className="input"
                  type="url"
                  placeholder="https://sephora.com/product/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  className="submit-btn"
                  type="submit"
                  disabled={isSubmitting || !url.trim()}
                >
                  {isSubmitting ? "Analysing…" : "Check product →"}
                </button>
              </div>
              <p className="input-hint">
                Works with Sephora, LOOKFANTASTIC, Cult Beauty, brand websites & more
              </p>

              {/* Skin profile toggle */}
              <button
                type="button"
                className={`profile-toggle ${profileOpen ? "active" : ""}`}
                onClick={() => setProfileOpen((o) => !o)}
              >
                <span className="profile-toggle-icon">🧴</span>
                <span className="profile-toggle-text">
                  {profileFilled
                    ? "Your skin profile (personalises results)"
                    : "Add your skin profile for personalised analysis"}
                </span>
                {profileFilled && !profileOpen && (
                  <span className="profile-badge">✓ Added</span>
                )}
                <span className={`profile-toggle-chevron ${profileOpen ? "open" : ""}`}>▼</span>
              </button>

              {/* Skin profile panel */}
              {profileOpen && (
                <div className="profile-panel">

                  {/* Skin type */}
                  <div className="profile-section">
                    <label className="profile-label">
                      Skin type
                    </label>
                    <div className="skin-type-row">
                      {SKIN_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          className={`skin-type-pill ${skinType === type.value ? "selected" : ""}`}
                          onClick={() => setSkinType(skinType === type.value ? "" : type.value)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Concerns */}
                  <div className="profile-section">
                    <label className="profile-label">
                      Skin concerns
                      <span className="profile-optional">pick all that apply</span>
                    </label>
                    <div className="concerns-grid">
                      {CONCERNS.map((concern) => {
                        const checked = selectedConcerns.includes(concern.value);
                        return (
                          <div
                            key={concern.value}
                            className={`concern-item ${checked ? "checked" : ""}`}
                            onClick={() => toggleConcern(concern.value)}
                          >
                            <div className="concern-checkbox">
                              {checked && "✓"}
                            </div>
                            <span className="concern-label">{concern.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current routine */}
                  <div className="profile-section">
                    <label className="profile-label">
                      Current actives in your routine
                      <span className="profile-optional">optional</span>
                    </label>
                    <input
                      className="profile-input"
                      type="text"
                      placeholder="e.g. retinol, vitamin C serum, niacinamide"
                      value={currentRoutine}
                      onChange={(e) => setCurrentRoutine(e.target.value)}
                    />
                    <p className="profile-input-hint">
                      Helps us flag conflicts with products you already use
                    </p>
                  </div>

                  {/* Known allergies */}
                  <div className="profile-section">
                    <label className="profile-label">
                      Known sensitivities or allergies
                      <span className="profile-optional">optional</span>
                    </label>
                    <input
                      className="profile-input"
                      type="text"
                      placeholder="e.g. fragrance, alcohol, nickel"
                      value={knownAllergies}
                      onChange={(e) => setKnownAllergies(e.target.value)}
                    />
                  </div>

                </div>
              )}
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">What we analyse</span>
              <div className="divider-line" />
            </div>

            <div className="pillars">
              <div className="pillar">
                <div className="pillar-icon">⚗️</div>
                <div className="pillar-title">Active ingredients</div>
                <div className="pillar-desc">Identifies actives, estimates concentrations, flags pH dependencies</div>
              </div>
              <div className="pillar">
                <div className="pillar-icon">⚡</div>
                <div className="pillar-title">Conflicts & interactions</div>
                <div className="pillar-desc">Detects ingredient clashes like retinol + AHA or benzoyl peroxide + retinol</div>
              </div>
              <div className="pillar">
                <div className="pillar-icon">🧬</div>
                <div className="pillar-title">Skin type fit</div>
                <div className="pillar-desc">Rates suitability across oily, dry, combination, sensitive and normal skin</div>
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <span className="footer-text">© 2025 Before You Buy</span>
          <span className="footer-disclaimer">For informational use only — not a substitute for medical advice</span>
        </footer>
      </div>
    </>
  );
}