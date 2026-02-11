/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Extraction = {
  ingredients: string[];
  detected_actives: string[];
  concentration_clues: string;
  usage_instructions: string;
};

type FormulationDisclosures = {
  ph_disclosed: "yes" | "no" | "unknown";
  strength_disclosed: "yes" | "no" | "unknown";
};

/** Shape expected by the frontend — do NOT change. */
type RiskAssessment = {
  avoid_if: string[];
  risk_reasons: string[];
  confidence_level: "low" | "medium" | "high";
  confidence_reason: string;
  disclaimer: string;
};

/* ------------------------------------------------------------------ */
/*  Prompt constants                                                  */
/* ------------------------------------------------------------------ */

const EXTRACTION_SYSTEM_PROMPT =
  "You are a deterministic clinical information extraction engine. " +
  "You respond with valid JSON only. " +
  "Any text outside JSON will cause a system rejection.";

function buildExtractionUserPrompt(visibleText: string): string {
  return `You are a deterministic clinical information extraction engine.

Your task is to extract ONLY explicit, verifiable formulation facts from the provided product page text.

STRICT RULES:
- Do NOT infer.
- Do NOT summarize.
- Do NOT interpret marketing language.
- Do NOT assume concentrations.
- Do NOT guess active strength.
- Ignore testimonials and reviews.
- If information is not explicitly stated, return "unknown".
- If uncertain, return "unknown".

Return JSON ONLY in exactly this structure:

{
  "product_name": "Full product name including brand, variant, and size if available",
  "ingredients": ["string"],
  "detected_actives": ["Retinoid", "Vitamin C", "Niacinamide"],
  "concentration_clues": "string or unknown",
  "usage_instructions": "string or unknown",
  "formulation_disclosures": {
    "ph_disclosed": "yes | no | unknown",
    "strength_disclosed": "yes | no | unknown"
  }
}

Important constraints:
- detected_actives must ONLY include: Retinoid, Vitamin C, Niacinamide
- If none detected, return empty array.
- Use exact ingredient spellings from text.
- product_name: extract the full product name as shown on the page (brand + product line + variant + size). Do NOT abbreviate. If not visible, return "unknown".
- If your output contains any text outside valid JSON, the system will reject it.

Text:
${visibleText}`;
}

const RISK_SYSTEM_PROMPT =
  "You are a deterministic dermatology safety heuristic engine. " +
  "You respond with valid JSON only. " +
  "Any text outside JSON will cause a system rejection.";

function buildRiskUserPrompt(extractionData: Extraction & { formulation_disclosures?: FormulationDisclosures }): string {
  return `You are applying conservative dermatology safety heuristics to a skincare formulation.

Your role:
- NOT to recommend products
- NOT to optimize outcomes
- NOT to personalize advice
- ONLY to flag known irritation or mismatch risk patterns

Apply these dermatology principles strictly:

1. Retinoids increase epidermal turnover and commonly worsen irritation in inflamed or barrier-compromised skin.
2. Retinoid tolerability is dose-dependent. Undisclosed strength lowers assessment certainty.
3. Low-pH Vitamin C commonly causes stinging in sensitive or barrier-impaired skin.
4. Vitamin C stability and irritation risk depend on formulation details often not disclosed.
5. Niacinamide at higher concentrations may trigger flushing in reactive or rosacea-prone skin.
6. Lack of concentration clarity reduces safety confidence.
7. When formulation or strength details are missing, certainty must be downgraded.
8. If insufficient data is available, explicitly state uncertainty rather than speculating.

STRICT RULES:
- Do NOT invent risks.
- Do NOT add benefits.
- Do NOT speculate beyond detected actives.
- Do NOT reference AI.
- Use clinical, restrained language.
- If your output contains text outside valid JSON, it will be rejected.

Return JSON ONLY in this exact structure:

{
  "use_caution_if": ["string"],
  "clinical_rationale": ["string"],
  "assessment_certainty": "high | moderate | low",
  "certainty_reason": "string"
}

Base reasoning ONLY on this extracted data:

${JSON.stringify(extractionData, null, 2)}`;
}

function stripScriptsAndStyles(html: string): string {
  // Remove script and style blocks
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  return cleaned;
}

function extractVisibleText(html: string): string {
  const withoutScriptsAndStyles = stripScriptsAndStyles(html);
  // Remove all remaining tags
  const withoutTags = withoutScriptsAndStyles.replace(/<[^>]+>/g, " ");
  // Collapse whitespace
  return withoutTags.replace(/\s+/g, " ").trim();
}

/**
 * Try og:title first (cleaner on e-commerce), then <title>.
 * Returns "" if neither is found or the value looks like a
 * generic/error page (e.g. "Site Maintenance").
 */
function extractPageTitle(html: string): string {
  // 1. og:title
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  if (!ogMatch) {
    // Also try reversed attribute order (content before property)
    const ogAlt = html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    );
    if (ogAlt) {
      const val = ogAlt[1].replace(/\s+/g, " ").trim();
      if (val && !looksGeneric(val)) return val;
    }
  } else {
    const val = ogMatch[1].replace(/\s+/g, " ").trim();
    if (val && !looksGeneric(val)) return val;
  }

  // 2. <title> tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const val = titleMatch[1].replace(/\s+/g, " ").trim();
    if (val && !looksGeneric(val)) return val;
  }

  return "";
}

/** Detect generic / error page titles that should be discarded. */
function looksGeneric(title: string): boolean {
  const lower = title.toLowerCase();
  const bad = [
    "site maintenance",
    "maintenance",
    "404",
    "page not found",
    "access denied",
    "just a moment",
    "attention required",
    "please wait",
    "loading",
  ];
  return bad.some((b) => lower.includes(b));
}

/**
 * Last-resort: derive a human-readable product name from the URL path.
 * e.g. "https://www.nykaa.com/estee-lauder-advanced-night-repair/p/833283"
 *   -> "Estee Lauder Advanced Night Repair"
 */
function productNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname; // e.g. /estee-lauder-advanced-night-repair/p/833283
    // Take the first meaningful path segment (skip empty, "p", numeric IDs, "dp", etc.)
    const segments = pathname
      .split("/")
      .filter(
        (s) =>
          s &&
          s !== "p" &&
          s !== "dp" &&
          !/^\d+$/.test(s) &&
          s.length > 3,
      );
    if (segments.length === 0) return "";
    // Pick the longest slug (most likely the product name)
    const slug = segments.reduce((a, b) => (a.length >= b.length ? a : b));
    // Convert slug to title case
    return slug
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  } catch {
    return "";
  }
}

async function runRiskAssessment(
  extractedData: Extraction,
  apiKey: string,
  disclosures?: FormulationDisclosures,
): Promise<RiskAssessment | null> {
  // Combine extraction with formulation disclosures for richer context
  const enrichedData = {
    ...extractedData,
    ...(disclosures ? { formulation_disclosures: disclosures } : {}),
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: RISK_SYSTEM_PROMPT },
          { role: "user", content: buildRiskUserPrompt(enrichedData) },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.log("[api/analyze] Risk LLM response not OK:", response.status);
      return null;
    }

    const json = await response.json();
    const content =
      json?.choices?.[0]?.message?.content ??
      json?.choices?.[0]?.message?.content?.[0]?.text;

    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content) as Record<string, unknown>;

    // Map new prompt fields → existing frontend schema
    // assessment_certainty uses "moderate"; frontend expects "medium"
    const rawCertainty = String(parsed.assessment_certainty ?? "low").toLowerCase();
    const confidenceLevel: "low" | "medium" | "high" =
      rawCertainty === "high"
        ? "high"
        : rawCertainty === "moderate" || rawCertainty === "medium"
          ? "medium"
          : "low";

    return {
      avoid_if: Array.isArray(parsed.use_caution_if)
        ? (parsed.use_caution_if as unknown[]).map((s) => String(s))
        : [],
      risk_reasons: Array.isArray(parsed.clinical_rationale)
        ? (parsed.clinical_rationale as unknown[]).map((s) => String(s))
        : [],
      confidence_level: confidenceLevel,
      confidence_reason:
        typeof parsed.certainty_reason === "string"
          ? parsed.certainty_reason
          : "Insufficient formulation details to establish higher certainty.",
      disclaimer:
        "This is a general, dermatology-informed safety screen, not a diagnosis or treatment plan.",
    };
  } catch (err) {
    console.log("[api/analyze] Risk assessment parsing error:", err);
    return null;
  }
}

export async function POST(request: Request) {
  console.log("[api/analyze] Incoming request");

  const body = await request.json().catch((error) => {
    console.log("[api/analyze] Failed to parse JSON body", error);
    return null;
  });

  const url =
    body && typeof body === "object" && typeof (body as any).url === "string"
      ? (body as any).url
      : "";

  console.log("[api/analyze] URL from body:", url);

  if (!url) {
    console.log("[api/analyze] Missing URL, returning empty extraction");
    return Response.json({
      product_name: "",
      extraction: {
        ingredients: [],
        detected_actives: [],
        concentration_clues: "unknown",
        usage_instructions: "unknown",
      },
      risk_assessment: null,
    });
  }

  let html: string | null = null;

  try {
    console.log("[api/analyze] Fetching URL", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!response.ok) {
      console.log("[api/analyze] Non-OK response status:", response.status);
      return Response.json({
        product_name: "",
        extraction: {
          ingredients: [],
          detected_actives: [],
          concentration_clues: "unknown",
          usage_instructions: "unknown",
        },
        risk_assessment: null,
      });
    }
    html = await response.text();
    console.log("[api/analyze] Fetched HTML length:", html.length);
  } catch (error) {
    console.log("[api/analyze] Error fetching URL:", error);
    return Response.json({
      product_name: "",
      extraction: {
        ingredients: [],
        detected_actives: [],
        concentration_clues: "unknown",
        usage_instructions: "unknown",
      },
      risk_assessment: null,
    });
  }

  const htmlTitle = extractPageTitle(html);
  const slugName = productNameFromUrl(url);
  console.log("[api/analyze] Product name from HTML title:", htmlTitle);
  console.log("[api/analyze] Product name from URL slug:", slugName);

  const visibleText = extractVisibleText(html);
  console.log("[api/analyze] Visible text length:", visibleText.length);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[api/analyze] OPENAI_API_KEY is missing");
  }

  let extraction: Extraction = {
    ingredients: [],
    detected_actives: [],
    concentration_clues: "unknown",
    usage_instructions: "unknown",
  };

  if (!apiKey || !visibleText) {
    console.log(
      "[api/analyze] Skipping LLM call, apiKey or visibleText missing",
    );
    return Response.json({ product_name: htmlTitle || slugName, extraction, risk_assessment: null });
  }

  let llmProductName = "";
  let disclosures: FormulationDisclosures | undefined;

  try {
    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: buildExtractionUserPrompt(visibleText) },
        ],
        temperature: 0,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse
        .text()
        .catch(() => "<failed to read error body>");
      console.log(
        "[api/analyze] Extraction LLM response not OK:",
        llmResponse.status,
        "body (truncated):",
        errorText.slice(0, 500),
      );
      return Response.json({ product_name: htmlTitle || slugName, extraction, risk_assessment: null });
    }

    const llmJson = await llmResponse.json();
    console.log(
      "[api/analyze] Raw LLM JSON keys:",
      llmJson && typeof llmJson === "object" ? Object.keys(llmJson) : [],
    );
    const content =
      llmJson?.choices?.[0]?.message?.content ??
      llmJson?.choices?.[0]?.message?.content?.[0]?.text;

    if (typeof content === "string") {
      console.log(
        "[api/analyze] LLM content (truncated):",
        content.slice(0, 300),
      );

      const parsed = JSON.parse(content) as Record<string, unknown>;
      console.log("[api/analyze] Parsed extraction keys:", Object.keys(parsed));

      // Capture LLM-extracted product name
      if (
        typeof parsed.product_name === "string" &&
        parsed.product_name !== "unknown" &&
        parsed.product_name.trim()
      ) {
        llmProductName = parsed.product_name.trim();
        console.log("[api/analyze] LLM-extracted product name:", llmProductName);
      }

      // Capture formulation disclosures for risk assessment
      const rawDisc = parsed.formulation_disclosures as Record<string, unknown> | undefined;
      if (rawDisc && typeof rawDisc === "object") {
        const toVal = (v: unknown): "yes" | "no" | "unknown" =>
          v === "yes" ? "yes" : v === "no" ? "no" : "unknown";
        disclosures = {
          ph_disclosed: toVal(rawDisc.ph_disclosed),
          strength_disclosed: toVal(rawDisc.strength_disclosed),
        };
        console.log("[api/analyze] Formulation disclosures:", disclosures);
      }

      // Build extraction (frontend schema)
      extraction = {
        ingredients: Array.isArray(parsed.ingredients)
          ? (parsed.ingredients as unknown[]).map((item) => String(item))
          : [],
        detected_actives: Array.isArray(parsed.detected_actives)
          ? (parsed.detected_actives as unknown[]).map((item) => String(item))
          : [],
        concentration_clues:
          typeof parsed.concentration_clues === "string"
            ? parsed.concentration_clues
            : "unknown",
        usage_instructions:
          typeof parsed.usage_instructions === "string"
            ? parsed.usage_instructions
            : "unknown",
      };
    }
  } catch (err) {
    console.log("[api/analyze] Extraction parsing error:", err);
    // Fall back to default empty/unknown extraction
  }

  let risk_assessment: RiskAssessment | null = null;
  if (
    extraction.ingredients.length > 0 ||
    extraction.detected_actives.length > 0 ||
    extraction.concentration_clues !== "unknown" ||
    extraction.usage_instructions !== "unknown"
  ) {
    risk_assessment = await runRiskAssessment(extraction, apiKey, disclosures);
  }

  // Priority: LLM-extracted name > HTML title/og:title > URL slug
  const finalProductName = llmProductName || htmlTitle || slugName;
  console.log("[api/analyze] Final product name:", finalProductName);

  return Response.json({ product_name: finalProductName, extraction, risk_assessment });
}

