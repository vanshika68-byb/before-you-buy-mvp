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

function extractPageTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim();
}

async function runRiskAssessment(
  extractedData: Extraction,
  apiKey: string
): Promise<RiskAssessment | null> {
  const systemContent =
    "You are a cautious, dermatologist-informed risk assessment system. " +
    "Your job is to identify when a skincare product may be a bad fit for certain users. " +
    "You do NOT recommend products. " +
    "You highlight risks, mismatches, and uncertainty. " +
    "You must behave conservatively and medically cautious.";

  const userContent = `Using the extracted product information below, identify:
1. Skin types or conditions that should be cautious or avoid this product
2. The reasons for those risks (ingredient-level reasoning)
3. Your confidence level in this assessment

Rules:
- Do NOT recommend the product
- Do NOT suggest alternatives
- If data is missing or unclear, explicitly say so
- Use 'low', 'medium', or 'high' confidence only
- Be conservative; uncertainty is acceptable

Return JSON in exactly this shape and nothing else:

{
  "avoid_if": ["string"],
  "risk_reasons": ["string"],
  "confidence_level": "low | medium | high",
  "confidence_reason": "string",
  "disclaimer": "This is a general, dermatologist-informed assessment, not a medical diagnosis"
}

Extracted product data:
${JSON.stringify(extractedData, null, 2)}`;

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
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const content =
      json?.choices?.[0]?.message?.content ??
      json?.choices?.[0]?.message?.content?.[0]?.text;

    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content) as Partial<RiskAssessment>;
    const level = parsed.confidence_level;
    const validLevel =
      level === "low" || level === "medium" || level === "high"
        ? level
        : "low";

    return {
      avoid_if: Array.isArray(parsed.avoid_if)
        ? parsed.avoid_if.map((s) => String(s))
        : [],
      risk_reasons: Array.isArray(parsed.risk_reasons)
        ? parsed.risk_reasons.map((s) => String(s))
        : [],
      confidence_level: validLevel,
      confidence_reason:
        typeof parsed.confidence_reason === "string"
          ? parsed.confidence_reason
          : "unknown",
      disclaimer:
        typeof parsed.disclaimer === "string"
          ? parsed.disclaimer
          : "This is a general, dermatologist-informed assessment, not a medical diagnosis",
    };
  } catch {
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
    const response = await fetch(url);
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

  const productName = extractPageTitle(html);
  console.log("[api/analyze] Product name from title:", productName);

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
    return Response.json({ product_name: productName, extraction, risk_assessment: null });
  }

  try {
    const prompt = `
You are a strict information extraction engine.

Extract only structured facts from the given product page text.
Do NOT make recommendations, judgments, or decisions.
If specific information is missing or unclear, use the string "unknown".

Return JSON in exactly this shape and nothing else:
{
  "ingredients": ["string"],
  "detected_actives": ["Retinoid", "Vitamin C", "Niacinamide"],
  "concentration_clues": "string or unknown",
  "usage_instructions": "string or unknown"
}

Text:
${visibleText}
`.trim();

    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a JSON-only extraction model. Always respond with valid JSON only, no extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse
        .text()
        .catch(() => "<failed to read error body>");
      console.log(
        "[api/analyze] LLM response not OK:",
        llmResponse.status,
        "body (truncated):",
        errorText.slice(0, 500),
      );
      return Response.json({ product_name: productName, extraction, risk_assessment: null });
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

      const parsed = JSON.parse(content) as Partial<Extraction>;
      console.log("[api/analyze] Parsed extraction:", parsed);
      extraction = {
        ingredients: Array.isArray(parsed.ingredients)
          ? parsed.ingredients.map((item) => String(item))
          : [],
        detected_actives: Array.isArray(parsed.detected_actives)
          ? parsed.detected_actives.map((item) => String(item))
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
  } catch {
    // Fall back to default empty/unknown extraction
  }

  let risk_assessment: RiskAssessment | null = null;
  if (
    extraction.ingredients.length > 0 ||
    extraction.detected_actives.length > 0 ||
    extraction.concentration_clues !== "unknown" ||
    extraction.usage_instructions !== "unknown"
  ) {
    risk_assessment = await runRiskAssessment(extraction, apiKey);
  }

  return Response.json({ product_name: productName, extraction, risk_assessment });
}

