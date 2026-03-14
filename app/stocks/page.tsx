"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Trade = {
  id: string;
  name: string;
  side: string;
  date: string;
  price: string;
  qty: string;
};

const STORAGE_KEY = "trades";

export default function StocksPage() {
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

  const stocks = useMemo(() => {
    const names = trades.map((trade) => trade.name.trim()).filter(Boolean);
    return [...new Set(names)];
  }, [trades]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          종목 분석
        </h1>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {stocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
              저장된 종목이 없어.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {stocks.map((name) => (
                <Link
                  key={name}
                  href={`/stocks/${encodeURIComponent(name)}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
                >
                  <div className="text-2xl font-bold text-slate-900">{name}</div>
                  <div className="mt-2 text-sm text-slate-500">상세 분석 보기</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}