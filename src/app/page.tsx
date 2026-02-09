export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
        Check if a product may not be right for you
      </h1>
      <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
        We only flag common failure cases for actives & serums.
        If we&apos;re unsure, we&apos;ll say so.
      </p>

      <input
        placeholder="Paste product URL here"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
      />

      <button
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 999,
          border: "none",
          background: "#000",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Check product
      </button>
    </main>
  );
}

