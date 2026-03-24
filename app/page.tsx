import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
        fontFamily: "sans-serif",
      }}
    >
      {/* 로그인 영역 */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto 20px auto",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {userId ? (
          <UserButton />
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <SignInButton mode="modal">
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                로그인
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  background: "#111",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                회원가입
              </button>
            </SignUpButton>
          </div>
        )}
      </div>

      {/* 🔥 메인 카드 */}
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
        {/* 🔥 SEO 핵심 (제일 중요) */}
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
          매매로그 - 무료 주식 매매일지
        </h1>

        <p style={{ color: "#666", marginTop: 8 }}>
          매매로그는 주식 매매일지를 기록하고 수익 그래프를 자동으로 분석해주는 서비스입니다.
          로그인 없이 바로 사용 가능합니다.
        </p>

        {/* 상태 */}
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            fontSize: 14,
          }}
        >
          로그인 상태: {userId ? "로그인됨" : "로그인 안됨"}
          <br />
          userId: {userId ?? "없음"}
        </div>

        {/* 기능 */}
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
            <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
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
            <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
              종목별 거래 내역, 손익, 그래프 제공
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
            <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
              실제 거래 금액 기준 그래프
            </div>
          </a>
        </div>

        {/* 🔥 SEO 추가 설명 */}
        <div style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>
            매매로그 기능 소개
          </h2>
          <p style={{ marginTop: 10, color: "#555" }}>
            매매로그는 주식 매매일지를 효율적으로 관리할 수 있도록 도와주는 서비스입니다.
            매매 기록 저장, 종목 분석, 수익 그래프까지 한 번에 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 문의 */}
      <div
        style={{
          maxWidth: 720,
          margin: "40px auto 0 auto",
          padding: "16px 20px",
          backgroundColor: "white",
          borderRadius: 12,
          textAlign: "center",
          fontSize: "14px",
          color: "#555",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>
          문의 / 피드백
        </div>
        <div>불편한 점이나 개선 의견이 있으면 연락주세요.</div>
        <a
          href="mailto:official.maemaelog@gmail.com"
          style={{
            display: "inline-block",
            marginTop: 8,
            color: "#2563eb",
            fontWeight: "bold",
          }}
        >
          official.maemaelog@gmail.com
        </a>
      </div>
    </div>
  );
}