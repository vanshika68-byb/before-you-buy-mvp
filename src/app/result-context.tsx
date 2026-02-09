"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AnalyzeResult =
  | {
      status: "avoid";
      avoid_conditions: string[];
      explanation: string;
      confidence: string;
    }
  | {
      status: "unknown";
    };

type ResultContextValue = {
  result: AnalyzeResult | null;
  setResult: (value: AnalyzeResult | null) => void;
};

const ResultContext = createContext<ResultContextValue | undefined>(undefined);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  return (
    <ResultContext.Provider value={{ result, setResult }}>
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

