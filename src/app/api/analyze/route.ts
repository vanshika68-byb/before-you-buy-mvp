/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Extraction = {
  ingredients: string[];
  detected_actives: string[];
  concentration_clues: string;
  usage_instructions: string;
};

type RiskAssessment = {
  avoid_if: string[];
  risk_reasons: string[];
  confidence_level: "low" | "medium" | "high";
  confidence_reason: string;
  disclaimer: string;
};

/* ------------------------------------------------------------------ */
/*  Prompt constants                                                   */
/* ------------------------------------------------------------------ */

const EXTRACTION_SYSTEM_PROMPT =
  "You are a deterministic clinical information extraction engine. " +
  "You respond ONLY with valid JSON. No commentary, no markdown fences, no extra text.";

const EXTRACTION_USER_PROMPT = (visibleText: string) =>
  `Your task is to extract ONLY explicit, verifiable formulation facts from the provided product page text.

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
- detected_actives must ONLY include: Retinoid, Vitamin C, Niacinamide.
- If none detected, return empty array.
- Use exact ingredient spellings from text.
- product_name: extract the full product name as shown on the page (brand + product line + variant + size). Do NOT abbreviate. If not visible, return "unknown".
- If your output contains any text outside valid JSON, the system will reject it.

Text:
${visibleText}`;

const RISK_SYSTEM_PROMPT =
  "You are applying conservative dermatology safety heuristics to a skincare formulation. " +
  "You respond ONLY with valid JSON. No commentary, no markdown fences, no extra text.";

const RISK_USER_PROMPT = (extractionData: Extraction) =>
  `Your role:
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

${JSON.stringify(extractionData)}`;

/* ------------------------------------------------------------------ */
/*  HTML helpers                                                       */
/* ------------------------------------------------------------------ */

function stripScriptsAndStyles(html: string): string {
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  return cleaned;
}

function extractVisibleText(html: string): string {
  const withoutScriptsAndStyles = stripScriptsAndStyles(html);
  const withoutTags = withoutScriptsAndStyles.replace(/<[^>]+>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------------ */
/*  Product-name helpers (unchanged)                                   */
/* ------------------------------------------------------------------ */

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

function productNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
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
    const slug = segments.reduce((a, b) => (a.length >= b.length ? a : b));
    return slug
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Safe JSON parser                                                   */
/* ------------------------------------------------------------------ */

function safeParseJson(raw: string): Record<string, unknown> | null {
  // Strip markdown code fences if the model wraps output
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  try {
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
    return null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  LLM call helper                                                    */
/* ------------------------------------------------------------------ */

async function callLlm(
  system: string,
  user: string,
  apiKey: string,
): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response
      .text()
      .catch(() => "<failed to read error body>");
    console.log(
      "[api/analyze] LLM response not OK:",
      response.status,
      "body (truncated):",
      errorText.slice(0, 500),
    );
    return null;
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : null;
}

/* ------------------------------------------------------------------ */
/*  Risk assessment (second LLM call)                                  */
/* ------------------------------------------------------------------ */

async function runRiskAssessment(
  extractedData: Extraction,
  apiKey: string,
): Promise<RiskAssessment | null> {
  try {
    const raw = await callLlm(
      RISK_SYSTEM_PROMPT,
      RISK_USER_PROMPT(extractedData),
      apiKey,
    );
    if (!raw) return null;

    const parsed = safeParseJson(raw);
    if (!parsed) {
      console.log("[api/analyze] Risk assessment: invalid JSON from LLM");
      return null;
    }

    console.log("[api/analyze] Parsed risk assessment:", parsed);

    // Map new prompt field names → existing frontend schema
    const certaintyRaw = parsed.assessment_certainty;
    let mappedLevel: "low" | "medium" | "high" = "low";
    if (certaintyRaw === "high") mappedLevel = "high";
    else if (certaintyRaw === "moderate") mappedLevel = "medium";
    else if (certaintyRaw === "low") mappedLevel = "low";

    return {
      avoid_if: Array.isArray(parsed.use_caution_if)
        ? (parsed.use_caution_if as unknown[]).map((s) => String(s))
        : [],
      risk_reasons: Array.isArray(parsed.clinical_rationale)
        ? (parsed.clinical_rationale as unknown[]).map((s) => String(s))
        : [],
      confidence_level: mappedLevel,
      confidence_reason:
        typeof parsed.certainty_reason === "string"
          ? parsed.certainty_reason
          : "Insufficient formulation details to support a higher certainty classification.",
      disclaimer:
        "This is a general, dermatology-informed safety screen, not a diagnosis or treatment plan.",
    };
  } catch (err) {
    console.log("[api/analyze] Risk assessment error:", err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

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

  const emptyResponse = (name = "") =>
    Response.json({
      product_name: name,
      extraction: {
        ingredients: [],
        detected_actives: [],
        concentration_clues: "unknown",
        usage_instructions: "unknown",
      },
      risk_assessment: null,
    });

  if (!url) {
    console.log("[api/analyze] Missing URL, returning empty extraction");
    return emptyResponse();
  }

  /* ---------- Fetch product page ---------------------------------- */

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
      return emptyResponse();
    }
    html = await response.text();
    console.log("[api/analyze] Fetched HTML length:", html.length);
  } catch (error) {
    console.log("[api/analyze] Error fetching URL:", error);
    return emptyResponse();
  }

  /* ---------- Product-name candidates (HTML + URL slug) ----------- */

  const htmlTitle = extractPageTitle(html);
  const slugName = productNameFromUrl(url);
  console.log("[api/analyze] Product name from HTML title:", htmlTitle);
  console.log("[api/analyze] Product name from URL slug:", slugName);

  /* ---------- Visible text ---------------------------------------- */

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
    return Response.json({
      product_name: htmlTitle || slugName,
      extraction,
      risk_assessment: null,
    });
  }

  /* ---------- LLM call 1: Extraction ------------------------------ */

  let llmProductName = "";

  try {
    const raw = await callLlm(
      EXTRACTION_SYSTEM_PROMPT,
      EXTRACTION_USER_PROMPT(visibleText),
      apiKey,
    );

    if (!raw) {
      console.log("[api/analyze] Extraction LLM returned nothing");
      return Response.json({
        product_name: htmlTitle || slugName,
        extraction,
        risk_assessment: null,
      });
    }

    const parsed = safeParseJson(raw);

    if (!parsed) {
      console.log("[api/analyze] Extraction: invalid JSON from LLM");
      return Response.json({
        product_name: htmlTitle || slugName,
        extraction,
        risk_assessment: null,
      });
    }

    console.log("[api/analyze] Parsed extraction keys:", Object.keys(parsed));

    // Capture LLM-extracted product name
    if (
      typeof parsed.product_name === "string" &&
      parsed.product_name !== "unknown" &&
      parsed.product_name.trim()
    ) {
      llmProductName = (parsed.product_name as string).trim();
      console.log("[api/analyze] LLM-extracted product name:", llmProductName);
    }

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
  } catch (err) {
    console.log("[api/analyze] Extraction error:", err);
    // Fall back to default empty/unknown extraction
  }

  /* ---------- LLM call 2: Risk assessment ------------------------- */

  let risk_assessment: RiskAssessment | null = null;
  if (
    extraction.ingredients.length > 0 ||
    extraction.detected_actives.length > 0 ||
    extraction.concentration_clues !== "unknown" ||
    extraction.usage_instructions !== "unknown"
  ) {
    risk_assessment = await runRiskAssessment(extraction, apiKey);
  }

  /* ---------- Final response -------------------------------------- */

  // Priority: LLM-extracted name > HTML title/og:title > URL slug
  const finalProductName = llmProductName || htmlTitle || slugName;
  console.log("[api/analyze] Final product name:", finalProductName);

  return Response.json({
    product_name: finalProductName,
    extraction,
    risk_assessment,
  });
}
