"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Extraction = {
  ingredients: string[];
  detected_actives: string[];
  concentration_clues: string;
  usage_instructions: string;
};

export type RiskAssessment = {
  avoid_if: string[];
  risk_reasons: string[];
  confidence_level: "low" | "medium" | "high";
  confidence_reason: string;
  disclaimer: string;
};

type ResultContextValue = {
  extraction: Extraction | null;
  setExtraction: (value: Extraction | null) => void;
  riskAssessment: RiskAssessment | null;
  setRiskAssessment: (value: RiskAssessment | null) => void;
  submittedUrl: string | null;
  setSubmittedUrl: (value: string | null) => void;
  productName: string | null;
  setProductName: (value: string | null) => void;
};

const ResultContext = createContext<ResultContextValue | undefined>(undefined);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  return (
    <ResultContext.Provider
      value={{
        extraction,
        setExtraction,
        riskAssessment,
        setRiskAssessment,
        submittedUrl,
        setSubmittedUrl,
        productName,
        setProductName,
      }}
    >
      {children}
    </ResultContext.Provider>
  );
}

export function useResult() {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResult must be used within a ResultProvider");
  }
  return context;
}

