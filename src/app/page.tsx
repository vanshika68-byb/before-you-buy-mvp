"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    name: "Priya M.",
    location: "Mumbai",
    concern: "Acne & dark spots",
    text: "I'd spent ₹8,000 on products that made my skin worse. Before You Buy analysed my photo and immediately flagged that my moisturiser had fragrance — the exact thing causing my breakouts. Found a better one for ₹450.",
    product: "Switched to: Simple Kind to Skin Moisturiser",
    score: 94,
  },
  {
    name: "Ananya R.",
    location: "Bengaluru",
    concern: "Hyperpigmentation",
    text: "The AI correctly identified my Fitzpatrick IV skin tone and recommended vitamin C serums that actually work on deeper tones. Most apps recommend the same generic products regardless of skin tone.",
    product: "Now using: Minimalist Alpha Arbutin 2%",
    score: 91,
  },
  {
    name: "Rohan S.",
    location: "Delhi",
    concern: "Oily skin & enlarged pores",
    text: "I thought I needed an expensive pore-minimising serum. Turns out niacinamide at 10% — available for ₹599 — does the same job. The match score explanation made perfect sense once I understood why.",
    product: "Switched to: The Ordinary Niacinamide 10%",
    score: 89,
  },
  {
    name: "Fatima K.",
    location: "Hyderabad",
    concern: "Eczema-prone skin",
    text: "Finding fragrance-free, barrier-friendly products used to take me hours of research. This tool filtered exactly for my needs in seconds and explained why each ingredient was or wasn't suitable.",
    product: "Now using: CeraVe Moisturising Cream",
    score: 97,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "◎",
    title: "Upload a selfie",
    body: "Our AI vision model analyses your skin in real time — detecting skin type, oiliness, acne severity, pigmentation, sensitivity, and tone. No makeup. Just your skin.",
  },
  {
    step: "02",
    icon: "◑",
    title: "Tell us what you need",
    body: "Pick your top concerns and the type of product you're looking for — cleanser, serum, moisturiser, SPF, and more. Set your budget and any hard requirements.",
  },
  {
    step: "03",
    icon: "✦",
    title: "Get your ranked catalog",
    body: "We match your skin profile against products ingredient-by-ingredient and rank them by fit score. Every recommendation explains exactly why it suits your specific skin.",
  },
];

const FEATURES = [
  {
    icon: "◎",
    title: "AI skin analysis",
    body: "GPT-4o Vision reads oiliness, acne, pigmentation, sensitivity, and tone from your photo — the same attributes a dermatologist would assess at first glance.",
  },
  {
    icon: "⚗",
    title: "Ingredient-level matching",
    body: "We don't match by skin type alone. We match by what your specific concerns need, what ingredients deliver that, and whether the formulation is appropriate for your skin.",
  },
  {
    icon: "◇",
    title: "No brand bias",
    body: "We have no commercial relationship with any brand. A ₹400 drugstore product will outrank a ₹4,000 premium one if it's better for your skin.",
  },
  {
    icon: "◐",
    title: "Concern-aware filtering",
    body: "Eczema, rosacea, pregnancy, fragrance sensitivity — the engine accounts for conditions that change which ingredients are appropriate, not just which skin type you have.",
  },
  {
    icon: "⊙",
    title: "Budget-conscious",
    body: "Set your ceiling. We surface the best options within it — from drugstore to luxury — ranked purely by how well they match your skin, not price.",
  },
  {
    icon: "●",
    title: "Explainable results",
    body: "Every recommendation shows exactly why it ranked where it did. Match reasons, key ingredients, and what to watch out for — so you understand, not just trust.",
  },
];

const STATS = [
  { value: "6", label: "Products compared per search" },
  { value: "2", label: "AI calls per analysis" },
  { value: "8", label: "Product categories covered" },
  { value: "0", label: "Brand partnerships or paid placements" },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0D0D0B; --bg2: #111110; --surface: #1C1C18; --surface2: #242420; --surface3: #2A2A24;
          --border: #2E2E28; --border-light: #3A3A34;
          --gold: #C9A84C; --gold-muted: #A8884A; --gold-light: rgba(201,168,76,0.1); --gold-glow: rgba(201,168,76,0.05);
          --cream: #F2EDE4; --cream-muted: #B8B0A4; --cream-faint: #6B6560; --cream-faintest: #3A3730;
          --green: #4ADE80; --red: #F87171;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Syne', system-ui, sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--cream); font-family: var(--sans); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }

        /* ── Nav ── */
        .nav {
          padding: 18px 48px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(13,13,11,0.9);
          backdrop-filter: blur(16px);
        }
        .nav-logo { font-family: var(--serif); font-size: 17px; color: var(--cream); display: flex; align-items: center; gap: 8px; }
        .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 2.5s ease infinite; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link { font-size: 13px; color: var(--cream-faint); cursor: pointer; transition: color 0.15s; }
        .nav-link:hover { color: var(--cream-muted); }
        .nav-cta {
          padding: 8px 18px;
          background: var(--gold);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-cta:hover { background: #D4B05A; transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 20px;
          background: var(--gold-light);
          font-size: 11px;
          color: var(--gold);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 28px;
          animation: fadeUp 0.5s ease both;
        }
        .hero-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: pulse 1.5s ease infinite; }
        .hero-title {
          font-family: var(--serif);
          font-size: clamp(38px, 7vw, 72px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--cream);
          margin-bottom: 24px;
          max-width: 800px;
          animation: fadeUp 0.5s ease 0.1s both;
        }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-sub {
          font-size: clamp(15px, 2vw, 18px);
          color: var(--cream-muted);
          line-height: 1.6;
          max-width: 520px;
          margin-bottom: 40px;
          animation: fadeUp 0.5s ease 0.2s both;
        }
        .hero-actions { display: flex; align-items: center; gap: 14px; animation: fadeUp 0.5s ease 0.3s both; }
        .btn-primary {
          padding: 14px 28px;
          background: var(--gold);
          color: var(--bg);
          border: none;
          border-radius: 10px;
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .btn-primary:hover { background: #D4B05A; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.25); }
        .btn-ghost {
          padding: 14px 24px;
          background: none;
          color: var(--cream-muted);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: var(--sans);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: var(--border-light); color: var(--cream); }
        .hero-trust {
          display: flex; align-items: center; gap: 20px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
          animation: fadeUp 0.5s ease 0.4s both;
          flex-wrap: wrap;
          justify-content: center;
        }
        .trust-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--cream-faint); }
        .trust-icon { color: var(--gold); font-size: 13px; }

        /* ── Demo card ── */
        .demo-section { padding: 80px 24px; display: flex; justify-content: center; }
        .demo-card {
          max-width: 700px; width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          animation: float 6s ease infinite;
        }
        .demo-top { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .demo-top-title { font-family: var(--serif); font-size: 15px; color: var(--cream); }
        .demo-badge { font-size: 10px; padding: 3px 10px; border-radius: 20px; background: var(--gold-light); color: var(--gold); border: 1px solid rgba(201,168,76,0.2); }
        .demo-body { padding: 20px 24px; }
        .demo-skin-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .demo-skin-chip { padding: 5px 12px; border-radius: 20px; background: var(--surface2); border: 1px solid var(--border); font-size: 11px; color: var(--cream-muted); }
        .demo-products { display: flex; flex-direction: column; gap: 10px; }
        .demo-product { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; }
        .demo-product.top { border-color: var(--gold); background: linear-gradient(135deg, var(--surface2), #1E1C12); }
        .demo-product-swatch { width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; }
        .demo-product-info { flex: 1; }
        .demo-product-brand { font-size: 10px; color: var(--gold); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 2px; }
        .demo-product-name { font-size: 13px; color: var(--cream); margin-bottom: 4px; }
        .demo-product-tags { display: flex; gap: 5px; }
        .demo-tag { font-size: 10px; padding: 2px 7px; border-radius: 10px; background: var(--surface3); color: var(--cream-faint); }
        .demo-score { font-size: 13px; font-weight: 700; flex-shrink: 0; }

        /* ── Stats ── */
        .stats-section { padding: 0 24px 80px; }
        .stats-grid { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .stat-item { background: var(--surface); padding: 32px 24px; text-align: center; }
        .stat-value { font-family: var(--serif); font-size: 42px; color: var(--gold); margin-bottom: 8px; line-height: 1; }
        .stat-label { font-size: 12px; color: var(--cream-faint); line-height: 1.4; }

        /* ── Section shared ── */
        .section { padding: 80px 24px; }
        .section-inner { max-width: 960px; margin: 0 auto; }
        .section-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
        .section-title { font-family: var(--serif); font-size: clamp(28px, 4vw, 42px); color: var(--cream); line-height: 1.15; margin-bottom: 16px; }
        .section-title em { font-style: italic; color: var(--gold); }
        .section-sub { font-size: 15px; color: var(--cream-muted); line-height: 1.6; max-width: 540px; }

        /* ── How it works ── */
        .hiw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-top: 48px; }
        .hiw-item { background: var(--surface); padding: 36px 32px; position: relative; }
        .hiw-step { font-size: 11px; color: var(--gold-muted); letter-spacing: 0.1em; margin-bottom: 16px; }
        .hiw-icon { font-size: 28px; color: var(--gold); margin-bottom: 16px; display: block; }
        .hiw-title { font-family: var(--serif); font-size: 20px; color: var(--cream); margin-bottom: 10px; }
        .hiw-body { font-size: 13px; color: var(--cream-faint); line-height: 1.65; }

        /* ── Features ── */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; }
        .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 28px 24px; transition: border-color 0.2s; }
        .feature-card:hover { border-color: var(--border-light); }
        .feature-icon { font-size: 22px; color: var(--gold); margin-bottom: 14px; display: block; }
        .feature-title { font-size: 15px; font-weight: 600; color: var(--cream); margin-bottom: 8px; }
        .feature-body { font-size: 13px; color: var(--cream-faint); line-height: 1.6; }

        /* ── Testimonials ── */
        .testimonials-section { padding: 80px 24px; background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .testimonial-card { max-width: 680px; margin: 48px auto 0; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; position: relative; transition: all 0.4s ease; }
        .testimonial-quote { font-size: 32px; color: var(--gold); opacity: 0.4; position: absolute; top: 28px; left: 36px; font-family: Georgia, serif; line-height: 1; }
        .testimonial-text { font-family: var(--serif); font-size: 18px; color: var(--cream); line-height: 1.6; margin-bottom: 24px; font-style: italic; padding-top: 20px; }
        .testimonial-product { font-size: 12px; color: var(--gold); padding: 6px 14px; background: var(--gold-light); border: 1px solid rgba(201,168,76,0.2); border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .testimonial-author { display: flex; align-items: center; justify-content: space-between; }
        .testimonial-name { font-size: 14px; font-weight: 600; color: var(--cream); }
        .testimonial-meta { font-size: 12px; color: var(--cream-faint); margin-top: 2px; }
        .testimonial-score { font-size: 13px; color: var(--green); font-weight: 700; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); padding: 4px 10px; border-radius: 20px; }
        .testimonial-dots { display: flex; justify-content: center; gap: 7px; margin-top: 24px; }
        .t-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); cursor: pointer; transition: all 0.2s; }
        .t-dot.on { background: var(--gold); width: 20px; border-radius: 3px; }

        /* ── CTA section ── */
        .cta-section { padding: 100px 24px; text-align: center; position: relative; overflow: hidden; }
        .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 500px; height: 300px; background: radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%); pointer-events: none; }
        .cta-title { font-family: var(--serif); font-size: clamp(32px, 5vw, 54px); color: var(--cream); line-height: 1.1; margin-bottom: 16px; }
        .cta-title em { font-style: italic; color: var(--gold); }
        .cta-sub { font-size: 16px; color: var(--cream-muted); margin-bottom: 36px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.6; }

        /* ── Footer ── */
        .footer { border-top: 1px solid var(--border); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: var(--serif); font-size: 15px; color: var(--cream); display: flex; align-items: center; gap: 8px; opacity: 0.7; }
        .footer-links { display: flex; gap: 24px; }
        .footer-link { font-size: 12px; color: var(--cream-faint); cursor: pointer; transition: color 0.15s; }
        .footer-link:hover { color: var(--cream-muted); }
        .footer-copy { font-size: 11px; color: var(--cream-faintest); }

        /* Divider */
        .divider { height: 1px; background: var(--border); max-width: 960px; margin: 0 auto; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .hiw-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-primary, .btn-ghost { width: 100%; text-align: center; }
          .footer { padding: 24px 20px; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-dot" />
          Before You Buy
        </div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</span>
          <span className="nav-link" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}>Reviews</span>
        </div>
        <button className="nav-cta" onClick={() => router.push("/find")}>
          Analyse my skin →
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          AI-powered · Brand neutral · Ingredient-matched
        </div>
        <h1 className="hero-title">
          Stop guessing.<br />
          Buy skincare that <em>actually fits</em><br />
          your skin.
        </h1>
        <p className="hero-sub">
          Upload a selfie. Tell us what you need. Get a ranked catalog of products matched to your exact skin profile — not your skin type. Not the brand's recommendation. Yours.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => router.push("/find")}>
            Find my products →
          </button>
          <button className="btn-ghost" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
            See how it works
          </button>
        </div>
        <div className="hero-trust">
          <div className="trust-item"><span className="trust-icon">◎</span> AI face analysis</div>
          <div className="trust-item"><span className="trust-icon">⚗</span> Ingredient-level matching</div>
          <div className="trust-item"><span className="trust-icon">◇</span> No paid placements</div>
          <div className="trust-item"><span className="trust-icon">●</span> Works for all skin tones</div>
        </div>
      </section>

      {/* Demo card */}
      <section className="demo-section">
        <div className="demo-card">
          <div className="demo-top">
            <div className="demo-top-title">Your skin analysis</div>
            <div className="demo-badge">Live example</div>
          </div>
          <div className="demo-body">
            <div className="demo-skin-row">
              {["Combination skin", "Mild acne", "Hyperpigmentation", "Medium-warm tone", "Moderate sensitivity"].map(c => (
                <div key={c} className="demo-skin-chip">{c}</div>
              ))}
            </div>
            <div className="demo-products">
              {[
                { brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", color: "#E8EEE4", score: 94, tags: ["Frag-free", "Vegan", "₹599"], top: true },
                { brand: "Minimalist", name: "Alpha Arbutin 2% + HA", color: "#EAE4F0", score: 88, tags: ["Frag-free", "₹449"], top: false },
                { brand: "Dot & Key", name: "Waterlight Gel Moisturiser", color: "#E4EEF0", score: 82, tags: ["Oil-free", "₹595"], top: false },
              ].map((p, i) => (
                <div key={i} className={`demo-product ${p.top ? "top" : ""}`}>
                  <div className="demo-product-swatch" style={{ background: p.color }} />
                  <div className="demo-product-info">
                    <div className="demo-product-brand">{p.brand}</div>
                    <div className="demo-product-name">{p.name}</div>
                    <div className="demo-product-tags">
                      {p.tags.map(t => <span key={t} className="demo-tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="demo-score" style={{ color: p.score >= 90 ? "#4ADE80" : p.score >= 80 ? "#C9A84C" : "#B8B0A4" }}>
                    {p.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how">
        <div className="section-inner">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-title">Three steps.<br /><em>One honest answer.</em></h2>
          <p className="section-sub">No quiz with 40 questions. No skin type dropdown. Just your face, your needs, and the right products.</p>
          <div className="hiw-grid">
            {HOW_IT_WORKS.map(h => (
              <div key={h.step} className="hiw-item">
                <div className="hiw-step">{h.step}</div>
                <span className="hiw-icon">{h.icon}</span>
                <div className="hiw-title">{h.title}</div>
                <p className="hiw-body">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Features */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-eyebrow">Why it's different</div>
          <h2 className="section-title">Built for how skin<br /><em>actually works.</em></h2>
          <p className="section-sub">Most recommendation tools match products to skin type labels. We match ingredients to skin conditions, concerns, and constraints.</p>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <p className="feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="reviews">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="section-eyebrow" style={{ textAlign: "center" }}>Real results</div>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: 0 }}>
            What people found<br /><em>when they stopped guessing.</em>
          </h2>
        </div>
        <div className="testimonial-card">
          <div className="testimonial-quote">"</div>
          <p className="testimonial-text">{TESTIMONIALS[activeTestimonial].text}</p>
          <div className="testimonial-product">{TESTIMONIALS[activeTestimonial].product}</div>
          <div className="testimonial-author">
            <div>
              <div className="testimonial-name">{TESTIMONIALS[activeTestimonial].name}</div>
              <div className="testimonial-meta">{TESTIMONIALS[activeTestimonial].location} · Concern: {TESTIMONIALS[activeTestimonial].concern}</div>
            </div>
            <div className="testimonial-score">Match score: {TESTIMONIALS[activeTestimonial].score}%</div>
          </div>
        </div>
        <div className="testimonial-dots">
          {TESTIMONIALS.map((_, i) => (
            <div key={i} className={`t-dot ${i === activeTestimonial ? "on" : ""}`} onClick={() => setActiveTestimonial(i)} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="section-eyebrow">Get started — it's free</div>
        <h2 className="cta-title">
          Your skin deserves<br />
          <em>an honest answer.</em>
        </h2>
        <p className="cta-sub">
          Upload a selfie, tell us what you're looking for, and get a ranked catalog of products built for your skin — not everyone's.
        </p>
        <button className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }} onClick={() => router.push("/find")}>
          Analyse my skin — free →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="nav-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
          Before You Buy
        </div>
        <div className="footer-links">
          <span className="footer-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</span>
          <span className="footer-link" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</span>
          <span className="footer-link" onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}>Reviews</span>
          <span className="footer-link" onClick={() => router.push("/find")}>Get started</span>
        </div>
        <div className="footer-copy">© 2026 Before You Buy · For informational use only</div>
      </footer>
    </>
  );
}