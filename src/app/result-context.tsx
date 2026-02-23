"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------
 * SkinAnalysis — matches the new dermatologist prompt output exactly
 * ------------------------------------------------------------------ */
export type SkinAnalysis = {
  primary_skin_pattern: string;
  skin_type: "oily" | "dry" | "combination" | "normal" | "sensitive-reactive";
  sebum_distribution: { t_zone: string; cheeks: string };
  hydration_appearance: string;
  barrier_integrity: "intact" | "mildly-compromised" | "significantly-compromised";

  active_acne: {
    open_comedones: number;
    closed_comedones: number;
    papules: number;
    pustules: number;
    nodules_cysts: number;
    severity: "none" | "mild" | "moderate" | "severe";
    distribution: string[];
  };
  acne_sequelae: {
    pie_red_marks: string;
    pih_brown_marks: string;
    atrophic_scarring: { present: boolean; types: string[] };
  };

  hyperpigmentation: { level: string; pattern: string[]; distribution: string[] };
  vascularity: {
    erythema_level: string;
    distribution: string[];
    telangiectasia: string;
    rosacea_like_pattern: string;
  };

  pore_visibility: { level: string; locations: string[] };
  texture: string;
  visible_aging: "none" | "mild" | "moderate";

  apparent_skin_tone: { ita_category: string; descriptive: string; undertone: string };
  estimated_fitzpatrick: { range: string; confidence: string; caveat: string };

  sensitivity_level: "low" | "moderate" | "high";
  tolerance_for_strong_actives: "low" | "moderate" | "high";

  treatment_priorities: string[];
  ingredient_categories_to_prioritize: string[];
  ingredients_to_avoid_or_use_with_caution: string[];
  vehicle_recommendation: string;
  spf_recommendation: string;

  confidence_score: number;
  limitations: string;
};

export type ProductRecommendation = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_inr: number;
  price_usd: number;
  match_score: number;
  match_reasons: string[];
  key_ingredients: string[];
  avoid_if: string[];
  texture: string;
  fragrance_free: boolean;
  cruelty_free: boolean;
  vegan: boolean;
  links: { nykaa?: string; sephora?: string; amazon?: string; brand?: string };
  image_placeholder_color: string;
  explanation: string;
};

export type SkinProfile = {
  primary_concern: string;
  product_category: string;
  budget: "budget" | "mid" | "premium" | "luxury";
  known_allergies: string;
  pregnancy_safe: boolean;
  fragrance_free: boolean;
  vegan_only: boolean;
};

/* ------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------ */
type ResultContextValue = {
  skinProfile: SkinProfile | null;
  setSkinProfile: (p: SkinProfile | null) => void;
  skinAnalysis: SkinAnalysis | null;
  setSkinAnalysis: (a: SkinAnalysis | null) => void;
  recommendations: ProductRecommendation[];
  setRecommendations: (r: ProductRecommendation[]) => void;
  uploadedImageBase64: string | null;
  setUploadedImageBase64: (img: string | null) => void;
};

const ResultContext = createContext<ResultContextValue | null>(null);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [skinProfile, setSkinProfile] = useState<SkinProfile | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<SkinAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);

  return (
    <ResultContext.Provider value={{
      skinProfile, setSkinProfile,
      skinAnalysis, setSkinAnalysis,
      recommendations, setRecommendations,
      uploadedImageBase64, setUploadedImageBase64,
    }}>
      {children}
    </ResultContext.Provider>
  );
}

export function useResult() {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error("useResult must be used within ResultProvider");
  return ctx;
}