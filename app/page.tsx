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

      {/* 🔥 문의 박스 추가 */}
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
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>
          문의 / 피드백
        </div>
        <div>
          불편한 점이나 개선 의견이 있으면 아래 이메일로 보내주세요.
        </div>
        <a
          href="mailto:official.maemaelog@gmail.com"
          style={{
            display: "inline-block",
            marginTop: 8,
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          official.maemaelog@gmail.com
        </a>
      </div>
    </div>
  );
}