# Before You Buy — MVP Guardrails

These are non-negotiable constraints for the v1 MVP.
If a change violates any of these, it should NOT be shipped.

## Product Scope
- The product only flags "avoid" cases.
- The product never recommends products.
- The product never says a product is "safe", "good", or "effective".
- The product never ranks or scores products.
- The product does not suggest alternatives.

## Supported Domain (v1)
- Actives & Serums only.
- Supported actives:
  - Retinoids
  - Vitamin C
  - Niacinamide
- All other products must return "We don’t know yet."

## Trust & Honesty
- Refusal is better than a wrong answer.
- If confidence is low, the product must refuse to answer.
- The product must explicitly say "We don’t know yet" when unsure.
- The product must never guess or hallucinate missing information.

## Language & Tone
- Use calm, neutral, non-alarmist language.
- Avoid fear-based or absolute claims.
- Avoid medical claims or advice.
- Avoid marketing language.

## UX Behavior
- The product must not encourage purchases.
- The product must not push signups during analysis.
- The product must not hide uncertainty.
- The analyzing step must feel deliberate, not flashy.

## Data & AI Usage
- AI outputs must be constrained to allowed formats.
- AI must not introduce new claims beyond known failure patterns.
- If AI output violates guardrails, the response must be discarded.

## Monetization
- No ads.
- No affiliate links.
- No sponsored placements.

## Success Definition (v1)
- Success is a user avoiding a bad purchase.
- Success is NOT engagement, speed, or growth.
