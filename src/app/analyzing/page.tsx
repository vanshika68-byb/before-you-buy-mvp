"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResult } from "../result-context";

const STAGES = [
  { id: "reading", label: "Reading your skin", sub: "Analysing face image with AI vision", duration: 4000 },
  { id: "mapping", label: "Mapping skin conditions", sub: "Identifying concerns, tone & texture", duration: 3000 },
  { id: "profiling", label: "Building your skin profile", sub: "Cross-referencing with your concerns", duration: 2500 },
  { id: "searching", label: "Searching product database", sub: "Matching ingredients to your profile", duration: 3500 },
  { id: "ranking", label: "Ranking by fit score", sub: "Filtering for budget, preferences & safety", duration: 2000 },
  { id: "building", label: "Finalising your results", sub: "Preparing your personalised catalog", duration: 2000 },
];

export default function Analysing() {
  const router = useRouter();
  const { skinProfile, uploadedImageBase64, setSkinAnalysis, setRecommendations } = useResult();
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Animate through stages while API runs
  useEffect(() => {
    let stageIndex = 0;
    let elapsed = 0;
    const totalDuration = STAGES.reduce((s, st) => s + st.duration, 0);
    let animFrame: number;
    let start: number | null = null;
    const stageCumulative = STAGES.reduce<number[]>((acc, st, i) => {
      acc.push((acc[i - 1] || 0) + st.duration);
      return acc;
    }, []);

    const tick = (ts: number) => {
      if (!start) start = ts;
      elapsed = ts - start;
      const clampedElapsed = Math.min(elapsed, totalDuration * 0.95);
      setProgress((clampedElapsed / totalDuration) * 100);

      let newStage = 0;
      for (let i = 0; i < stageCumulative.length; i++) {
        if (clampedElapsed >= stageCumulative[i]) newStage = i + 1;
      }
      setCurrentStage(Math.min(newStage, STAGES.length - 1));

      if (elapsed < totalDuration * 0.95) {
        animFrame = requestAnimationFrame(tick);
      }
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // API call
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!skinProfile || !uploadedImageBase64) {
      router.replace("/");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: uploadedImageBase64,
            skin_profile: skinProfile,
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        setSkinAnalysis(data.skin_analysis);
        setRecommendations(data.recommendations);

        // Hold on the last stage briefly then navigate
        setTimeout(() => {
          setProgress(100);
          setTimeout(() => router.push("/result"), 600);
        }, 800);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    };

    run();
  }, [skinProfile, uploadedImageBase64, router, setSkinAnalysis, setRecommendations]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Syne:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0D0D0B;
          --surface: #1C1C18;
          --border: #2E2E28;
          --gold: #C9A84C;
          --gold-light: rgba(201,168,76,0.12);
          --cream: #F2EDE4;
          --cream-muted: #B8B0A4;
          --cream-faint: #6B6560;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Syne', system-ui, sans-serif;
        }
        html, body { background: var(--bg); color: var(--cream); font-family: var(--sans); min-height: 100vh; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(201,168,76,0.2); } 50% { box-shadow: 0 0 40px rgba(201,168,76,0.4); } }

        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; }

        .logo { font-family: var(--serif); font-size: 15px; color: var(--cream); display: flex; align-items: center; gap: 7px; margin-bottom: 64px; opacity: 0.6; }
        .logo-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }

        .spinner-wrap { margin-bottom: 48px; position: relative; width: 72px; height: 72px; }
        .spinner-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1.5px solid transparent;
          border-top-color: var(--gold);
          animation: spin 1.2s linear infinite;
        }
        .spinner-ring-2 {
          position: absolute; inset: 8px;
          border-radius: 50%;
          border: 1px solid transparent;
          border-top-color: rgba(201,168,76,0.4);
          animation: spin 1.8s linear infinite reverse;
        }
        .spinner-center {
          position: absolute; inset: 20px;
          border-radius: 50%;
          background: var(--gold-light);
          animation: glow 2s ease infinite;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        .stage-label { font-family: var(--serif); font-size: 22px; color: var(--cream); text-align: center; margin-bottom: 8px; min-height: 32px; animation: fadeUp 0.3s ease both; }
        .stage-sub { font-size: 13px; color: var(--cream-faint); text-align: center; margin-bottom: 40px; min-height: 20px; }

        /* Progress bar */
        .progress-wrap { width: 320px; max-width: 100%; }
        .progress-track { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 8px; }
        .progress-fill { height: 100%; background: var(--gold); border-radius: 2px; transition: width 0.3s ease; }
        .progress-pct { font-size: 11px; color: var(--cream-faint); text-align: right; }

        /* Stage list */
        .stages { margin-top: 40px; display: flex; flex-direction: column; gap: 12px; width: 320px; max-width: 100%; }
        .stage-item { display: flex; align-items: center; gap: 12px; opacity: 0.3; transition: opacity 0.4s ease; }
        .stage-item.done { opacity: 0.5; }
        .stage-item.active { opacity: 1; }
        .stage-item-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); flex-shrink: 0; transition: background 0.3s; }
        .stage-item.active .stage-item-dot { background: var(--gold); }
        .stage-item.done .stage-item-dot { background: var(--gold-muted); }
        .stage-item-text { font-size: 12px; color: var(--cream-muted); }
        .stage-item.active .stage-item-text { color: var(--cream); }

        .error-msg { color: #FCA5A5; font-size: 13px; text-align: center; margin-top: 24px; }
        .retry-btn { margin-top: 12px; background: none; border: 1px solid #FCA5A5; color: #FCA5A5; padding: 8px 20px; border-radius: 8px; font-family: var(--sans); font-size: 12px; cursor: pointer; }
      `}</style>

      <div className="page">
        <div className="logo">
          <div className="logo-dot" />
          Before You Buy
        </div>

        <div className="spinner-wrap">
          <div className="spinner-ring" />
          <div className="spinner-ring-2" />
          <div className="spinner-center">◎</div>
        </div>

        <div className="stage-label" key={currentStage}>
          {STAGES[currentStage]?.label}
        </div>
        <div className="stage-sub">{STAGES[currentStage]?.sub}</div>

        <div className="progress-wrap">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-pct">{Math.round(progress)}%</div>
        </div>

        <div className="stages">
          {STAGES.map((s, i) => (
            <div
              key={s.id}
              className={`stage-item ${i < currentStage ? "done" : i === currentStage ? "active" : ""}`}
            >
              <div className="stage-item-dot" />
              <span className="stage-item-text">{i < currentStage ? "✓ " : ""}{s.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <>
            <div className="error-msg">{error}</div>
            <button className="retry-btn" onClick={() => router.push("/")}>Start over</button>
          </>
        )}
      </div>
    </>
  );
}