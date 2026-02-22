"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    name: "Priya M.",
    location: "Mumbai",
    concern: "Acne & dark spots",
    text: "I'd spent ₹8,000 on products that made my skin worse. Before You Buy analysed my photo and flagged that my moisturiser had fragrance — the exact thing causing my breakouts. Found a better one for ₹450.",
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
    concern: "Oily skin & pores",
    text: "I thought I needed an expensive pore-minimising serum. Turns out niacinamide at 10% — available for ₹599 — does the same job. The match score explanation made complete sense once I understood why.",
    product: "Switched to: The Ordinary Niacinamide 10%",
    score: 89,
  },
  {
    name: "Fatima K.",
    location: "Hyderabad",
    concern: "Eczema-prone skin",
    text: "Finding fragrance-free, barrier-friendly products used to take hours of research. This tool filtered exactly for my needs in seconds and explained why each ingredient was or wasn't suitable.",
    product: "Now using: CeraVe Moisturising Cream",
    score: 97,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "◎",
    title: "Upload a selfie",
    body: "Our AI vision model analyses your skin — detecting skin type, oiliness, acne severity, pigmentation, sensitivity, and tone. No makeup. Just your skin.",
  },
  {
    step: "02",
    icon: "◑",
    title: "Tell us what you need",
    body: "Pick your top concerns and the type of product you want — cleanser, serum, moisturiser, SPF, and more. Set your budget and any hard requirements.",
  },
  {
    step: "03",
    icon: "✦",
    title: "Get your ranked catalog",
    body: "We match your skin profile against products ingredient-by-ingredient and rank them by fit score. Every pick explains exactly why it suits your skin.",
  },
];

const FEATURES = [
  { icon: "◎", title: "AI skin analysis", body: "GPT-4o Vision reads oiliness, acne, pigmentation, sensitivity, and tone from your photo — the same attributes a dermatologist would assess at first glance." },
  { icon: "⚗", title: "Ingredient-level matching", body: "We don't match by skin type alone. We match by what your specific concerns need, what ingredients deliver that, and whether the formulation suits your skin." },
  { icon: "◇", title: "No brand bias", body: "We have no commercial relationship with any brand. A ₹400 drugstore product will outrank a ₹4,000 premium one if it's better for your skin." },
  { icon: "◐", title: "Condition-aware filtering", body: "Eczema, rosacea, pregnancy, fragrance sensitivity — the engine accounts for conditions that change which ingredients are appropriate, not just skin type." },
  { icon: "⊙", title: "Budget-conscious", body: "Set your ceiling. We surface the best options within it — from drugstore to luxury — ranked purely by how well they match your skin, not price." },
  { icon: "●", title: "Explainable results", body: "Every recommendation shows exactly why it ranked where it did. Match reasons, key ingredients, and cautions — so you understand, not just trust." },
];

const STATS = [
  { value: "6", label: "Products compared per search" },
  { value: "2", label: "AI calls per analysis" },
  { value: "8", label: "Product categories" },
  { value: "0", label: "Paid brand placements" },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0D0D0B;
          --bg2: #111110;
          --surface: #1C1C18;
          --surface2: #242420;
          --surface3: #2E2E28;
          --border: #2E2E28;
          --border-light: #3A3A34;
          --gold: #C9A84C;
          --gold-hover: #D4B05A;
          --gold-muted: #A8884A;
          --gold-light: rgba(201,168,76,0.1);
          --cream: #F2EDE4;
          --cream-muted: #B8B0A4;
          --cream-faint: #7A7570;
          --cream-faintest: #5A5550;
          --green: #4ADE80;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Syne', system-ui, sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--cream); font-family: var(--sans); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

        /* ── Nav ── */
        .nav {
          padding: 16px 40px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(13,13,11,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .nav-logo { font-family: var(--serif); font-size: 16px; color: var(--cream); display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 2.5s ease infinite; flex-shrink: 0; }
        .nav-links { display: flex; align-items: center; gap: 24px; }
        .nav-link { font-size: 13px; color: var(--cream-muted); cursor: pointer; transition: color 0.15s; background: none; border: none; font-family: var(--sans); }
        .nav-link:hover { color: var(--cream); }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-cta { padding: 8px 18px; background: var(--gold); color: var(--bg); border: none; border-radius: 8px; font-family: var(--sans); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .nav-cta:hover { background: var(--gold-hover); }
        .hamburger { display: none; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 6px 9px; cursor: pointer; color: var(--cream-muted); font-size: 16px; line-height: 1; }

        /* Mobile menu */
        .mobile-menu { display: none; position: fixed; top: 57px; left: 0; right: 0; background: rgba(13,13,11,0.97); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 16px 24px 20px; z-index: 99; flex-direction: column; gap: 4px; }
        .mobile-menu.open { display: flex; }
        .mobile-link { font-size: 15px; color: var(--cream-muted); padding: 10px 0; border-bottom: 1px solid var(--border); background: none; border-left: none; border-right: none; border-top: none; font-family: var(--sans); cursor: pointer; text-align: left; }
        .mobile-link:last-child { border-bottom: none; }
        .mobile-cta { margin-top: 8px; padding: 12px; background: var(--gold); color: var(--bg); border: none; border-radius: 10px; font-family: var(--sans); font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; }

        /* ── Hero ── */
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px 60px; text-align: center; position: relative; overflow: hidden; }
        .hero-glow { position: absolute; top: 30%; left: 50%; transform: translateX(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%); pointer-events: none; }
        .hero-badge { display: inline-flex; align-items: center; gap: 7px; padding: 5px 14px; border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; background: var(--gold-light); font-size: 11px; color: var(--gold); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 24px; animation: fadeUp 0.5s ease both; }
        .hero-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: pulse 1.5s ease infinite; flex-shrink: 0; }
        .hero-title { font-family: var(--serif); font-size: clamp(34px, 7vw, 68px); line-height: 1.08; letter-spacing: -0.02em; color: var(--cream); margin-bottom: 20px; max-width: 780px; animation: fadeUp 0.5s ease 0.1s both; }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-sub { font-size: clamp(14px, 2vw, 17px); color: var(--cream-muted); line-height: 1.65; max-width: 500px; margin-bottom: 36px; animation: fadeUp 0.5s ease 0.2s both; }
        .hero-actions { display: flex; align-items: center; gap: 12px; animation: fadeUp 0.5s ease 0.3s both; flex-wrap: wrap; justify-content: center; }
        .btn-primary { padding: 14px 28px; background: var(--gold); color: var(--bg); border: none; border-radius: 10px; font-family: var(--sans); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
        .btn-primary:hover { background: var(--gold-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.2); }
        .btn-ghost { padding: 14px 22px; background: none; color: var(--cream-muted); border: 1px solid var(--border); border-radius: 10px; font-family: var(--sans); font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .btn-ghost:hover { border-color: var(--border-light); color: var(--cream); }
        .hero-trust { display: flex; align-items: center; gap: 16px; margin-top: 44px; padding-top: 28px; border-top: 1px solid var(--border); animation: fadeUp 0.5s ease 0.4s both; flex-wrap: wrap; justify-content: center; }
        .trust-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--cream-muted); }
        .trust-icon { color: var(--gold); font-size: 12px; }

        /* ── Demo card ── */
        .demo-section { padding: 60px 20px; display: flex; justify-content: center; }
        .demo-card { max-width: 640px; width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; animation: float 6s ease infinite; }
        .demo-top { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .demo-top-title { font-family: var(--serif); font-size: 14px; color: var(--cream); }
        .demo-badge { font-size: 10px; padding: 3px 10px; border-radius: 20px; background: var(--gold-light); color: var(--gold); border: 1px solid rgba(201,168,76,0.25); }
        .demo-body { padding: 18px 20px; }
        .demo-skin-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .demo-skin-chip { padding: 4px 11px; border-radius: 20px; background: var(--surface2); border: 1px solid var(--border); font-size: 11px; color: var(--cream-muted); }
        .demo-products { display: flex; flex-direction: column; gap: 8px; }
        .demo-product { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
        .demo-product.top { border-color: var(--gold); background: linear-gradient(135deg, var(--surface2), #1E1C12); }
        .demo-swatch { width: 36px; height: 36px; border-radius: 7px; flex-shrink: 0; }
        .demo-info { flex: 1; min-width: 0; }
        .demo-brand { font-size: 10px; color: var(--gold); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 1px; }
        .demo-name { font-size: 12px; color: var(--cream); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .demo-tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .demo-tag { font-size: 10px; padding: 2px 6px; border-radius: 8px; background: var(--surface3); color: var(--cream-muted); }
        .demo-score { font-size: 13px; font-weight: 700; flex-shrink: 0; }

        /* ── Stats ── */
        .stats-section { padding: 0 20px 60px; }
        .stats-grid { max-width: 860px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .stat-item { background: var(--surface); padding: 28px 20px; text-align: center; }
        .stat-value { font-family: var(--serif); font-size: 40px; color: var(--gold); margin-bottom: 6px; line-height: 1; }
        .stat-label { font-size: 12px; color: var(--cream-muted); line-height: 1.4; }

        /* ── Sections ── */
        .section { padding: 72px 20px; }
        .section-inner { max-width: 920px; margin: 0 auto; }
        .section-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
        .section-title { font-family: var(--serif); font-size: clamp(26px, 4vw, 40px); color: var(--cream); line-height: 1.15; margin-bottom: 14px; }
        .section-title em { font-style: italic; color: var(--gold); }
        .section-sub { font-size: 15px; color: var(--cream-muted); line-height: 1.65; max-width: 520px; }

        /* ── How it works ── */
        .hiw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--border); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-top: 40px; }
        .hiw-item { background: var(--surface); padding: 32px 28px; }
        .hiw-step { font-size: 11px; color: var(--gold-muted); letter-spacing: 0.1em; margin-bottom: 14px; }
        .hiw-icon { font-size: 26px; color: var(--gold); margin-bottom: 14px; display: block; }
        .hiw-title { font-family: var(--serif); font-size: 19px; color: var(--cream); margin-bottom: 10px; }
        .hiw-body { font-size: 13px; color: var(--cream-muted); line-height: 1.65; }

        /* ── Features ── */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 40px; }
        .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px 20px; transition: border-color 0.2s; }
        .feature-card:hover { border-color: var(--border-light); }
        .feature-icon { font-size: 20px; color: var(--gold); margin-bottom: 12px; display: block; }
        .feature-title { font-size: 14px; font-weight: 600; color: var(--cream); margin-bottom: 7px; }
        .feature-body { font-size: 13px; color: var(--cream-muted); line-height: 1.6; }

        /* ── Testimonials ── */
        .testimonials-section { padding: 72px 20px; background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .testimonials-inner { max-width: 920px; margin: 0 auto; }
        .testimonial-card { max-width: 640px; margin: 40px auto 0; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 32px; position: relative; }
        .testimonial-quote { font-size: 48px; color: var(--gold); opacity: 0.25; position: absolute; top: 20px; left: 28px; font-family: Georgia, serif; line-height: 1; }
        .testimonial-text { font-family: var(--serif); font-size: clamp(15px, 2.5vw, 17px); color: var(--cream); line-height: 1.65; margin-bottom: 20px; font-style: italic; padding-top: 24px; }
        .testimonial-product { font-size: 11px; color: var(--gold); padding: 5px 12px; background: var(--gold-light); border: 1px solid rgba(201,168,76,0.2); border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .testimonial-author { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .testimonial-name { font-size: 13px; font-weight: 600; color: var(--cream); }
        .testimonial-meta { font-size: 11px; color: var(--cream-muted); margin-top: 2px; }
        .testimonial-score { font-size: 12px; color: var(--green); font-weight: 700; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); padding: 4px 10px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
        .t-dots { display: flex; justify-content: center; gap: 7px; margin-top: 20px; }
        .t-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); cursor: pointer; transition: all 0.2s; }
        .t-dot.on { background: var(--gold); width: 20px; border-radius: 3px; }

        /* ── CTA ── */
        .cta-section { padding: 90px 20px; text-align: center; position: relative; overflow: hidden; }
        .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 480px; height: 280px; background: radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%); pointer-events: none; }
        .cta-title { font-family: var(--serif); font-size: clamp(28px, 5vw, 50px); color: var(--cream); line-height: 1.1; margin-bottom: 14px; }
        .cta-title em { font-style: italic; color: var(--gold); }
        .cta-sub { font-size: 15px; color: var(--cream-muted); margin-bottom: 32px; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.65; }

        /* ── Footer ── */
        .footer { border-top: 1px solid var(--border); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-logo { font-family: var(--serif); font-size: 14px; color: var(--cream-muted); display: flex; align-items: center; gap: 7px; }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-link { font-size: 12px; color: var(--cream-faint); cursor: pointer; transition: color 0.15s; background: none; border: none; font-family: var(--sans); }
        .footer-link:hover { color: var(--cream-muted); }
        .footer-copy { font-size: 11px; color: var(--cream-faintest); }
        .divider { height: 1px; background: var(--border); max-width: 920px; margin: 0 auto; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav { padding: 14px 20px; }
          .nav-links { display: none; }
          .hamburger { display: block; }
          .hero { padding: 90px 20px 48px; }
          .hiw-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .footer { padding: 20px; flex-direction: column; align-items: flex-start; gap: 16px; }
          .testimonial-card { padding: 24px 20px; }
          .testimonial-quote { font-size: 36px; top: 14px; left: 18px; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-primary, .btn-ghost { width: 100%; text-align: center; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-value { font-size: 32px; }
          .section { padding: 52px 20px; }
          .hiw-item { padding: 24px 20px; }
          .feature-card { padding: 20px 16px; }
        }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-dot" />
          Before You Buy
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo("how")}>How it works</button>
          <button className="nav-link" onClick={() => scrollTo("features")}>Features</button>
          <button className="nav-link" onClick={() => scrollTo("reviews")}>Reviews</button>
        </div>
        <div className="nav-right">
          <button className="nav-cta" onClick={() => router.push("/find")}>Analyse my skin →</button>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="mobile-link" onClick={() => scrollTo("how")}>How it works</button>
        <button className="mobile-link" onClick={() => scrollTo("features")}>Features</button>
        <button className="mobile-link" onClick={() => scrollTo("reviews")}>Reviews</button>
        <button className="mobile-cta" onClick={() => { setMenuOpen(false); router.push("/find"); }}>Analyse my skin →</button>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          AI-powered · Brand neutral · Ingredient-matched
        </div>
        <h1 className="hero-title">
          Stop guessing.<br />
          Buy skincare that <em>actually fits</em> your skin.
        </h1>
        <p className="hero-sub">
          Upload a selfie. Tell us what you need. Get a ranked catalog of products matched to your exact skin profile — not your skin type. Not the brand's recommendation. Yours.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => router.push("/find")}>Find my products →</button>
          <button className="btn-ghost" onClick={() => scrollTo("how")}>See how it works</button>
        </div>
        <div className="hero-trust">
          <div className="trust-item"><span className="trust-icon">◎</span> AI face analysis</div>
          <div className="trust-item"><span className="trust-icon">⚗</span> Ingredient-level matching</div>
          <div className="trust-item"><span className="trust-icon">◇</span> No paid placements</div>
          <div className="trust-item"><span className="trust-icon">●</span> All skin tones</div>
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
                { brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", color: "#DDE8D8", score: 94, tags: ["Frag-free", "Vegan", "₹599"], top: true },
                { brand: "Minimalist", name: "Alpha Arbutin 2% + HA", color: "#DDD8EA", score: 88, tags: ["Frag-free", "₹449"], top: false },
                { brand: "Dot & Key", name: "Waterlight Gel Moisturiser", color: "#D8E4EA", score: 82, tags: ["Oil-free", "₹595"], top: false },
              ].map((p, i) => (
                <div key={i} className={`demo-product ${p.top ? "top" : ""}`}>
                  <div className="demo-swatch" style={{ background: p.color }} />
                  <div className="demo-info">
                    <div className="demo-brand">{p.brand}</div>
                    <div className="demo-name">{p.name}</div>
                    <div className="demo-tags">
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
          <p className="section-sub">Most tools match products to skin type labels. We match ingredients to skin conditions, concerns, and constraints.</p>
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
        <div className="testimonials-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>Real results</div>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: 0 }}>
            What people found<br /><em>when they stopped guessing.</em>
          </h2>
          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">{TESTIMONIALS[activeTestimonial].text}</p>
            <div className="testimonial-product">{TESTIMONIALS[activeTestimonial].product}</div>
            <div className="testimonial-author">
              <div>
                <div className="testimonial-name">{TESTIMONIALS[activeTestimonial].name}</div>
                <div className="testimonial-meta">{TESTIMONIALS[activeTestimonial].location} · {TESTIMONIALS[activeTestimonial].concern}</div>
              </div>
              <div className="testimonial-score">Match: {TESTIMONIALS[activeTestimonial].score}%</div>
            </div>
          </div>
          <div className="t-dots">
            {TESTIMONIALS.map((_, i) => (
              <div key={i} className={`t-dot ${i === activeTestimonial ? "on" : ""}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="section-eyebrow">Get started — it's free</div>
        <h2 className="cta-title">Your skin deserves<br /><em>an honest answer.</em></h2>
        <p className="cta-sub">Upload a selfie, tell us what you're looking for, and get a ranked catalog built for your skin — not everyone's.</p>
        <button className="btn-primary" style={{ fontSize: 15, padding: "14px 32px" }} onClick={() => router.push("/find")}>
          Analyse my skin — free →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
          Before You Buy
        </div>
        <div className="footer-links">
          <button className="footer-link" onClick={() => scrollTo("how")}>How it works</button>
          <button className="footer-link" onClick={() => scrollTo("features")}>Features</button>
          <button className="footer-link" onClick={() => scrollTo("reviews")}>Reviews</button>
          <button className="footer-link" onClick={() => router.push("/find")}>Get started</button>
        </div>
        <div className="footer-copy">© 2026 Before You Buy · For informational use only</div>
      </footer>
    </>
  );
}