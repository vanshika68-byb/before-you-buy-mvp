"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResult } from "./result-context";

const EXAMPLE_URLS = [
  "Cerave Moisturizing Cream",
  "The Ordinary Niacinamide 10%",
  "Paula's Choice BHA Exfoliant",
];

export default function Home() {
  const router = useRouter();
  const { setSubmittedUrl } = useResult();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmittedUrl(url.trim());
    router.push("/analyzing");
  }

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

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

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

        .main {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
        }

        .container {
          width: 100%;
          max-width: 620px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        .eyebrow-line {
          width: 24px;
          height: 1px;
          background: var(--green);
        }

        .eyebrow-text {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--green);
        }

        .headline {
          font-family: var(--serif);
          font-size: clamp(36px, 6vw, 54px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 20px;
          animation: fadeUp 0.5s ease 0.15s both;
        }

        .headline em {
          font-style: italic;
          color: var(--green);
        }

        .subtext {
          font-size: 16px;
          line-height: 1.65;
          color: var(--ink-muted);
          font-weight: 300;
          margin-bottom: 40px;
          max-width: 480px;
          animation: fadeUp 0.5s ease 0.2s both;
        }

        .form {
          animation: fadeUp 0.5s ease 0.25s both;
        }

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
          transition: background 0.15s ease, transform 0.1s ease;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) { background: var(--green-light); }
        .submit-btn:active:not(:disabled) { transform: translateY(-50%) scale(0.97); }
        .submit-btn:disabled { background: var(--ink-faint); cursor: not-allowed; }

        .input-hint {
          font-size: 13px;
          color: var(--ink-faint);
          font-weight: 300;
          margin-bottom: 40px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          animation: fadeUp 0.5s ease 0.3s both;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .divider-text {
          font-size: 12px;
          color: var(--ink-faint);
          font-weight: 400;
          letter-spacing: 0.03em;
        }

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

        .pillar-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .pillar-desc {
          font-size: 12px;
          line-height: 1.5;
          color: var(--ink-muted);
          font-weight: 300;
        }

        .footer {
          padding: 20px 48px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: fadeIn 0.4s ease 0.4s both;
        }

        .footer-text {
          font-size: 12px;
          color: var(--ink-faint);
          font-weight: 300;
        }

        .footer-disclaimer {
          font-size: 12px;
          color: var(--ink-faint);
          font-weight: 300;
          font-style: italic;
        }

        @media (max-width: 600px) {
          .nav { padding: 20px 24px; }
          .footer { flex-direction: column; gap: 8px; padding: 20px 24px; text-align: center; }
          .pillars { grid-template-columns: 1fr; }
          .input { padding-right: 16px; }
          .submit-btn { position: static; transform: none; width: 100%; margin-top: 8px; padding: 14px; border-radius: 8px; }
          .input-wrapper { display: flex; flex-direction: column; }
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
              <div className="input-wrapper">
                <input
                  className="input"
                  type="url"
                  placeholder="https://sephora.com/product/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
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
          <span className="footer-text">© 2026 Before You Buy</span>
          <span className="footer-disclaimer">For informational use only — not a substitute for medical advice</span>
        </footer>
      </div>
    </>
  );
}