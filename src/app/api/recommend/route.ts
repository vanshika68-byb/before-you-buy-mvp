/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

export type SkinAnalysis = {
  skin_type: "oily" | "dry" | "combination" | "sensitive" | "normal";
  concerns: string[];
  tone: string;
  acne_severity: "none" | "mild" | "moderate" | "severe";
  oiliness: "low" | "moderate" | "high";
  sensitivity: "low" | "moderate" | "high";
  hyperpigmentation: "none" | "mild" | "moderate" | "significant";
  visible_aging: "none" | "mild" | "moderate";
  summary: string;
};

export type ProductRecommendation = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_inr: number;
  price_usd: number;
  match_score: number;
  match_reasons: string[];
  key_ingredients: string[];
  avoid_if: string[];
  texture: string;
  fragrance_free: boolean;
  cruelty_free: boolean;
  vegan: boolean;
  links: {
    nykaa?: string;
    sephora?: string;
    amazon?: string;
    brand?: string;
  };
  image_placeholder_color: string;
  explanation: string;
};

type SkinProfile = {
  primary_concern: string;
  product_category: string;
  budget: "budget" | "mid" | "premium" | "luxury";
  known_allergies: string;
  pregnancy_safe: boolean;
  fragrance_free: boolean;
  vegan_only: boolean;
};

export type RecommendationResult = {
  skin_analysis: SkinAnalysis;
  recommendations: ProductRecommendation[];
  error?: string;
};

/* ------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------ */

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

const BUDGET_RANGES: Record<string, { max_inr: number; max_usd: number }> = {
  budget: { max_inr: 500, max_usd: 15 },
  mid: { max_inr: 2000, max_usd: 60 },
  premium: { max_inr: 6000, max_usd: 180 },
  luxury: { max_inr: 25000, max_usd: 600 },
};

/* ------------------------------------------------------------------
 * Prompt: skin analysis from image
 * ------------------------------------------------------------------ */

function skinAnalysisPrompt(): string {
  return `You are a board-certified dermatologist analysing a facial photograph.

Examine the image carefully and return ONLY valid JSON — no prose, no markdown fences.

Analyse:
1. Skin type: sebum production, texture, hydration appearance
2. Skin tone: describe naturally (e.g. "Fair", "Medium-warm", "Deep brown", "Olive")
3. Acne: count visible lesions — none=clear, mild=<10, moderate=10–40, severe=40+
4. Oiliness: visible shine especially in T-zone
5. Sensitivity: visible redness, flushing, reactive appearance  
6. Hyperpigmentation: dark spots, post-inflammatory marks, melasma
7. Visible aging: fine lines, deeper wrinkles

Rules:
- Never identify or name the person
- Focus ONLY on skin, not facial features
- If image quality is poor, make best assessment and note in summary

Output format (strict JSON):
{
  "skin_type": "oily | dry | combination | sensitive | normal",
  "concerns": ["2–5 identified skin concerns in plain English"],
  "tone": "natural tone description",
  "acne_severity": "none | mild | moderate | severe",
  "oiliness": "low | moderate | high",
  "sensitivity": "low | moderate | high",
  "hyperpigmentation": "none | mild | moderate | significant",
  "visible_aging": "none | mild | moderate",
  "summary": "2–3 sentence plain English summary of this person's skin and what their routine should prioritise"
}`;
}

/* ------------------------------------------------------------------
 * Prompt: product recommendations for one category
 * ------------------------------------------------------------------ */

function recommendationPrompt(analysis: SkinAnalysis, profile: SkinProfile): string {
  const budget = BUDGET_RANGES[profile.budget] || BUDGET_RANGES.mid;
  const categoryLabel = profile.product_category.replace(/_/g, " ");

  // Translate medical condition mentions into ingredient guidance
  // so the model focuses on formulation rather than diagnosis
  const allergiesNote = profile.known_allergies
    ? `Avoid products containing: ${profile.known_allergies}. If the user mentioned a skin condition (e.g. eczema, rosacea, psoriasis), treat this as a sensitivity signal — recommend barrier-supporting, fragrance-free, minimal-ingredient formulations.`
    : "none specified";

  return `You are a cosmetic skincare product specialist. Your job is to recommend specific over-the-counter skincare products.

CRITICAL: You must respond with ONLY a valid JSON object. No disclaimers, no caveats, no prose before or after. Not even one word outside the JSON. The response must begin with { and end with }.

## User Skin Profile
- Skin type: ${analysis.skin_type}
- Identified concerns: ${analysis.concerns.join(", ")}
- Acne level: ${analysis.acne_severity}
- Oiliness: ${analysis.oiliness}
- Sensitivity level: ${analysis.sensitivity}
- Hyperpigmentation: ${analysis.hyperpigmentation}
- Skin summary: ${analysis.summary}

## Shopping Criteria
- Product type wanted: ${categoryLabel}
- Main concern to target: ${profile.primary_concern.replace(/_/g, " ")}
- Max budget: ₹${budget.max_inr} / $${budget.max_usd}
- Allergies / sensitivities: ${allergiesNote}
- Pregnancy-safe required: ${profile.pregnancy_safe ? "YES — no retinoids, no salicylic acid above 2%, no hydroquinone" : "no"}
- Fragrance-free required: ${profile.fragrance_free ? "YES" : "no"}
- Vegan only: ${profile.vegan_only ? "YES" : "no"}

## Instructions
- Recommend exactly 6 real, purchasable ${categoryLabel} products from real brands
- Products must be within the budget limit
- Sort by match_score descending (highest first)
- match_score (0–100) must genuinely reflect ingredient fit for this skin profile
- For sensitive or condition-prone skin: prioritise gentle, minimal-ingredient, barrier-friendly formulas
- Purchase links must be real search URLs — use this format exactly:
  Nykaa: https://www.nykaa.com/search/result/?q=brand+productname
  Amazon: https://www.amazon.in/s?k=brand+productname

Respond with this exact JSON structure and nothing else:
{
  "recommendations": [
    {
      "id": "rec_1",
      "name": "Full product name",
      "brand": "Brand name",
      "category": "${profile.product_category}",
      "price_inr": 850,
      "price_usd": 10,
      "match_score": 94,
      "match_reasons": ["reason 1", "reason 2", "reason 3"],
      "key_ingredients": ["Ingredient 1", "Ingredient 2"],
      "avoid_if": ["condition or allergy that would be a problem"],
      "texture": "e.g. lightweight gel",
      "fragrance_free": true,
      "cruelty_free": true,
      "vegan": true,
      "links": {
        "nykaa": "https://www.nykaa.com/search/result/?q=brand+product",
        "amazon": "https://www.amazon.in/s?k=brand+product"
      },
      "image_placeholder_color": "#E8F4E8",
      "explanation": "2 sentences explaining why this suits their specific skin profile."
    }
  ]
}`;
}

/* ------------------------------------------------------------------
 * OpenAI API call
 * ------------------------------------------------------------------ */

async function callOpenAI(
  apiKey: string,
  messages: Array<{ role: string; content: unknown }>,
  maxTokens: number
): Promise<string | null> {
  const res = await fetch(CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature: 0.15, max_tokens: maxTokens, response_format: { type: "json_object" } }),
  });
  if (!res.ok) {
    console.error("[api/recommend] OpenAI error:", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? null;
}

/* ------------------------------------------------------------------
 * JSON parser — strips markdown fences, finds first JSON object
 * ------------------------------------------------------------------ */

function parseJson<T>(raw: string): T | null {
  try {
    const clean = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
    const start = clean.search(/[{[]/);
    const end = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
 * Empty fallback
 * ------------------------------------------------------------------ */

function empty(msg: string): RecommendationResult {
  return {
    skin_analysis: {
      skin_type: "normal", concerns: [], tone: "Unknown",
      acne_severity: "none", oiliness: "moderate", sensitivity: "low",
      hyperpigmentation: "none", visible_aging: "none",
      summary: "Analysis could not be completed.",
    },
    recommendations: [],
    error: msg,
  };
}

/* ------------------------------------------------------------------
 * POST handler
 * ------------------------------------------------------------------ */

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json(empty("API key not configured."));

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json(empty("Invalid request body.")); }

  const imageBase64 = typeof body.image_base64 === "string" ? body.image_base64 : null;
  const skinProfile = body.skin_profile as SkinProfile | undefined;

  if (!imageBase64 || !skinProfile) return Response.json(empty("Missing image or skin profile."));

  const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  // ── Step 1: Analyse skin from image ──────────────────────────────
  console.log("[api/recommend] Step 1: analysing skin from image");

  const analysisRaw = await callOpenAI(apiKey, [
    { role: "system", content: skinAnalysisPrompt() },
    {
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}`, detail: "high" } },
        { type: "text", text: "Analyse the skin in this image. Return only JSON. Do not identify the person." },
      ],
    },
  ], 600);

  if (!analysisRaw) return Response.json(empty("Image analysis failed."));

  const skinAnalysis = parseJson<SkinAnalysis>(analysisRaw);
  if (!skinAnalysis) {
    console.error("[api/recommend] Skin analysis parse failed:", analysisRaw.slice(0, 400));
    return Response.json(empty("Could not parse skin analysis."));
  }

  console.log("[api/recommend] Skin type:", skinAnalysis.skin_type, "| Category:", skinProfile.product_category);

  // ── Step 2: Recommend products for chosen category ────────────────
  console.log("[api/recommend] Step 2: generating product recommendations");

  const recRaw = await callOpenAI(apiKey, [
    { role: "system", content: recommendationPrompt(skinAnalysis, skinProfile) },
    { role: "user", content: "Return the 6 best product recommendations as specified. Only JSON, no markdown." },
  ], 4000);

  if (!recRaw) return Response.json(empty("Recommendation generation failed."));

  console.log("[api/recommend] Raw response preview:", recRaw.slice(0, 300));

  const recData = parseJson<{ recommendations: ProductRecommendation[] }>(recRaw);

  if (!recData || !Array.isArray(recData.recommendations)) {
    console.error("[api/recommend] Recommendation parse failed. Full response:", recRaw);
    return Response.json(empty("Could not parse recommendations."));
  }

  console.log("[api/recommend] Done. Products returned:", recData.recommendations.length);

  return Response.json({
    skin_analysis: skinAnalysis,
    recommendations: recData.recommendations,
  });
}