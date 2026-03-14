export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 32 }}>📈 매매일지</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          매매 기록, 종목 분석, 수익 그래프를 한 번에 관리하는 웹앱
        </p>

        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <a
            href="/trade"
            style={{
              display: "block",
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              textDecoration: "none",
              color: "black",
              fontSize: 24,
              fontWeight: 700,
              backgroundColor: "#fff",
            }}
          >
            매매 기록
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: 400,
                color: "#666",
              }}
            >
              거래 입력, 저장, 삭제
            </div>
          </a>

          <a
            href="/stocks"
            style={{
              display: "block",
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              textDecoration: "none",
              color: "black",
              fontSize: 24,
              fontWeight: 700,
              backgroundColor: "#fff",
            }}
          >
            종목 분석
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: 400,
                color: "#666",
              }}
            >
              종목별 거래 내역, 손익, 1주 가격 그래프
            </div>
          </a>

          <a
            href="/profit"
            style={{
              display: "block",
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              textDecoration: "none",
              color: "black",
              fontSize: 24,
              fontWeight: 700,
              backgroundColor: "#fff",
            }}
          >
            수익 그래프
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: 400,
                color: "#666",
              }}
            >
              실제 거래 금액(가격 × 수량) 기준 그래프
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}