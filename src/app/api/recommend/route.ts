/* ------------------------------------------------------------------
 * Types — updated to match rich dermatologist analysis prompt
 * ------------------------------------------------------------------ */

export type SkinAnalysis = {
  // Core
  primary_skin_pattern: string;
  skin_type: "oily" | "dry" | "combination" | "normal" | "sensitive-reactive";
  sebum_distribution: { t_zone: string; cheeks: string };
  hydration_appearance: string;
  barrier_integrity: "intact" | "mildly-compromised" | "significantly-compromised";

  // Acne
  active_acne: {
    open_comedones: number;
    closed_comedones: number;
    papules: number;
    pustules: number;
    nodules_cysts: number;
    severity: "none" | "mild" | "moderate" | "severe";
    distribution: string[];
  };
  acne_sequelae: {
    pie_red_marks: string;
    pih_brown_marks: string;
    atrophic_scarring: { present: boolean; types: string[] };
  };

  // Pigment & vascular
  hyperpigmentation: { level: string; pattern: string[]; distribution: string[] };
  vascularity: {
    erythema_level: string;
    distribution: string[];
    telangiectasia: string;
    rosacea_like_pattern: string;
  };

  // Texture & aging
  pore_visibility: { level: string; locations: string[] };
  texture: string;
  visible_aging: "none" | "mild" | "moderate";

  // Tone
  apparent_skin_tone: { ita_category: string; descriptive: string; undertone: string };
  estimated_fitzpatrick: { range: string; confidence: string; caveat: string };

  // Sensitivity & tolerance
  sensitivity_level: "low" | "moderate" | "high";
  tolerance_for_strong_actives: "low" | "moderate" | "high";

  // Dermatologist strategy — directly feeds recommendation prompt
  treatment_priorities: string[];
  ingredient_categories_to_prioritize: string[];
  ingredients_to_avoid_or_use_with_caution: string[];
  vehicle_recommendation: string;
  spf_recommendation: string;

  // Meta
  confidence_score: number;
  limitations: string;
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
  links: { nykaa?: string; sephora?: string; amazon?: string; brand?: string };
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
  budget:  { max_inr: 500,   max_usd: 15  },
  mid:     { max_inr: 2000,  max_usd: 60  },
  premium: { max_inr: 6000,  max_usd: 180 },
  luxury:  { max_inr: 25000, max_usd: 600 },
};

/* ------------------------------------------------------------------
 * Prompt 1: Dermatologist skin analysis from photo
 * ------------------------------------------------------------------ */

const DERMATOLOGIST_ANALYSIS_PROMPT = `You are a board-certified dermatologist analyzing a facial photograph.

Return ONLY valid JSON. No prose. No markdown fences.
Analyze ONLY what is visually evident. Do not speculate beyond what the image shows.
If lighting, angle, makeup, filters, blur, or image resolution limits your assessment, note this clearly in "limitations".
Never identify or name the person. Focus exclusively on observable skin characteristics.

---

STEP 1 — PRIMARY SKIN PATTERN
Identify the single dominant visual concern (choose one):
- acne-dominant
- pigment-dominant
- barrier-compromised
- vascular-reactive
- photoaging-dominant
- balanced/no-major-pathology

---

STEP 2 — SKIN TYPE & BARRIER
Skin type (choose one): oily | dry | combination | normal | sensitive-reactive
Sebum distribution — T-zone: low | moderate | high; Cheeks: low | moderate | high
Hydration appearance: dehydrated | well-hydrated | dry/flaky
Barrier integrity: intact | mildly-compromised | significantly-compromised

---

STEP 3 — ACNE & LESIONS
Count each lesion type as visible integer. Use 0 if none visible.
- open_comedones (blackheads)
- closed_comedones (whiteheads/milia)
- papules (red bumps, no pus)
- pustules (red bumps with pus tip)
- nodules_cysts (deep >5mm lesions)
Severity: none (0) | mild (<10) | moderate (10–40) | severe (40+ or any nodules/cysts)
Distribution: forehead | cheeks | jawline | chin | nose | perioral | diffuse

---

STEP 4 — ACNE SEQUELAE
- pie_red_marks (pink/red flat post-acne): none | mild | moderate | significant
- pih_brown_marks (brown/dark flat post-acne): none | mild | moderate | significant
- atrophic_scarring: present true/false, types: ice-pick | rolling | boxcar

---

STEP 5 — PIGMENT & VASCULAR
Hyperpigmentation level: none | mild | moderate | significant
Patterns: post-inflammatory | melasma-like | freckles | diffuse-tanning | solar-lentigines
Erythema: none | mild | moderate | severe
Telangiectasia: present | absent | not-clearly-visible
Rosacea-like pattern: present | absent | not-clearly-visible

---

STEP 6 — TEXTURE & AGING
Pore visibility: none | mild | moderate | prominent; locations: forehead | nose | cheeks | chin
Texture: smooth | mildly-uneven | rough/congested
Visible aging: none | mild | moderate

---

STEP 7 — SKIN TONE
Apparent skin tone ITA category: very-light | light | intermediate | tan | brown | dark
Descriptive: plain English (e.g. "fair with pink undertones", "deep cool brown")
Undertone: cool | neutral | warm
Estimated Fitzpatrick range — provide a 1–2 type span only, never a single value (e.g. "III–IV")
Include caveat: "Visual estimation only. True phototype requires UV response history."

---

STEP 8 — SENSITIVITY & ACTIVE TOLERANCE
Sensitivity level: low | moderate | high
Tolerance for strong actives (retinoids, AHAs, BHAs, BP) — derive from barrier + sensitivity + skin type: low | moderate | high

---

STEP 9 — DERMATOLOGIST STRATEGY
treatment_priorities: ordered array of 3–6 goals ranked by urgency
ingredient_categories_to_prioritize: array of ingredient types (no brand names)
ingredients_to_avoid_or_use_with_caution: array of ingredients/categories to avoid
vehicle_recommendation: gel | lightweight-lotion | cream | ointment | serum-first-then-moisturizer
spf_recommendation: always broad-spectrum SPF 30+; note mineral vs chemical preference

---

STEP 10 — CONFIDENCE & LIMITATIONS
confidence_score: 0–100 (80–100 clear unfiltered frontal; 60–79 minor issues; 40–59 moderate; <40 flag all low)
limitations: describe factors reducing reliability

---

OUTPUT FORMAT (strict JSON, nothing else):
{
  "primary_skin_pattern": "",
  "skin_type": "",
  "sebum_distribution": { "t_zone": "", "cheeks": "" },
  "hydration_appearance": "",
  "barrier_integrity": "",
  "active_acne": {
    "open_comedones": 0, "closed_comedones": 0, "papules": 0,
    "pustules": 0, "nodules_cysts": 0, "severity": "", "distribution": []
  },
  "acne_sequelae": {
    "pie_red_marks": "", "pih_brown_marks": "",
    "atrophic_scarring": { "present": false, "types": [] }
  },
  "hyperpigmentation": { "level": "", "pattern": [], "distribution": [] },
  "vascularity": {
    "erythema_level": "", "distribution": [],
    "telangiectasia": "", "rosacea_like_pattern": ""
  },
  "pore_visibility": { "level": "", "locations": [] },
  "texture": "",
  "visible_aging": "",
  "apparent_skin_tone": { "ita_category": "", "descriptive": "", "undertone": "" },
  "estimated_fitzpatrick": {
    "range": "", "confidence": "",
    "caveat": "Visual estimation only. True phototype requires UV response history and cannot be determined from a photograph."
  },
  "sensitivity_level": "",
  "tolerance_for_strong_actives": "",
  "treatment_priorities": [],
  "ingredient_categories_to_prioritize": [],
  "ingredients_to_avoid_or_use_with_caution": [],
  "vehicle_recommendation": "",
  "spf_recommendation": "",
  "confidence_score": 0,
  "limitations": ""
}`;

/* ------------------------------------------------------------------
 * Prompt 2: Product recommendations — now uses rich analysis
 * ------------------------------------------------------------------ */

function recommendationPrompt(analysis: SkinAnalysis, profile: SkinProfile): string {
  const budget = BUDGET_RANGES[profile.budget] || BUDGET_RANGES.mid;
  const categoryLabel = profile.product_category.replace(/_/g, " ");

  // Merge user-stated allergies with dermatologist-flagged avoidances
  const avoidList = [
    ...(analysis.ingredients_to_avoid_or_use_with_caution || []),
    ...(profile.known_allergies ? [`User-reported: ${profile.known_allergies}`] : []),
  ].join("; ") || "none";

  // Flatten acne context for the prompt
  const acneContext = analysis.active_acne.severity !== "none"
    ? `${analysis.active_acne.severity} acne (${analysis.active_acne.papules} papules, ${analysis.active_acne.pustules} pustules, ${analysis.active_acne.nodules_cysts} nodules/cysts)`
    : "no active acne";

  const pigmentContext = [
    analysis.acne_sequelae.pie_red_marks !== "none" ? `PIE: ${analysis.acne_sequelae.pie_red_marks}` : "",
    analysis.acne_sequelae.pih_brown_marks !== "none" ? `PIH: ${analysis.acne_sequelae.pih_brown_marks}` : "",
    analysis.hyperpigmentation.level !== "none" ? `Hyperpigmentation: ${analysis.hyperpigmentation.level} (${analysis.hyperpigmentation.pattern.join(", ")})` : "",
  ].filter(Boolean).join(" · ") || "none";

  return `You are a cosmetic skincare product specialist. Your job is to recommend specific over-the-counter skincare products.

CRITICAL: Respond with ONLY a valid JSON object. The response must begin with { and end with }. No disclaimers, no caveats, no prose.

## Dermatologist Skin Analysis
- Skin type: ${analysis.skin_type}
- Primary pattern: ${analysis.primary_skin_pattern}
- Barrier integrity: ${analysis.barrier_integrity}
- Sebum — T-zone: ${analysis.sebum_distribution.t_zone}, Cheeks: ${analysis.sebum_distribution.cheeks}
- Hydration: ${analysis.hydration_appearance}
- Acne: ${acneContext}
- Post-acne marks: ${pigmentContext}
- Vascularity: erythema ${analysis.vascularity.erythema_level}${analysis.vascularity.rosacea_like_pattern === "present" ? ", rosacea-like pattern present" : ""}
- Sensitivity: ${analysis.sensitivity_level}
- Active tolerance: ${analysis.tolerance_for_strong_actives} (retinoids/AHAs/BHAs/BP)
- Skin tone: ${analysis.apparent_skin_tone.descriptive} (Fitzpatrick est. ${analysis.estimated_fitzpatrick.range})
- Dermatologist treatment priorities: ${analysis.treatment_priorities.join(" → ")}
- Ingredient categories to prioritise: ${analysis.ingredient_categories_to_prioritize.join(", ")}
- Ingredients to avoid or use with caution: ${avoidList}
- Recommended vehicle (texture): ${analysis.vehicle_recommendation}

## User Shopping Criteria
- Looking for: ${categoryLabel}
- Primary concern: ${profile.primary_concern.replace(/_/g, " ")}
- Budget: up to ₹${budget.max_inr} / $${budget.max_usd}
- Pregnancy-safe required: ${profile.pregnancy_safe ? "YES — exclude retinoids, salicylic acid >2%, hydroquinone" : "no"}
- Fragrance-free required: ${profile.fragrance_free ? "YES — mandatory" : "no"}
- Vegan only: ${profile.vegan_only ? "YES" : "no"}

## Instructions
- Recommend exactly 6 real, purchasable ${categoryLabel} products from real brands
- Respect the dermatologist's vehicle recommendation: if ${analysis.vehicle_recommendation} is recommended, favour that formulation type
- If tolerance_for_strong_actives is "low", avoid recommending high-strength retinoids (>0.3%), AHAs >5%, BHAs >2%, or benzoyl peroxide >2.5%
- If barrier is mildly-compromised or significantly-compromised, prioritise ceramides, panthenol, and gentle humectants over actives
- Rank by match_score descending. Score must genuinely reflect ingredient alignment with the dermatologist priorities above.
- Purchase links: use real search URLs:
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
      "match_reasons": ["why ingredient X addresses their specific concern", "why formulation suits their skin type"],
      "key_ingredients": ["Ingredient 1 %", "Ingredient 2"],
      "avoid_if": ["specific condition or sensitivity that would be problematic"],
      "texture": "e.g. lightweight gel",
      "fragrance_free": true,
      "cruelty_free": true,
      "vegan": true,
      "links": {
        "nykaa": "https://www.nykaa.com/search/result/?q=brand+product",
        "amazon": "https://www.amazon.in/s?k=brand+product"
      },
      "image_placeholder_color": "#E8F4E8",
      "explanation": "2 sentences tying key ingredients directly to this person's dermatologist-identified priorities."
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
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.1, // Lower temp for more consistent structured output
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    console.error("[api/recommend] OpenAI error:", res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? null;
}

/* ------------------------------------------------------------------
 * JSON parser
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
 * Empty fallback — updated to match new SkinAnalysis shape
 * ------------------------------------------------------------------ */

function empty(msg: string): RecommendationResult {
  return {
    skin_analysis: {
      primary_skin_pattern: "balanced/no-major-pathology",
      skin_type: "normal",
      sebum_distribution: { t_zone: "moderate", cheeks: "low" },
      hydration_appearance: "well-hydrated",
      barrier_integrity: "intact",
      active_acne: { open_comedones: 0, closed_comedones: 0, papules: 0, pustules: 0, nodules_cysts: 0, severity: "none", distribution: [] },
      acne_sequelae: { pie_red_marks: "none", pih_brown_marks: "none", atrophic_scarring: { present: false, types: [] } },
      hyperpigmentation: { level: "none", pattern: [], distribution: [] },
      vascularity: { erythema_level: "none", distribution: [], telangiectasia: "absent", rosacea_like_pattern: "absent" },
      pore_visibility: { level: "none", locations: [] },
      texture: "smooth",
      visible_aging: "none",
      apparent_skin_tone: { ita_category: "intermediate", descriptive: "Unknown", undertone: "neutral" },
      estimated_fitzpatrick: { range: "III–IV", confidence: "low", caveat: "Analysis could not be completed." },
      sensitivity_level: "low",
      tolerance_for_strong_actives: "moderate",
      treatment_priorities: [],
      ingredient_categories_to_prioritize: [],
      ingredients_to_avoid_or_use_with_caution: [],
      vehicle_recommendation: "lightweight-lotion",
      spf_recommendation: "Broad-spectrum SPF 30+",
      confidence_score: 0,
      limitations: msg,
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

  // ── Step 1: Dermatologist skin analysis ──────────────────────────
  console.log("[api/recommend] Step 1: running dermatologist analysis");

  const analysisRaw = await callOpenAI(apiKey, [
    { role: "system", content: DERMATOLOGIST_ANALYSIS_PROMPT },
    {
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}`, detail: "high" } },
        { type: "text", text: "Analyse the skin in this image. Return only the JSON object. Do not identify the person." },
      ],
    },
  ], 1400); // Increased — new schema is ~3× larger than old one

  if (!analysisRaw) return Response.json(empty("Image analysis failed."));

  const skinAnalysis = parseJson<SkinAnalysis>(analysisRaw);
  if (!skinAnalysis) {
    console.error("[api/recommend] Analysis parse failed:", analysisRaw.slice(0, 500));
    return Response.json(empty("Could not parse skin analysis."));
  }

  console.log("[api/recommend] Pattern:", skinAnalysis.primary_skin_pattern, "| Barrier:", skinAnalysis.barrier_integrity, "| Tolerance:", skinAnalysis.tolerance_for_strong_actives);

  // ── Step 2: Product recommendations ──────────────────────────────
  console.log("[api/recommend] Step 2: generating recommendations");

  const recRaw = await callOpenAI(apiKey, [
    { role: "system", content: recommendationPrompt(skinAnalysis, skinProfile) },
    { role: "user", content: "Return the 6 best product recommendations as JSON. Nothing else." },
  ], 4000);

  if (!recRaw) return Response.json(empty("Recommendation generation failed."));

  console.log("[api/recommend] Response preview:", recRaw.slice(0, 300));

  const recData = parseJson<{ recommendations: ProductRecommendation[] }>(recRaw);
  if (!recData || !Array.isArray(recData.recommendations)) {
    console.error("[api/recommend] Recommendation parse failed:", recRaw);
    return Response.json(empty("Could not parse recommendations."));
  }

  console.log("[api/recommend] Done —", recData.recommendations.length, "products");

  return Response.json({
    skin_analysis: skinAnalysis,
    recommendations: recData.recommendations,
  });
}