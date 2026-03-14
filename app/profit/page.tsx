"use client";

import { useEffect, useMemo, useState } from "react";

type Trade = {
  id: string;
  name: string;
  side: string;
  date: string;
  price: string;
  qty: string;
  memo?: string;
};

const STORAGE_KEY = "trades";

function parseNumber(value: string) {
  return (
    Number(
      String(value)
        .replaceAll(",", "")
        .replaceAll("원", "")
        .replaceAll("주", "")
        .trim()
    ) || 0
  );
}

function formatMoney(value: number) {
  return `${value.toLocaleString()}원`;
}

function formatShortDate(date: string) {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return date;
  return `${parts[1]}/${parts[2]}`;
}

export default function ProfitPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedStock, setSelectedStock] = useState("전체");
  const [range, setRange] = useState("전체");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        const normalized = Array.isArray(parsed)
          ? parsed.map((item: any) => ({
              id: String(item.id ?? ""),
              name: String(item.name ?? ""),
              side: String(item.side ?? "매수"),
              date: String(item.date ?? ""),
              price: String(item.price ?? ""),
              qty: String(item.qty ?? ""),
              memo: String(item.memo ?? ""),
            }))
          : [];

        setTrades(normalized);
      } catch {
        setTrades([]);
      }
    }
  }, []);

  const stockList = useMemo(() => {
    const names = trades
      .map((trade) => String(trade.name || "").trim())
      .filter(Boolean);

    return ["전체", ...Array.from(new Set(names))];
  }, [trades]);

  const filteredTrades = useMemo(() => {
    let result =
      selectedStock === "전체"
        ? [...trades]
        : trades.filter(
            (trade) => String(trade.name || "").trim() === selectedStock
          );

    result.sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (range === "전체") return result;

    const days = range === "7일" ? 7 : 30;
    const now = new Date();

    return result.filter((trade) => {
      if (!trade.date) return false;

      const tradeDate = new Date(trade.date);
      if (Number.isNaN(tradeDate.getTime())) return false;

      const diffMs = now.getTime() - tradeDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      return diffDays <= days;
    });
  }, [trades, selectedStock, range]);

  const {
    totalBuy,
    totalSell,
    totalProfit,
    dailyData,
    cumulativeData,
    maxDailyAmount,
    minCumulative,
    maxCumulative,
  } = useMemo(() => {
    let buy = 0;
    let sell = 0;

    const dailyMap = new Map<string, { date: string; buy: number; sell: number }>();
    const cumulativeRaw: { date: string; profit: number }[] = [];

    let runningProfit = 0;

    for (const trade of filteredTrades) {
      const price = parseNumber(trade.price);
      const qty = parseNumber(trade.qty);
      const amount = price * qty;
      const date = trade.date || "날짜없음";

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, buy: 0, sell: 0 });
      }

      const current = dailyMap.get(date)!;

      if (trade.side === "매수") {
        buy += amount;
        current.buy += amount;
        runningProfit -= amount;
      } else {
        sell += amount;
        current.sell += amount;
        runningProfit += amount;
      }

      cumulativeRaw.push({
        date,
        profit: runningProfit,
      });
    }

    const dailyArr = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const cumulativeMap = new Map<string, number>();
    for (const item of cumulativeRaw) {
      cumulativeMap.set(item.date, item.profit);
    }

    const cumulativeArr = Array.from(cumulativeMap.entries())
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const maxDaily = Math.max(
      ...dailyArr.flatMap((item) => [item.buy, item.sell]),
      1
    );

    const minCum = Math.min(...cumulativeArr.map((item) => item.profit), 0);
    const maxCum = Math.max(...cumulativeArr.map((item) => item.profit), 0);

    return {
      totalBuy: buy,
      totalSell: sell,
      totalProfit: sell - buy,
      dailyData: dailyArr,
      cumulativeData: cumulativeArr,
      maxDailyAmount: maxDaily,
      minCumulative: minCum,
      maxCumulative: maxCum,
    };
  }, [filteredTrades]);

  const recentTrades = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 5);
  }, [filteredTrades]);

  const barMaxHeight = 220;
  const cumulativeRange = Math.max(maxCumulative - minCumulative, 1);
  const svgWidth = Math.max(cumulativeData.length * 140, 1100);

  const cumulativePoints = cumulativeData.map((item, index) => {
    const x =
      cumulativeData.length === 1
        ? 60
        : (index / (cumulativeData.length - 1)) * (svgWidth - 120) + 60;

    const normalized = (item.profit - minCumulative) / cumulativeRange;
    const y = 260 - normalized * 220 + 20;

    return { ...item, x, y };
  });

  const linePath = cumulativePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const zeroY = 260 - ((0 - minCumulative) / cumulativeRange) * 220 + 20;

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900">
          수익 그래프
        </h1>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 outline-none"
          >
            {stockList.map((stock) => (
              <option key={stock} value={stock}>
                {stock}
              </option>
            ))}
          </select>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 outline-none"
          >
            <option value="전체">전체</option>
            <option value="7일">최근 7일</option>
            <option value="30일">최근 30일</option>
          </select>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-400">총 매수 금액</div>
            <div className="mt-3 text-4xl font-extrabold text-slate-900">
              {formatMoney(totalBuy)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-400">총 매도 금액</div>
            <div className="mt-3 text-4xl font-extrabold text-slate-900">
              {formatMoney(totalSell)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-400">총 손익</div>
            <div
              className={`mt-3 text-4xl font-extrabold ${
                totalProfit >= 0 ? "text-red-500" : "text-blue-500"
              }`}
            >
              {formatMoney(totalProfit)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">거래 금액 그래프</h2>
            <p className="mt-2 text-slate-500">
              날짜별로 매수 금액과 매도 금액을 나눠서 보여줘
            </p>

            {dailyData.length === 0 ? (
              <p className="mt-8 text-slate-500">표시할 거래 기록이 없어.</p>
            ) : (
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <div className="mb-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="inline-block h-3 w-3 rounded-full bg-slate-900" />
                    매수
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                    매도
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex min-w-max items-end gap-8 px-4 pb-4 pt-10">
                    {dailyData.map((item) => {
                      const buyHeight = Math.max(
                        (item.buy / maxDailyAmount) * barMaxHeight,
                        item.buy > 0 ? 18 : 0
                      );
                      const sellHeight = Math.max(
                        (item.sell / maxDailyAmount) * barMaxHeight,
                        item.sell > 0 ? 18 : 0
                      );

                      return (
                        <div
                          key={item.date}
                          className="flex w-[120px] shrink-0 flex-col items-center"
                        >
                          <div className="flex h-[260px] items-end gap-3">
                            <div className="flex flex-col items-center justify-end">
                              <div className="mb-2 h-5 text-[11px] font-medium text-slate-500">
                                {item.buy > 0 ? item.buy.toLocaleString() : ""}
                              </div>
                              <div
                                className="w-10 rounded-t-xl bg-slate-900"
                                style={{ height: `${buyHeight}px` }}
                              />
                            </div>

                            <div className="flex flex-col items-center justify-end">
                              <div className="mb-2 h-5 text-[11px] font-medium text-slate-500">
                                {item.sell > 0 ? item.sell.toLocaleString() : ""}
                              </div>
                              <div
                                className="w-10 rounded-t-xl bg-blue-500"
                                style={{ height: `${sellHeight}px` }}
                              />
                            </div>
                          </div>

                          <div className="mt-3 text-sm font-medium text-slate-500">
                            {formatShortDate(item.date)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">누적 손익 그래프</h2>
            <p className="mt-2 text-slate-500">
              날짜가 지나면서 전체 손익이 어떻게 변했는지 선으로 보여줘
            </p>

            {cumulativeData.length === 0 ? (
              <p className="mt-8 text-slate-500">표시할 거래 기록이 없어.</p>
            ) : (
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <div className="overflow-x-auto">
                  <svg width={svgWidth} height={340} className="block">
                    <line
                      x1="40"
                      x2={svgWidth - 40}
                      y1={zeroY}
                      y2={zeroY}
                      stroke="#cbd5e1"
                      strokeDasharray="6 6"
                    />

                    <path
                      d={linePath}
                      fill="none"
                      stroke={totalProfit >= 0 ? "#ef4444" : "#2563eb"}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {cumulativePoints.map((point, index) => {
                      const positive = point.profit >= 0;
                      const showLabel =
                        cumulativePoints.length <= 12 ||
                        index === 0 ||
                        index === cumulativePoints.length - 1 ||
                        index % 2 === 0;

                      return (
                        <g key={`${point.date}-${point.x}-${index}`}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill={positive ? "#ef4444" : "#2563eb"}
                          />

                          {showLabel && (
                            <>
                              <text
                                x={point.x}
                                y={point.y - 14}
                                textAnchor="middle"
                                fontSize="12"
                                fill={positive ? "#ef4444" : "#2563eb"}
                                fontWeight="700"
                              >
                                {point.profit.toLocaleString()}
                              </text>
                              <text
                                x={point.x}
                                y={310}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#64748b"
                              >
                                {formatShortDate(point.date)}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">최근 거래 메모</h2>
            <p className="mt-2 text-slate-500">
              선택한 종목과 기간 기준으로 최근 거래 메모를 보여줘
            </p>

            {recentTrades.length === 0 ? (
              <p className="mt-8 text-slate-500">표시할 거래 기록이 없어.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {trade.name}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          trade.side === "매수"
                            ? "bg-slate-900 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {trade.side}
                      </span>

                      <span className="text-sm text-slate-500">{trade.date}</span>
                    </div>

                    <div className="mt-2 text-sm text-slate-500">
                      {trade.price}원 / {trade.qty}주
                    </div>

                    <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      {trade.memo ? trade.memo : "메모 없음"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}