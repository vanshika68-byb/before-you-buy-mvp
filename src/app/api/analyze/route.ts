/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Frontend-compatible extraction type */
type Extraction = {
  ingredients: string[];
  detected_actives: string[];
  concentration_clues: string;
  usage_instructions: string;
};

/** Frontend-compatible risk assessment type */
type RiskAssessment = {
  avoid_if: string[];
  risk_reasons: string[];
  confidence_level: "low" | "medium" | "high";
  confidence_reason: string;
  disclaimer: string;
};

/** LLM output schema */
type AnalysisResponse = {
  product_name?: string;
  product_summary?: {
    identified_key_ingredients?: string[];
    notable_formulation_characteristics?: string[];
  };
  clinical_analysis?: {
    potential_irritation_risks?: string[];
    compatibility_considerations?: string[];
    layering_conflicts_or_interactions?: string[];
  };
  formulation_strengths?: string[];
  missing_or_unclear_information?: string[];
  overall_assessment?: {
    risk_level?: "low" | "moderate" | "elevated";
    certainty_level?: "high" | "moderate" | "low";
    clinical_reasoning_summary?: string;
  };
  professional_consideration?: string;
  error?: string;
};

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

/* ------------------------------------------------------------------ */
/*  Tool definition                                                    */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "fetch_url",
      description: "Fetch visible text content from a webpage URL to analyze skincare product information",
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

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are a dermatologist-level formulation analyst.

Your task:
1. First, use the fetch_url tool to retrieve the product page content.
2. Then analyze the ingredients and formulation.
3. Return your analysis as strict JSON only.

You must:
- Not recommend products.
- Not speculate beyond visible information.
- Explicitly model uncertainty.
- Return valid JSON only in your final response.

OUTPUT FORMAT (STRICT JSON):

{
  "product_name": "Full product name from page",
  "product_summary": {
    "identified_key_ingredients": ["string"],
    "notable_formulation_characteristics": ["string"]
  },
  "clinical_analysis": {
    "potential_irritation_risks": ["string"],
    "compatibility_considerations": ["string"],
    "layering_conflicts_or_interactions": ["string"]
  },
  "formulation_strengths": ["string"],
  "missing_or_unclear_information": ["string"],
  "overall_assessment": {
    "risk_level": "low | moderate | elevated",
    "certainty_level": "high | moderate | low",
    "clinical_reasoning_summary": "string"
  },
  "professional_consideration": "string"
}

If the page cannot be retrieved or analyzed, return:
{ "error": "Unable to retrieve product content." }`;

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
/*  URL fetch (server-side tool execution)                             */
/* ------------------------------------------------------------------ */

async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    console.log("[fetch_url] Fetching:", url);
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
      console.log("[fetch_url] Non-OK response:", response.status);
      return null;
    }

    const html = await response.text();
    console.log("[fetch_url] HTML length:", html.length);

    const visibleText = extractVisibleText(html);
    console.log("[fetch_url] Visible text length:", visibleText.length);

    // Truncate to avoid token limits
    return visibleText.slice(0, 40000);
  } catch (error) {
    console.log("[fetch_url] Error:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Safe JSON parser                                                   */
/* ------------------------------------------------------------------ */

function safeParseJson(raw: string): Record<string, unknown> | null {
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
/*  Product name fallback from URL                                     */
/* ------------------------------------------------------------------ */

function productNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname
      .split("/")
      .filter(
        (s) =>
          s && s !== "p" && s !== "dp" && !/^\d+$/.test(s) && s.length > 3,
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
/*  Map LLM output → frontend schema                                   */
/* ------------------------------------------------------------------ */

function mapToFrontendSchema(
  analysis: AnalysisResponse,
  fallbackProductName: string,
): {
  product_name: string;
  extraction: Extraction;
  risk_assessment: RiskAssessment | null;
} {
  const productName =
    (typeof analysis.product_name === "string" && analysis.product_name.trim()) ||
    fallbackProductName;

  const ingredients = Array.isArray(analysis.product_summary?.identified_key_ingredients)
    ? analysis.product_summary.identified_key_ingredients.map(String)
    : [];

  const activeKeywords = [
    "retinol", "retinal", "retinoid", "tretinoin", "adapalene",
    "vitamin c", "ascorbic acid", "ascorbyl",
    "niacinamide", "nicotinamide",
    "salicylic acid", "bha",
    "glycolic acid", "lactic acid", "aha",
    "hyaluronic acid",
    "benzoyl peroxide",
    "azelaic acid",
  ];
  const detected_actives = ingredients.filter((ing) =>
    activeKeywords.some((kw) => ing.toLowerCase().includes(kw)),
  );

  const missingInfo = Array.isArray(analysis.missing_or_unclear_information)
    ? analysis.missing_or_unclear_information.join("; ")
    : "unknown";

  const characteristics = Array.isArray(
    analysis.product_summary?.notable_formulation_characteristics,
  )
    ? analysis.product_summary.notable_formulation_characteristics.join("; ")
    : "unknown";

  const extraction: Extraction = {
    ingredients,
    detected_actives,
    concentration_clues: missingInfo || "unknown",
    usage_instructions: characteristics || "unknown",
  };

  const hasAnalysis = analysis.clinical_analysis || analysis.overall_assessment;
  let risk_assessment: RiskAssessment | null = null;

  if (hasAnalysis) {
    const compatibility = Array.isArray(
      analysis.clinical_analysis?.compatibility_considerations,
    )
      ? analysis.clinical_analysis.compatibility_considerations.map(String)
      : [];

    const irritationRisks = Array.isArray(
      analysis.clinical_analysis?.potential_irritation_risks,
    )
      ? analysis.clinical_analysis.potential_irritation_risks.map(String)
      : [];
    const layeringConflicts = Array.isArray(
      analysis.clinical_analysis?.layering_conflicts_or_interactions,
    )
      ? analysis.clinical_analysis.layering_conflicts_or_interactions.map(String)
      : [];
    const riskReasons = [...irritationRisks, ...layeringConflicts];

    const certRaw = analysis.overall_assessment?.certainty_level;
    let confidenceLevel: "low" | "medium" | "high" = "low";
    if (certRaw === "high") confidenceLevel = "high";
    else if (certRaw === "moderate") confidenceLevel = "medium";

    const confidenceReason =
      analysis.overall_assessment?.clinical_reasoning_summary ||
      analysis.professional_consideration ||
      "Assessment based on available formulation disclosures.";

    risk_assessment = {
      avoid_if: compatibility,
      risk_reasons: riskReasons,
      confidence_level: confidenceLevel,
      confidence_reason: confidenceReason,
      disclaimer:
        "This is a general, dermatology-informed safety screen, not a diagnosis or treatment plan.",
    };
  }

  return { product_name: productName, extraction, risk_assessment };
}

/* ------------------------------------------------------------------ */
/*  Chat message types                                                 */
/* ------------------------------------------------------------------ */

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
};

/* ------------------------------------------------------------------ */
/*  Chat Completions API call                                          */
/* ------------------------------------------------------------------ */

async function callChatCompletions(
  apiKey: string,
  messages: ChatMessage[],
  includeTools: boolean,
): Promise<{
  message: ChatMessage | null;
  finishReason: string | null;
}> {
  const body: Record<string, unknown> = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.2,
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
    const errorText = await response.text().catch(() => "<failed>");
    console.log(
      "[api/analyze] Chat API error:",
      response.status,
      errorText.slice(0, 500),
    );
    return { message: null, finishReason: null };
  }

  const json = await response.json();
  const choice = json?.choices?.[0];

  return {
    message: choice?.message ?? null,
    finishReason: choice?.finish_reason ?? null,
  };
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
    body &&
    typeof body === "object" &&
    typeof (body as Record<string, unknown>).url === "string"
      ? ((body as Record<string, unknown>).url as string)
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

  const errorResponse = (message: string, name = "") =>
    Response.json({
      product_name: name,
      extraction: {
        ingredients: [],
        detected_actives: [],
        concentration_clues: "unknown",
        usage_instructions: "unknown",
      },
      risk_assessment: null,
      error: message,
    });

  if (!url) {
    console.log("[api/analyze] Missing URL");
    return emptyResponse();
  }

  const fallbackName = productNameFromUrl(url);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[api/analyze] OPENAI_API_KEY is missing");
    return errorResponse("API key not configured.", fallbackName);
  }

  /* ---------- Step 1: Initial request with tools ------------------- */

  console.log("[api/analyze] Step 1: Initial request");

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Analyze this skincare product URL: ${url}` },
  ];

  let result = await callChatCompletions(apiKey, messages, true);

  if (!result.message) {
    console.log("[api/analyze] Initial request failed");
    return errorResponse("Unable to process request.", fallbackName);
  }

  /* ---------- Step 2: Handle tool calls loop ----------------------- */

  let loopCount = 0;
  const maxLoops = 3;

  while (result.finishReason === "tool_calls" && loopCount < maxLoops) {
    loopCount++;
    console.log("[api/analyze] Tool call loop:", loopCount);

    const toolCalls = result.message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      console.log("[api/analyze] No tool calls found");
      break;
    }

    // Add assistant message with tool calls
    messages.push(result.message);

    // Execute each tool call
    for (const toolCall of toolCalls) {
      console.log("[api/analyze] Executing tool:", toolCall.function.name);

      if (toolCall.function.name === "fetch_url") {
        let targetUrl = url;
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (typeof args.url === "string") {
            targetUrl = args.url;
          }
        } catch {
          // Use default URL
        }

        const content = await fetchUrlContent(targetUrl);

        if (!content) {
          console.log("[api/analyze] fetch_url failed");
          // Return error content to model
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "Error: Unable to retrieve page content. The URL may be blocked or unavailable.",
          });
        } else {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: content,
          });
        }
      } else {
        // Unknown tool
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: "Error: Unknown tool.",
        });
      }
    }

    // Continue conversation
    result = await callChatCompletions(apiKey, messages, true);

    if (!result.message) {
      console.log("[api/analyze] Follow-up request failed");
      return errorResponse("Unable to complete analysis.", fallbackName);
    }
  }

  /* ---------- Step 3: Extract final response ----------------------- */

  const finalContent = result.message.content;
  console.log(
    "[api/analyze] Final content (truncated):",
    finalContent?.slice(0, 500),
  );

  if (!finalContent) {
    console.log("[api/analyze] No final content");
    return errorResponse("Invalid model response.", fallbackName);
  }

  const parsed = safeParseJson(finalContent) as AnalysisResponse | null;

  if (!parsed) {
    console.log("[api/analyze] Failed to parse JSON");
    return errorResponse("Invalid model response.", fallbackName);
  }

  if (parsed.error) {
    console.log("[api/analyze] Model returned error:", parsed.error);
    return errorResponse(parsed.error, fallbackName);
  }

  console.log("[api/analyze] Parsed keys:", Object.keys(parsed));

  /* ---------- Step 4: Map to frontend schema ----------------------- */

  const mapped = mapToFrontendSchema(parsed, fallbackName);
  console.log("[api/analyze] Final product name:", mapped.product_name);

  return Response.json(mapped);
}
