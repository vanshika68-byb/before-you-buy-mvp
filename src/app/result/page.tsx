"use client";

import { useResult } from "../result-context";

export default function Result() {
  const { result } = useResult();

  if (result?.status === "avoid") {
    const conditions =
      result.avoid_conditions && result.avoid_conditions.length > 0
        ? result.avoid_conditions
        : ["[Placeholder condition]", "[Placeholder condition]"];

    return (
      <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
          You should probably avoid this if…
        </h1>

        <ul style={{ paddingLeft: 20, marginBottom: 16, lineHeight: 1.6 }}>
          {conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
          Why this can go wrong
        </h2>
        <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
          {result.explanation || "[Placeholder explanation]"}
        </p>

        <p>
          <strong>Confidence:</strong>{" "}
          {result.confidence || "High"}
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
        We don&apos;t know yet
      </h1>
      <p style={{ lineHeight: 1.5 }}>
        We weren&apos;t able to analyze this product. This is placeholder
        behavior until analysis is implemented.
      </p>
    </main>
  );
}


