"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type SkinAnalysis = {
  skin_type: "oily" | "dry" | "combination" | "sensitive" | "normal";
  concerns: string[];
  tone: string;
  acne_severity: "none" | "mild" | "moderate" | "severe";
  oiliness: "low" | "moderate" | "high";
  sensitivity: "low" | "moderate" | "high";
  hyperpigmentation: "none" | "mild" | "moderate" | "significant";
  visible_aging: "none" | "mild" | "moderate";
  summary: string;
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
  links: {
    nykaa?: string;
    sephora?: string;
    amazon?: string;
    brand?: string;
  };
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