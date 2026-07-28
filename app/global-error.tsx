"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#14b8a6", marginBottom: "0.5rem" }}>
              Sanad Academy
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Something went wrong · حدث خطأ ما
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", maxWidth: "28rem" }}>
              We hit an unexpected error. Please try again.
              <br />
              حدثت مشكلة غير متوقعة. يرجى المحاولة مرة أخرى.
            </p>
          </div>
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.75rem",
              background: "#14b8a6",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again · إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
