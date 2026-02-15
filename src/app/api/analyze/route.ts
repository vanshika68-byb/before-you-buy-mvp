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
  product_image_url: string | null;
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
 * Skin profile type (mirrors frontend SkinProfile)
 * ------------------------------------------------------------------ */

type SkinProfile = {
  skin_type?: "oily" | "dry" | "combination" | "sensitive" | "normal";
  concerns?: string[];
  known_allergies?: string;
  current_routine?: string;
};

/* ------------------------------------------------------------------
 * System prompt builder
 * ------------------------------------------------------------------ */

function buildSystemPrompt(skinProfile?: SkinProfile): string {
  const personalizationSection = skinProfile
    ? `
## User Skin Profile — CRITICAL: Personalise the entire analysis for this person

- Skin type: ${skinProfile.skin_type ?? "not specified"}
- Concerns: ${skinProfile.concerns?.join(", ") || "none specified"}
- Known sensitivities/allergies: ${skinProfile.known_allergies || "none specified"}
- Current actives in routine: ${skinProfile.current_routine || "none specified"}

When a skin profile is provided you MUST:
1. Weight your skin_type_suitability ratings with this person's skin type as the primary lens
2. Actively check for conflicts between this product's ingredients and their current routine actives (e.g. adding AHA to an existing retinol routine = over-exfoliation risk)
3. Flag their known allergies/sensitivities specifically if any appear in this product
4. Set verdict.personalized_note to a direct 1-2 sentence note addressed TO this user explaining whether this product fits their specific situation — be concrete, not generic
5. If their current routine creates a meaningful conflict, call it out clearly in ingredient_interactions
`
    : "";

  return `You are a board-certified dermatologist and cosmetic chemist with deep expertise in formulation science.

Your task:
1. Use the fetch_url tool to retrieve the product page content.
2. Reason carefully through the formulation before producing output.
3. Return ONLY valid JSON — no prose, no markdown fences.
${personalizationSection}
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
      "summary": "2-3 plain-English sentences explaining the verdict for a non-expert",
      "personalized_note": "Only include when a skin profile was provided: 1-2 sentences addressed directly to this user about whether this product fits their specific skin type, concerns, and routine. Omit this field entirely if no skin profile was given."
    }
  },
  "professional_consideration": "One sentence about who should consult a professional before using this"
}

If the page cannot be retrieved, return: { "error": "Unable to retrieve product content." }`;
}

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

/** Extract og:image or twitter:image from raw HTML */
function extractProductImage(html: string): string | null {
  // Try og:image (both attribute orderings)
  const ogPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const pattern of ogPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const url = match[1].trim();
      // Basic sanity check — must look like an image URL
      if (url.startsWith("http") && /\.(jpg|jpeg|png|webp|avif|gif)/i.test(url)) {
        return url;
      }
      // Some og:images don't have extensions but are still valid CDN URLs
      if (url.startsWith("http") && url.length > 10) {
        return url;
      }
    }
  }
  return null;
}

type FetchResult = {
  text: string | null;
  imageUrl: string | null;
};

/** Rotate through realistic browser User-Agent strings */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/** Build realistic browser-like headers */
function buildHeaders(url: string): Record<string, string> {
  const { origin } = new URL(url);
  return {
    "User-Agent": randomUserAgent(),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Referer": origin,
  };
}

async function fetchUrlContent(url: string): Promise<FetchResult> {
  // Attempt 1: Full browser-like headers
  // Attempt 2: Minimal headers (some sites block over-specified requests)
  const attempts = [
    () => fetch(url, { headers: buildHeaders(url) }),
    () => fetch(url, {
      headers: {
        "User-Agent": randomUserAgent(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    }),
  ];

  for (let i = 0; i < attempts.length; i++) {
    try {
      console.log(`[fetch_url] Attempt ${i + 1} for:`, url);
      const response = await attempts[i]();

      if (response.status === 403 || response.status === 429) {
        console.log(`[fetch_url] Attempt ${i + 1} blocked (${response.status}), ${i < attempts.length - 1 ? "retrying" : "giving up"}`);
        // Small delay before retry
        if (i < attempts.length - 1) await new Promise(r => setTimeout(r, 800));
        continue;
      }

      if (!response.ok) {
        console.log(`[fetch_url] Non-OK response: ${response.status}`);
        return { text: null, imageUrl: null };
      }

      const html = await response.text();
      const imageUrl = extractProductImage(html);
      console.log("[fetch_url] og:image found:", imageUrl ?? "none");

      const visibleText = extractVisibleText(html);
      return { text: focusOnIngredients(visibleText), imageUrl };

    } catch (error) {
      console.log(`[fetch_url] Attempt ${i + 1} error:`, error);
      if (i === attempts.length - 1) return { text: null, imageUrl: null };
    }
  }

  // All attempts failed — return null so LLM falls back to training knowledge
  console.log("[fetch_url] All attempts failed for:", url);
  return { text: null, imageUrl: null };
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
  fallbackProductName: string,
  productImageUrl: string | null = null
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
    product_image_url: productImageUrl,
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
    product_image_url: null,
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

  // Extract optional skin profile
  const skinProfile: SkinProfile | undefined =
    body && typeof body === "object" && (body as Record<string, unknown>).skin_profile
      ? ((body as Record<string, unknown>).skin_profile as SkinProfile)
      : undefined;

  console.log("[api/analyze] Skin profile provided:", !!skinProfile);

  // Build personalised user message
  const userMessage = skinProfile
    ? `Analyze this skincare product: ${url}

The user has provided their skin profile:
- Skin type: ${skinProfile.skin_type ?? "not specified"}
- Concerns: ${skinProfile.concerns?.join(", ") || "none"}
- Known sensitivities: ${skinProfile.known_allergies || "none"}
- Current routine actives: ${skinProfile.current_routine || "none"}

Before your JSON, briefly reason through:
1. What type of product is this and what are its key actives?
2. How does this fit with the user's ${skinProfile.skin_type ?? "unspecified"} skin type?
3. Any conflicts with their current routine (${skinProfile.current_routine || "none listed"})?
4. Does this product contain any of their known sensitivities (${skinProfile.known_allergies || "none listed"})?

Then output the strict JSON with a personalized_note in the verdict.`
    : `Analyze this skincare product: ${url}

Before your JSON output, briefly think through:
1. What type of product is this?
2. What are the key actives and their likely concentrations?
3. What is the probable formulation pH?
4. Any notable ingredient interactions or conflicts?

Then output the strict JSON.`;

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(skinProfile) },
    { role: "user", content: userMessage },
  ];

  let result = await callChatCompletions(apiKey, messages, true);
  if (!result.message) {
    return Response.json({ ...empty(fallbackName), error: "Unable to process request." });
  }

  let loopCount = 0;
  const maxLoops = 3;
  let capturedImageUrl: string | null = null;

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

        const { text, imageUrl } = await fetchUrlContent(targetUrl);
        // Capture the first image we find across all fetch calls
        if (imageUrl && !capturedImageUrl) capturedImageUrl = imageUrl;

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: text ?? `Error: Unable to retrieve page content from ${targetUrl} (likely bot protection). 
Please analyze this product using your training knowledge. Look up: ${targetUrl}
Set certainty_level to "low" and note in missing_or_unclear_information that the ingredient list could not be verified from the live page.`,
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

  const mapped = mapToFrontendSchema(parsed, fallbackName, capturedImageUrl);
  console.log("[api/analyze] Done. Verdict:", mapped.verdict?.signal, "| Image:", capturedImageUrl ? "found" : "none");

  return Response.json(mapped);
}