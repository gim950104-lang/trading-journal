"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Trade = {
  id: string;
  name: string;
  side: string;
  date: string;
  price: string;
  qty: string;
};

const STORAGE_KEY = "trades";

export default function StockDetailPage() {
  const params = useParams();
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTrades(JSON.parse(saved));
      } catch {
        setTrades([]);
      }
    }
  }, []);

  const stockName = decodeURIComponent(String(params.name || "")).trim();

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => trade.name.trim() === stockName);
  }, [trades, stockName]);

  const summary = useMemo(() => {
    let buy = 0;
    let sell = 0;

    for (const trade of filteredTrades) {
      const price = Number(String(trade.price).replaceAll(",", "")) || 0;
      const qty = Number(String(trade.qty).replaceAll(",", "")) || 0;
      const amount = price * qty;

      if (trade.side === "매수") buy += amount;
      if (trade.side === "매도") sell += amount;
    }

    return {
      buy,
      sell,
      profit: sell - buy,
    };
  }, [filteredTrades]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          {stockName} 분석
        </h1>

        {filteredTrades.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-500">
            이 종목의 거래 기록이 없어.
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2 text-xl">
                <div>총 매수: {summary.buy.toLocaleString()}원</div>
                <div>총 매도: {summary.sell.toLocaleString()}원</div>
                <div className="font-bold text-slate-900">
                  손익: {summary.profit.toLocaleString()}원
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-2xl font-bold text-slate-900">{trade.side}</div>
                  <div className="mt-2 text-slate-500">
                    {trade.date} / {trade.price}원 / {trade.qty}주
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}