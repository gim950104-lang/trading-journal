import { NextResponse } from "next/server";

// 🇰🇷 한국 종목 (일단 시작용 → 나중에 JSON 파일로 분리 추천)
const koreaStocks = [
  "삼성전자",
  "삼성SDI",
  "삼성바이오로직스",
  "SK하이닉스",
  "LG에너지솔루션",
  "카카오",
  "NAVER",
  "현대차",
  "기아",
  "셀트리온",
  "POSCO홀딩스",
  "LG화학",
  "한화에어로스페이스",
  "현대모비스",
  "KB금융",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json([]);
  }

  // 🇰🇷 한국 종목 검색 (최대 10개 제한)
  const koreaResult = koreaStocks
    .filter((item) => item.includes(q))
    .slice(0, 10)
    .map((name) => ({
      name,
      market: "KR",
    }));

  // 🌍 해외 종목 검색 (Yahoo Finance)
  let globalResult: any[] = [];

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}`
    );

    const data = await res.json();

    globalResult =
      data.quotes?.slice(0, 10).map((item: any) => ({
        name: item.shortname || item.longname || item.symbol,
        symbol: item.symbol,
        market: item.exchange || "US",
      })) || [];
  } catch (error) {
    console.error("Yahoo API error:", error);
  }

  // 🔥 중복 제거 (중요)
  const combined = [...koreaResult, ...globalResult];

  const unique = Array.from(
    new Map(combined.map((item) => [item.name, item])).values()
  );

  return NextResponse.json(unique);
}