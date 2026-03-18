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

type StockDataItem = {
  name: string;
  buy: number;
  sell: number;
};

type SellDetailItem = {
  name: string;
  amount: number;
  qty: number;
};

type CumulativeDataItem = {
  date: string;
  profit: number;
  details: SellDetailItem[];
};

type HoveredTooltip = {
  x: number;
  y: number;
  point: CumulativeDataItem;
} | null;

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
  const rounded = Math.round(value);
  return `${rounded.toLocaleString()}원`;
}

function formatShortDate(date: string) {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return date;
  return `${parts[1]}/${parts[2]}`;
}

function formatFullDate(date: string) {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return date;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export default function ProfitPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState("전체");
  const [range, setRange] = useState("전체");
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredTooltip>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/trades", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "거래 기록 조회 실패");
        }

        const normalized = Array.isArray(data)
          ? data.map((item: any) => ({
              id: String(item.id ?? ""),
              name: String(item.name ?? ""),
              side: String(item.side ?? "매수"),
              date: item.date ? String(item.date).slice(0, 10) : "",
              price: String(item.price ?? ""),
              qty: String(item.qty ?? ""),
              memo: String(item.memo ?? ""),
            }))
          : [];

        setTrades(normalized);
      } catch (error) {
        console.error(error);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
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
    stockData,
    cumulativeData,
    maxStockAmount,
    minCumulative,
    maxCumulative,
  } = useMemo(() => {
    let buy = 0;
    let sell = 0;

    const stockMap = new Map<string, StockDataItem>();
    const positionMap = new Map<string, { qty: number; avg: number }>();
    const profitByDateMap = new Map<
      string,
      {
        total: number;
        details: SellDetailItem[];
      }
    >();

    for (const trade of filteredTrades) {
      const price = parseNumber(trade.price);
      const qty = parseNumber(trade.qty);
      const amount = price * qty;
      const date = trade.date || "날짜없음";
      const stockName = String(trade.name || "").trim() || "종목없음";

      if (!stockMap.has(stockName)) {
        stockMap.set(stockName, {
          name: stockName,
          buy: 0,
          sell: 0,
        });
      }

      if (!positionMap.has(stockName)) {
        positionMap.set(stockName, {
          qty: 0,
          avg: 0,
        });
      }

      const stock = stockMap.get(stockName)!;
      const position = positionMap.get(stockName)!;

      if (trade.side === "매수") {
        buy += amount;
        stock.buy += amount;

        const totalCost = position.avg * position.qty + price * qty;
        const nextQty = position.qty + qty;

        position.qty = nextQty;
        position.avg = nextQty > 0 ? totalCost / nextQty : 0;
      } else {
        sell += amount;
        stock.sell += amount;

        const sellQty = Math.min(qty, position.qty);
        const realizedProfit = (price - position.avg) * sellQty;

        position.qty = Math.max(position.qty - sellQty, 0);

        if (position.qty === 0) {
          position.avg = 0;
        }

        if (!profitByDateMap.has(date)) {
          profitByDateMap.set(date, {
            total: 0,
            details: [],
          });
        }

        const current = profitByDateMap.get(date)!;
        current.total += realizedProfit;
        current.details.push({
          name: stockName,
          amount: realizedProfit,
          qty: sellQty,
        });
      }
    }

    const stockArr = Array.from(stockMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const sortedProfitByDate = Array.from(profitByDateMap.entries()).sort(
      (a, b) => a[0].localeCompare(b[0])
    );

    let runningProfit = 0;
    const cumulativeArr: CumulativeDataItem[] = sortedProfitByDate.map(
      ([date, value]) => {
        runningProfit += value.total;

        return {
          date,
          profit: runningProfit,
          details: value.details,
        };
      }
    );

    const maxStock = Math.max(
      ...stockArr.flatMap((item) => [item.buy, item.sell]),
      1
    );

    const minCum = Math.min(...cumulativeArr.map((item) => item.profit), 0);
    const maxCum = Math.max(...cumulativeArr.map((item) => item.profit), 0);

    return {
      totalBuy: buy,
      totalSell: sell,
      totalProfit: sell - buy,
      stockData: stockArr,
      cumulativeData: cumulativeArr,
      maxStockAmount: maxStock,
      minCumulative: minCum,
      maxCumulative: maxCum,
    };
  }, [filteredTrades]);

  const recentTrades = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 5);
  }, [filteredTrades]);

  const svgWidth = Math.max(cumulativeData.length * 160, 1100);
  const chartHeight = 260;
  const cumulativeRange = Math.max(maxCumulative - minCumulative, 1);

  const cumulativePoints = cumulativeData.map((item, index) => {
    const x =
      cumulativeData.length === 1
        ? 60
        : (index / (cumulativeData.length - 1)) * (svgWidth - 120) + 60;

    const normalized = (item.profit - minCumulative) / cumulativeRange;
    const y = chartHeight - normalized * 180 + 20;

    return { ...item, x, y };
  });

  const linePath = cumulativePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const zeroY =
    chartHeight - ((0 - minCumulative) / cumulativeRange) * 180 + 20;

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
            <h2 className="text-2xl font-bold text-slate-900">종목별 거래 금액</h2>
            <p className="mt-2 text-slate-500">
              종목별로 매수 금액과 매도 금액을 묶어서 보여줘
            </p>

            {loading ? (
              <p className="mt-8 text-slate-500">불러오는 중...</p>
            ) : stockData.length === 0 ? (
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
                  <div className="flex min-w-max items-end gap-10 px-4 pb-4 pt-10">
                    {stockData.map((item) => {
                      const buyHeight = Math.max(
                        (item.buy / maxStockAmount) * 220,
                        item.buy > 0 ? 18 : 0
                      );
                      const sellHeight = Math.max(
                        (item.sell / maxStockAmount) * 220,
                        item.sell > 0 ? 18 : 0
                      );

                      const stockProfit = item.sell - item.buy;

                      return (
                        <div
                          key={item.name}
                          className="flex w-[180px] shrink-0 flex-col items-center"
                        >
                          <div className="flex h-[260px] items-end gap-4">
                            <div className="flex flex-col items-center justify-end">
                              <div className="mb-2 h-5 text-[11px] font-medium text-slate-500">
                                {item.buy > 0 ? item.buy.toLocaleString() : ""}
                              </div>
                              <div
                                className="w-14 rounded-t-xl bg-slate-900"
                                style={{ height: `${buyHeight}px` }}
                              />
                            </div>

                            <div className="flex flex-col items-center justify-end">
                              <div className="mb-2 h-5 text-[11px] font-medium text-slate-500">
                                {item.sell > 0 ? item.sell.toLocaleString() : ""}
                              </div>
                              <div
                                className="w-14 rounded-t-xl bg-blue-500"
                                style={{ height: `${sellHeight}px` }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 text-base font-bold text-slate-800">
                            {item.name}
                          </div>
                          <div
                            className={`mt-1 text-sm font-semibold ${
                              stockProfit >= 0 ? "text-red-500" : "text-blue-500"
                            }`}
                          >
                            손익 {stockProfit >= 0 ? "+" : ""}
                            {stockProfit.toLocaleString()}원
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
            <h2 className="text-2xl font-bold text-slate-900">누적 실현 손익 그래프</h2>
            <p className="mt-2 text-slate-500">
              매도 시점 기준으로 실현된 손익을 날짜 순서대로 누적해서 보여줘
            </p>

            {loading ? (
              <p className="mt-8 text-slate-500">불러오는 중...</p>
            ) : cumulativeData.length === 0 ? (
              <p className="mt-8 text-slate-500">표시할 매도 기록이 없어.</p>
            ) : (
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <div className="overflow-x-auto">
                  <svg
                    width={svgWidth}
                    height={360}
                    className="block"
                    onMouseLeave={() => setHoveredTooltip(null)}
                  >
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
                      stroke="#e11d48"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {cumulativePoints.map((point, index) => {
                      const positive = point.profit >= 0;
                      const pointColor = positive ? "#ef4444" : "#2563eb";
                      const showLabel =
                        cumulativePoints.length <= 10 ||
                        index === 0 ||
                        index === cumulativePoints.length - 1 ||
                        index % 2 === 0;

                      return (
                        <g key={`${point.date}-${point.x}-${index}`}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill={pointColor}
                          />

                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="18"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={(e) =>
                              setHoveredTooltip({
                                x: e.clientX,
                                y: e.clientY,
                                point,
                              })
                            }
                            onMouseMove={(e) =>
                              setHoveredTooltip({
                                x: e.clientX,
                                y: e.clientY,
                                point,
                              })
                            }
                          />

                          {showLabel && (
                            <>
                              <text
                                x={point.x}
                                y={point.y - 18}
                                textAnchor="middle"
                                fontSize="12"
                                fill={pointColor}
                                fontWeight="700"
                              >
                                {formatMoney(point.profit)}
                              </text>
                              <text
                                x={point.x}
                                y={325}
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

            {loading ? (
              <p className="mt-8 text-slate-500">불러오는 중...</p>
            ) : recentTrades.length === 0 ? (
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

      {hoveredTooltip && (
        <div
          className="pointer-events-none fixed z-[9999] w-[260px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
          style={{
            left: Math.min(hoveredTooltip.x + 16, window.innerWidth - 280),
            top: Math.max(hoveredTooltip.y - 20, 16),
          }}
        >
          <div className="text-sm font-bold text-slate-900">
            {formatFullDate(hoveredTooltip.point.date)}
          </div>

          <div
            className={`mt-1 text-sm font-bold ${
              hoveredTooltip.point.profit >= 0 ? "text-red-500" : "text-blue-500"
            }`}
          >
            누적 {formatMoney(hoveredTooltip.point.profit)}
          </div>

          <div className="mt-3 text-xs font-semibold text-slate-400">
            해당 날짜 실현 손익
          </div>

          <div className="mt-2 space-y-1">
            {hoveredTooltip.point.details.map((detail, index) => (
              <div
                key={`${hoveredTooltip.point.date}-${detail.name}-${index}`}
                className="flex items-center justify-between gap-3 text-xs text-slate-600"
              >
                <span className="truncate">{detail.name}</span>
                <span
                  className={
                    detail.amount >= 0
                      ? "shrink-0 font-semibold text-red-500"
                      : "shrink-0 font-semibold text-blue-500"
                  }
                >
                  {formatMoney(detail.amount)} · {detail.qty}주
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}