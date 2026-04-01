import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "매매로그 | 무료 주식 매매일지 사이트",
  description:
    "로그인 없이 사용하는 주식 매매일지. 수익 그래프 자동 생성, 종목 분석 제공. 매매로그에서 쉽게 기록하세요.",
  verification: {
    google: "hBpxAX9NfbCfhGYuPLYd8ZJnS5jhJdzz0o07BwGqLxA",
  },
};

const navItems = [
  { href: "/", label: "홈" },
  { href: "/trade", label: "매매 기록" },
  { href: "/stocks", label: "종목 분석" },
  { href: "/profit", label: "수익 그래프" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          backgroundColor: "#f5f5f5",
          color: "#111827",
        }}
      >
        <ClerkProvider localization={koKR}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              backgroundColor: "white",
              borderBottom: "1px solid #e5e7eb",
              padding: "16px 24px",
            }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  color: "#111827",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                📈 매매로그
              </Link>

              <nav
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      textDecoration: "none",
                      color: "#111827",
                      backgroundColor: "#f3f4f6",
                      padding: "12px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}