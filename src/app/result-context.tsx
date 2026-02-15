"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ActiveIngredient = {
  name: string;
  function: string;
  concentration_estimate?: string;
};

export type IngredientInteraction = {
  ingredients: string[];
  interaction_type: "conflict" | "synergy" | "redundancy";
  explanation: string;
};

export type SkinTypeSuitability = {
  oily: "good" | "neutral" | "caution" | "avoid";
  dry: "good" | "neutral" | "caution" | "avoid";
  combination: "good" | "neutral" | "caution" | "avoid";
  sensitive: "good" | "neutral" | "caution" | "avoid";
  normal: "good" | "neutral" | "caution" | "avoid";
  reasoning: string;
};

export type Verdict = {
  signal: "green" | "yellow" | "red";
  headline: string;
  summary: string;
  personalized_note?: string;
};

export type Extraction = {
  ingredients: string[];
  detected_actives: ActiveIngredient[];
  concentration_clues: string;
  usage_instructions: string;
  ph_notes: string;
};

export type RiskAssessment = {
  avoid_if: string[];
  risk_reasons: string[];
  confidence_level: "low" | "medium" | "high";
  confidence_reason: string;
  disclaimer: string;
};

export type SkinProfile = {
  skin_type?: "oily" | "dry" | "combination" | "sensitive" | "normal";
  concerns?: string[];
  known_allergies?: string;
  current_routine?: string;
};

type ResultContextValue = {
  submittedUrl: string | null;
  setSubmittedUrl: (url: string | null) => void;
  productName: string | null;
  setProductName: (name: string | null) => void;
  productType: string | null;
  setProductType: (type: string | null) => void;
  productImageUrl: string | null;
  setProductImageUrl: (url: string | null) => void;
  extraction: Extraction | null;
  setExtraction: (e: Extraction | null) => void;
  riskAssessment: RiskAssessment | null;
  setRiskAssessment: (r: RiskAssessment | null) => void;
  verdict: Verdict | null;
  setVerdict: (v: Verdict | null) => void;
  skinTypeSuitability: SkinTypeSuitability | null;
  setSkinTypeSuitability: (s: SkinTypeSuitability | null) => void;
  ingredientInteractions: IngredientInteraction[];
  setIngredientInteractions: (i: IngredientInteraction[]) => void;
  whatThisProductDoes: string[];
  setWhatThisProductDoes: (w: string[]) => void;
  formulationStrengths: string[];
  setFormulationStrengths: (s: string[]) => void;
  formulationWeaknesses: string[];
  setFormulationWeaknesses: (s: string[]) => void;
  skinProfile: SkinProfile | null;
  setSkinProfile: (p: SkinProfile | null) => void;
};

const ResultContext = createContext<ResultContextValue | null>(null);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [skinTypeSuitability, setSkinTypeSuitability] = useState<SkinTypeSuitability | null>(null);
  const [ingredientInteractions, setIngredientInteractions] = useState<IngredientInteraction[]>([]);
  const [whatThisProductDoes, setWhatThisProductDoes] = useState<string[]>([]);
  const [formulationStrengths, setFormulationStrengths] = useState<string[]>([]);
  const [formulationWeaknesses, setFormulationWeaknesses] = useState<string[]>([]);
  const [skinProfile, setSkinProfile] = useState<SkinProfile | null>(null);

  return (
    <ResultContext.Provider
      value={{
        submittedUrl, setSubmittedUrl,
        productName, setProductName,
        productType, setProductType,
        productImageUrl, setProductImageUrl,
        extraction, setExtraction,
        riskAssessment, setRiskAssessment,
        verdict, setVerdict,
        skinTypeSuitability, setSkinTypeSuitability,
        ingredientInteractions, setIngredientInteractions,
        whatThisProductDoes, setWhatThisProductDoes,
        formulationStrengths, setFormulationStrengths,
        formulationWeaknesses, setFormulationWeaknesses,
        skinProfile, setSkinProfile,
      }}
    >
      {children}
    </ResultContext.Provider>
  );
}

export function useResult() {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error("useResult must be used within ResultProvider");
  return ctx;
}