import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "매매일지",
  description: "매매 기록, 종목 분석, 수익 그래프를 관리하는 웹앱",
};

const navItems = [
  { href: "/", label: "홈" },
  { href: "/trade", label: "매매 기록" },
  { href: "/stocks", label: "종목 분석" },
  { href: "/profit", label: "수익 그래프" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              📈 매매일지
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
      </body>
    </html>
  );
}