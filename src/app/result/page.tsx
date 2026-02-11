"use client";

import { useResult } from "../result-context";

export default function Result() {
  const { extraction, riskAssessment } = useResult();

  const productName = "Product name not available in current data";
  const detectedActives = extraction?.detected_actives ?? [];
  const assessmentDate = new Date().toLocaleDateString();

  const useCautionIf = riskAssessment?.avoid_if ?? [];
  const clinicalRationale = riskAssessment?.risk_reasons ?? [];
  const assessmentCertainty = riskAssessment?.confidence_level ?? "low";
  const certaintyExplanation = riskAssessment?.confidence_reason ?? "";

  const hasCautionItems = useCautionIf.length > 0;
  const hasRationaleItems = clinicalRationale.length > 0;

  const divider = {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: 0,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "48px 16px 64px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          padding: "40px 32px 48px",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              marginBottom: 6,
              color: "#111827",
            }}
          >
            Dermatology Safety Screen
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: "#6b7280",
            }}
          >
            General risk assessment based on disclosed formulation details.
          </p>
        </header>

        <hr style={divider} />

        {/* Product summary */}
        <section
          style={{
            paddingTop: 28,
            paddingBottom: 28,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 4,
              }}
            >
              Product
            </span>
            <span style={{ fontSize: 15, color: "#111827" }}>
              {productName}
            </span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 4,
              }}
            >
              Detected actives
            </span>
            <span style={{ fontSize: 15, color: "#111827" }}>
              {detectedActives.length > 0
                ? detectedActives.join(", ")
                : "No actives identified in this version of the screen."}
            </span>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 4,
              }}
            >
              Assessment date
            </span>
            <span style={{ fontSize: 15, color: "#111827" }}>
              {assessmentDate}
            </span>
          </div>
        </section>

        <hr style={divider} />

        {/* Use caution — visually dominant */}
        <section
          style={{
            paddingTop: 28,
            paddingBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 600,
              marginBottom: 14,
              color: "#111827",
              letterSpacing: "-0.01em",
            }}
          >
            Use caution if you have:
          </h2>

          {!riskAssessment ? (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "#4b5563",
                margin: 0,
              }}
            >
              Specific caution groups could not be identified from the
              available information. This does not rule out risk.
            </p>
          ) : hasCautionItems ? (
            <ul
              style={{
                paddingLeft: 20,
                margin: 0,
                fontSize: 15,
                lineHeight: 1.7,
                color: "#111827",
              }}
            >
              {useCautionIf.map((item) => (
                <li key={item} style={{ marginBottom: 6 }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "#4b5563",
                margin: 0,
              }}
            >
              No specific caution groups were identified from the disclosed
              information.
            </p>
          )}
        </section>

        <hr style={divider} />

        {/* Clinical rationale */}
        <section
          style={{
            paddingTop: 28,
            paddingBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              color: "#374151",
            }}
          >
            Clinical rationale
          </h2>

          {!riskAssessment ? (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "#4b5563",
                margin: 0,
              }}
            >
              Clinical rationale cannot be detailed because ingredient and
              formulation information are incomplete in this record.
            </p>
          ) : hasRationaleItems ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {clinicalRationale.map((reason) => (
                <p
                  key={reason}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {reason}
                </p>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "#4b5563",
                margin: 0,
              }}
            >
              No specific clinical notes are available for this product entry.
            </p>
          )}
        </section>

        <hr style={divider} />

        {/* Assessment certainty — labeled classification */}
        <section
          style={{
            paddingTop: 28,
            paddingBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              color: "#374151",
            }}
          >
            Assessment certainty
          </h2>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {riskAssessment
                ? assessmentCertainty.charAt(0).toUpperCase() +
                  assessmentCertainty.slice(1)
                : "Low"}
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#4b5563",
              margin: 0,
            }}
          >
            {riskAssessment && certaintyExplanation
              ? certaintyExplanation
              : "Certainty is limited when concentration, formulation details, or usage instructions are not fully disclosed."}
          </p>
        </section>

        <hr style={divider} />

        {/* Disclaimer */}
        <section
          style={{
            paddingTop: 24,
          }}
        >
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "#6b7280",
              margin: 0,
            }}
          >
            This is a general, dermatology-informed safety screen. It is not a
            diagnosis, treatment plan, or substitute for professional medical
            advice.
          </p>
        </section>
      </div>
    </main>
  );
}
