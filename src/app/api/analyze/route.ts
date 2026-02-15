/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

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

export type AnalysisResult = {
  product_name: string;
  product_type: string;
  extraction: Extraction;
  what_this_product_does: string[];
  skin_type_suitability: SkinTypeSuitability | null;
  ingredient_interactions: IngredientInteraction[];
  formulation_strengths: string[];
  formulation_weaknesses: string[];
  risk_assessment: RiskAssessment | null;
  verdict: Verdict | null;
  error?: string;
};

type LLMIngredientEntry = {
  name: string;
  function?: string;
  concentration_estimate?: string;
};

type LLMAnalysisResponse = {
  product_name?: string;
  product_type?: string;
  product_summary?: {
    identified_key_ingredients?: LLMIngredientEntry[];
    notable_formulation_characteristics?: string[];
    ph_or_vehicle_notes?: string;
  };
  what_this_product_does?: string[];
  skin_type_suitability?: SkinTypeSuitability;
  clinical_analysis?: {
    potential_irritation_risks?: string[];
    compatibility_considerations?: string[];
    layering_conflicts_or_interactions?: IngredientInteraction[];
  };
  formulation_strengths?: string[];
  formulation_weaknesses?: string[];
  missing_or_unclear_information?: string[];
  overall_assessment?: {
    risk_level?: "low" | "moderate" | "elevated";
    certainty_level?: "high" | "moderate" | "low";
    clinical_reasoning_summary?: string;
    verdict?: Verdict;
  };
  professional_consideration?: string;
  error?: string;
};

/* ------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------ */

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

/* ------------------------------------------------------------------
 * Tools
 * ------------------------------------------------------------------ */

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "fetch_url",
      description:
        "Fetch visible text content from a webpage URL to analyze skincare product information",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL of the product page to fetch",
          },
        },
        required: ["url"],
      },
    },
  },
];

/* ------------------------------------------------------------------
 * System prompt
 * ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are a board-certified dermatologist and cosmetic chemist with deep expertise in formulation science.

Your task:
1. Use the fetch_url tool to retrieve the product page content.
2. Reason carefully through the formulation before producing output.
3. Return ONLY valid JSON — no prose, no markdown fences.

## Analysis Standards

**Ingredient Analysis**
- Identify ALL active and functional ingredients from the INCI list
- Estimate concentrations using: position in ingredient list (earlier = higher), regulatory caps, and known effective ranges
- Note pH-sensitive ingredients (vitamin C works best <3.5, AHAs active at <4, retinoids denature in alkaline environments)
- Classify ingredients: humectants, emollients, occlusives, emulsifiers, film-formers, actives

**Clinical Reasoning**
- Flag real irritation risks — distinguish confirmed irritants (fragrance, alcohol denat.) from commonly misattributed ones (phenoxyethanol, citric acid as pH adjuster)
- Identify meaningful interactions: AHA + retinol (pH mismatch), niacinamide + vitamin C (stability at high %), benzoyl peroxide + retinol (oxidation)
- Note redundancies (e.g., two humectants doing identical work)
- Consider Fitzpatrick scale sensitivity differences for sensitive skin ratings

**Verdict Signal Rules**
- "green": well-formulated, low irritation risk, broadly suitable
- "yellow": effective but requires care — high actives, skin-type specific, or routine conflicts
- "red": meaningful formulation concern, high irritation risk, or problematic ingredients

**Certainty Rules**
- "high": full INCI list visible on page
- "moderate": partial list or marketing page with limited ingredient disclosure
- "low": no ingredient list found; relying on claims only

## Hard Rules
- Never recommend buying or avoiding a product — analyze the formulation only
- Clearly flag inferred vs confirmed information
- Plain English in what_this_product_does — not raw INCI names alone
- Return ONLY valid JSON in your final response

## Output Format (STRICT JSON):

{
  "product_name": "Full product name from page",
  "product_type": "serum | moisturizer | toner | cleanser | treatment | mask | eye cream | sunscreen | other",
  "product_summary": {
    "identified_key_ingredients": [
      { "name": "Ingredient Name", "function": "what it does", "concentration_estimate": "~2% estimated from mid-list position" }
    ],
    "notable_formulation_characteristics": ["string"],
    "ph_or_vehicle_notes": "inferred pH range or vehicle type"
  },
  "what_this_product_does": [
    "Plain English description of primary benefit",
    "Secondary benefit"
  ],
  "skin_type_suitability": {
    "oily": "good | neutral | caution | avoid",
    "dry": "good | neutral | caution | avoid",
    "combination": "good | neutral | caution | avoid",
    "sensitive": "good | neutral | caution | avoid",
    "normal": "good | neutral | caution | avoid",
    "reasoning": "1-2 sentence explanation of the ratings"
  },
  "clinical_analysis": {
    "potential_irritation_risks": ["string"],
    "compatibility_considerations": ["string — skin types or conditions to note"],
    "layering_conflicts_or_interactions": [
      {
        "ingredients": ["ingredient A", "ingredient B"],
        "interaction_type": "conflict | synergy | redundancy",
        "explanation": "plain English explanation"
      }
    ]
  },
  "formulation_strengths": ["string"],
  "formulation_weaknesses": ["string"],
  "missing_or_unclear_information": ["string"],
  "overall_assessment": {
    "risk_level": "low | moderate | elevated",
    "certainty_level": "high | moderate | low",
    "clinical_reasoning_summary": "2-3 sentences summarizing the key formulation story",
    "verdict": {
      "signal": "green | yellow | red",
      "headline": "Max 7 words — punchy clinical verdict",
      "summary": "2-3 plain-English sentences explaining the verdict for a non-expert"
    }
  },
  "professional_consideration": "One sentence about who should consult a professional before using this"
}

If the page cannot be retrieved, return: { "error": "Unable to retrieve product content." }`;

/* ------------------------------------------------------------------
 * HTML helpers
 * ------------------------------------------------------------------ */

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

function focusOnIngredients(text: string): string {
  const lower = text.toLowerCase();
  const ingredientMarkers = [
    "ingredients:",
    "full ingredients:",
    "ingredient list:",
    "inci list:",
    "formulation:",
    "what's in it:",
    "active ingredients:",
    "contains:",
  ];

  let ingredientStart = -1;
  for (const marker of ingredientMarkers) {
    const idx = lower.indexOf(marker);
    if (idx !== -1 && (ingredientStart === -1 || idx < ingredientStart)) {
      ingredientStart = idx;
    }
  }

  if (ingredientStart !== -1) {
    const contextStart = Math.max(0, ingredientStart - 500);
    const contextEnd = Math.min(text.length, ingredientStart + 8000);
    const ingredientSection = text.slice(contextStart, contextEnd);
    const intro = text.slice(0, 3000);
    return `${intro}\n\n--- INGREDIENT SECTION ---\n${ingredientSection}`.slice(0, 40000);
  }

  return text.slice(0, 40000);
}

/* ------------------------------------------------------------------
 * URL fetch
 * ------------------------------------------------------------------ */

async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    console.log("[fetch_url] Fetching:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.log("[fetch_url] Non-OK response:", response.status);
      return null;
    }

    const html = await response.text();
    const visibleText = extractVisibleText(html);
    return focusOnIngredients(visibleText);
  } catch (error) {
    console.log("[fetch_url] Error:", error);
    return null;
  }
}

/* ------------------------------------------------------------------
 * Safe JSON parser
 * ------------------------------------------------------------------ */

function safeParseJson(raw: string): Record<string, unknown> | null {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  try {
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
    return null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
 * Product name fallback from URL
 * ------------------------------------------------------------------ */

function productNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname
      .split("/")
      .filter((s) => s && s !== "p" && s !== "dp" && !/^\d+$/.test(s) && s.length > 3);
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

/* ------------------------------------------------------------------
 * Active ingredient keyword registry
 * ------------------------------------------------------------------ */

const ACTIVE_KEYWORDS: { kw: string; function: string }[] = [
  { kw: "retinol", function: "Cell turnover & anti-aging" },
  { kw: "retinal", function: "Cell turnover & anti-aging (faster acting than retinol)" },
  { kw: "tretinoin", function: "Prescription retinoid for acne & anti-aging" },
  { kw: "adapalene", function: "Retinoid for acne treatment" },
  { kw: "bakuchiol", function: "Plant-based retinol alternative" },
  { kw: "ascorbic acid", function: "Vitamin C — brightening & antioxidant" },
  { kw: "ascorbyl glucoside", function: "Stable Vitamin C derivative — brightening" },
  { kw: "sodium ascorbyl phosphate", function: "Stable Vitamin C derivative" },
  { kw: "ascorbyl tetraisopalmitate", function: "Oil-soluble Vitamin C" },
  { kw: "ethyl ascorbic acid", function: "Stable Vitamin C derivative" },
  { kw: "magnesium ascorbyl phosphate", function: "Stable Vitamin C derivative" },
  { kw: "salicylic acid", function: "BHA exfoliant — unclogs pores, anti-acne" },
  { kw: "glycolic acid", function: "AHA exfoliant — brightening & resurfacing" },
  { kw: "lactic acid", function: "AHA exfoliant — gentler than glycolic" },
  { kw: "mandelic acid", function: "AHA exfoliant — sensitive skin-friendly" },
  { kw: "gluconolactone", function: "PHA exfoliant — very gentle, humectant properties" },
  { kw: "niacinamide", function: "Pore-minimizing, oil control & brightening" },
  { kw: "nicotinamide", function: "Pore-minimizing & oil control" },
  { kw: "hyaluronic acid", function: "Humectant — deep hydration" },
  { kw: "sodium hyaluronate", function: "Humectant — smaller HA molecule, deeper penetration" },
  { kw: "polyglutamic acid", function: "Humectant — holds more water than HA" },
  { kw: "benzoyl peroxide", function: "Antibacterial — acne treatment" },
  { kw: "azelaic acid", function: "Anti-acne, anti-redness & hyperpigmentation" },
  { kw: "tranexamic acid", function: "Brightening — reduces hyperpigmentation" },
  { kw: "alpha-arbutin", function: "Brightening — gentle melanin inhibitor" },
  { kw: "kojic acid", function: "Brightening — melanin inhibitor" },
  { kw: "ceramide", function: "Barrier repair & moisture retention" },
  { kw: "peptide", function: "Collagen stimulation & anti-aging" },
  { kw: "matrixyl", function: "Peptide complex — anti-aging" },
  { kw: "copper peptide", function: "Wound healing & anti-aging" },
  { kw: "zinc oxide", function: "Mineral UV filter — sensitive skin-safe" },
  { kw: "titanium dioxide", function: "Mineral UV filter" },
  { kw: "squalane", function: "Lightweight emollient — barrier support" },
];

/* ------------------------------------------------------------------
 * Map LLM output → frontend schema
 * ------------------------------------------------------------------ */

function mapToFrontendSchema(
  analysis: LLMAnalysisResponse,
  fallbackProductName: string
): AnalysisResult {
  const productName =
    (typeof analysis.product_name === "string" && analysis.product_name.trim()) ||
    fallbackProductName;

  const productType =
    typeof analysis.product_type === "string" ? analysis.product_type : "unknown";

  const rawIngredients = Array.isArray(analysis.product_summary?.identified_key_ingredients)
    ? analysis.product_summary!.identified_key_ingredients
    : [];

  const ingredients: string[] = rawIngredients.map((ing) =>
    typeof ing === "string" ? ing : ing.name || ""
  );

  const detected_actives: ActiveIngredient[] = ingredients
    .map((name) => {
      const lower = name.toLowerCase();
      const match = ACTIVE_KEYWORDS.find((k) => lower.includes(k.kw));
      if (!match) return null;
      const llmEntry = rawIngredients.find(
        (ing) => typeof ing !== "string" && ing.name === name
      );
      const concentration_estimate =
        typeof llmEntry !== "string" ? llmEntry?.concentration_estimate : undefined;
      return { name, function: match.function, ...(concentration_estimate ? { concentration_estimate } : {}) };
    })
    .filter((a): a is ActiveIngredient => a !== null);

  const extraction: Extraction = {
    ingredients,
    detected_actives,
    concentration_clues: Array.isArray(analysis.missing_or_unclear_information)
      ? analysis.missing_or_unclear_information.join("; ")
      : "unknown",
    usage_instructions: Array.isArray(analysis.product_summary?.notable_formulation_characteristics)
      ? analysis.product_summary!.notable_formulation_characteristics.join("; ")
      : "unknown",
    ph_notes: analysis.product_summary?.ph_or_vehicle_notes ?? "unknown",
  };

  const skin_type_suitability: SkinTypeSuitability | null =
    analysis.skin_type_suitability ?? null;

  const interactionsRaw = analysis.clinical_analysis?.layering_conflicts_or_interactions ?? [];
  const ingredient_interactions: IngredientInteraction[] = Array.isArray(interactionsRaw)
    ? interactionsRaw.map((i) => ({
        ingredients: Array.isArray(i.ingredients) ? i.ingredients.map(String) : [],
        interaction_type: i.interaction_type || "conflict",
        explanation: i.explanation || "",
      }))
    : [];

  const what_this_product_does = Array.isArray(analysis.what_this_product_does)
    ? analysis.what_this_product_does.map(String)
    : [];

  const formulation_strengths = Array.isArray(analysis.formulation_strengths)
    ? analysis.formulation_strengths.map(String)
    : [];

  const formulation_weaknesses = Array.isArray(analysis.formulation_weaknesses)
    ? analysis.formulation_weaknesses.map(String)
    : [];

  let risk_assessment: RiskAssessment | null = null;
  if (analysis.clinical_analysis || analysis.overall_assessment) {
    const compatibility = Array.isArray(analysis.clinical_analysis?.compatibility_considerations)
      ? analysis.clinical_analysis!.compatibility_considerations.map(String)
      : [];
    const irritationRisks = Array.isArray(analysis.clinical_analysis?.potential_irritation_risks)
      ? analysis.clinical_analysis!.potential_irritation_risks.map(String)
      : [];
    const riskReasons = [
      ...irritationRisks,
      ...ingredient_interactions
        .filter((i) => i.interaction_type === "conflict")
        .map((i) => i.explanation),
    ];
    const certRaw = analysis.overall_assessment?.certainty_level;
    let confidenceLevel: "low" | "medium" | "high" = "low";
    if (certRaw === "high") confidenceLevel = "high";
    else if (certRaw === "moderate") confidenceLevel = "medium";

    risk_assessment = {
      avoid_if: compatibility,
      risk_reasons: riskReasons,
      confidence_level: confidenceLevel,
      confidence_reason:
        analysis.overall_assessment?.clinical_reasoning_summary ||
        analysis.professional_consideration ||
        "Assessment based on available formulation disclosures.",
      disclaimer:
        "This is a general, dermatology-informed safety screen, not a diagnosis or treatment plan.",
    };
  }

  const verdict: Verdict | null = analysis.overall_assessment?.verdict ?? null;

  return {
    product_name: productName,
    product_type: productType,
    extraction,
    what_this_product_does,
    skin_type_suitability,
    ingredient_interactions,
    formulation_strengths,
    formulation_weaknesses,
    risk_assessment,
    verdict,
  };
}

/* ------------------------------------------------------------------
 * Chat message types
 * ------------------------------------------------------------------ */

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
};

/* ------------------------------------------------------------------
 * Chat Completions API call
 * ------------------------------------------------------------------ */

async function callChatCompletions(
  apiKey: string,
  messages: ChatMessage[],
  includeTools: boolean
): Promise<{ message: ChatMessage | null; finishReason: string | null }> {
  const body: Record<string, unknown> = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.1,
  };

  if (includeTools) {
    body.tools = TOOLS;
    body.tool_choice = "auto";
  }

  const response = await fetch(CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.log("[api/analyze] Chat API error:", response.status, errorText.slice(0, 500));
    return { message: null, finishReason: null };
  }

  const json = await response.json();
  const choice = json?.choices?.[0];

  return {
    message: choice?.message ?? null,
    finishReason: choice?.finish_reason ?? null,
  };
}

/* ------------------------------------------------------------------
 * POST handler
 * ------------------------------------------------------------------ */

export async function POST(request: Request) {
  console.log("[api/analyze] Incoming request");

  const body = await request.json().catch(() => null);
  const url =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).url === "string"
      ? ((body as Record<string, unknown>).url as string)
      : "";

  const empty = (name = ""): AnalysisResult => ({
    product_name: name,
    product_type: "unknown",
    extraction: {
      ingredients: [],
      detected_actives: [],
      concentration_clues: "unknown",
      usage_instructions: "unknown",
      ph_notes: "unknown",
    },
    what_this_product_does: [],
    skin_type_suitability: null,
    ingredient_interactions: [],
    formulation_strengths: [],
    formulation_weaknesses: [],
    risk_assessment: null,
    verdict: null,
  });

  if (!url) return Response.json(empty());

  const fallbackName = productNameFromUrl(url);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ ...empty(fallbackName), error: "API key not configured." });

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analyze this skincare product: ${url}

Before your JSON output, briefly think through:
1. What type of product is this?
2. What are the key actives and their likely concentrations?
3. What is the probable formulation pH?
4. Any notable ingredient interactions or conflicts?

Then output the strict JSON.`,
    },
  ];

  let result = await callChatCompletions(apiKey, messages, true);
  if (!result.message) {
    return Response.json({ ...empty(fallbackName), error: "Unable to process request." });
  }

  let loopCount = 0;
  const maxLoops = 3;

  while (result.finishReason === "tool_calls" && loopCount < maxLoops) {
    loopCount++;
    const toolCalls = result.message.tool_calls;
    if (!toolCalls?.length) break;

    messages.push(result.message);

    for (const toolCall of toolCalls) {
      if (toolCall.function.name === "fetch_url") {
        let targetUrl = url;
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (typeof args.url === "string") targetUrl = args.url;
        } catch { /* use default */ }

        const content = await fetchUrlContent(targetUrl);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content:
            content ??
            "Error: Unable to retrieve page content. Analyze based on your training knowledge, and set certainty_level to 'low'.",
        });
      } else {
        messages.push({ role: "tool", tool_call_id: toolCall.id, content: "Error: Unknown tool." });
      }
    }

    result = await callChatCompletions(apiKey, messages, true);
    if (!result.message) {
      return Response.json({ ...empty(fallbackName), error: "Unable to complete analysis." });
    }
  }

  const finalContent = result.message.content;
  if (!finalContent) {
    return Response.json({ ...empty(fallbackName), error: "Invalid model response." });
  }

  const parsed = safeParseJson(finalContent) as LLMAnalysisResponse | null;
  if (!parsed) return Response.json({ ...empty(fallbackName), error: "Invalid model response." });
  if (parsed.error) return Response.json({ ...empty(fallbackName), error: parsed.error });

  const mapped = mapToFrontendSchema(parsed, fallbackName);
  console.log("[api/analyze] Done. Verdict:", mapped.verdict?.signal);

  return Response.json(mapped);
}