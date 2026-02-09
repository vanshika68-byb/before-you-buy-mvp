"use client";

import type { ReactNode } from "react";
import { ResultProvider } from "./result-context";

export function ClientProviders({ children }: { children: ReactNode }) {
  return <ResultProvider>{children}</ResultProvider>;
}

