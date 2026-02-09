export default function Result() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
        You should probably avoid this if…
      </h1>

      <ul style={{ paddingLeft: 20, marginBottom: 16, lineHeight: 1.6 }}>
        <li>[Placeholder condition]</li>
        <li>[Placeholder condition]</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
        Why this can go wrong
      </h2>
      <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
        [Placeholder explanation]
      </p>

      <p>
        <strong>Confidence:</strong> High
      </p>
    </main>
  );
}

