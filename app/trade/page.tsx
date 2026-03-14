"use client";

import { useEffect, useState } from "react";

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

export default function TradePage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    side: "매수",
    date: "",
    price: "",
    qty: "",
    memo: "",
  });

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

  const saveTrades = (nextTrades: Trade[]) => {
    setTrades(nextTrades);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrades));
  };

  const resetForm = () => {
    setForm({
      name: "",
      side: "매수",
      date: "",
      price: "",
      qty: "",
      memo: "",
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.name || !form.date || !form.price || !form.qty) {
      alert("종목명, 날짜, 가격, 수량은 꼭 입력해줘");
      return;
    }

    if (editingId) {
      const nextTrades = trades.map((trade) =>
        trade.id === editingId
          ? {
              ...trade,
              name: form.name.trim(),
              side: form.side,
              date: form.date,
              price: form.price,
              qty: form.qty,
              memo: form.memo.trim(),
            }
          : trade
      );

      saveTrades(nextTrades);
      resetForm();
      return;
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      name: form.name.trim(),
      side: form.side,
      date: form.date,
      price: form.price,
      qty: form.qty,
      memo: form.memo.trim(),
    };

    saveTrades([newTrade, ...trades]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const nextTrades = trades.filter((trade) => trade.id !== id);
    saveTrades(nextTrades);

    if (editingId === id) {
      resetForm();
    }
  };

  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id);
    setForm({
      name: trade.name ?? "",
      side: trade.side ?? "매수",
      date: trade.date ?? "",
      price: trade.price ?? "",
      qty: trade.qty ?? "",
      memo: trade.memo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          매매 기록
        </h1>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? "기록 수정" : "기록 추가"}
              </h2>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  취소
                </button>
              )}
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="종목명"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value })}
              >
                <option value="매수">매수</option>
                <option value="매도">매도</option>
              </select>

              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="가격"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="수량"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />

              <textarea
                className="min-h-[120px] w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="메모"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              />

              <button
                onClick={handleSubmit}
                className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${
                  editingId
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {editingId ? "수정 완료" : "저장"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">저장된 기록</h2>

            {trades.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
                아직 저장된 거래 기록이 없어.
              </div>
            ) : (
              <div className="space-y-4">
                {trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-xl font-bold text-slate-900">
                          {trade.name}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {trade.side} / {trade.date} / {trade.price}원 / {trade.qty}주
                        </div>

                        {trade.memo && (
                          <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                            {trade.memo}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleEdit(trade)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          수정
                        </button>

                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
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