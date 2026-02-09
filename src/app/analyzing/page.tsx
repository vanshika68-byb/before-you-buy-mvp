"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Analyzing() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push("/result");
    }, 2500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
        Analyzing this product
      </h1>
      <p style={{ lineHeight: 1.5 }}>
        Checking ingredient interactions and common failure patterns...
      </p>
    </main>
  );
}

