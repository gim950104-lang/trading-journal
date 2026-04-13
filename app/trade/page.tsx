"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Trade = {
  id: string;
  name: string;
  side: string;
  date: string;
  price: string;
  qty: string;
  memo?: string;
};

type SearchItem = {
  name: string;
  market: string;
};

const STORAGE_KEY = "trades";

export default function TradePage() {
  const { userId, isLoaded } = useAuth();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Trade>({
    id: "",
    name: "",
    side: "매수",
    date: "",
    price: "",
    qty: "",
    memo: "",
  });

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);

  useEffect(() => {
    if (!isLoaded) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTrades(JSON.parse(saved));
    }

    setLoading(false);
  }, [isLoaded]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!keyword) {
        setResults([]);
        return;
      }

      const res = await fetch(`/api/search?q=${keyword}`);
      const data = await res.json();
      setResults(data);
    };

    fetchSearch();
  }, [keyword]);

  const handleSubmit = () => {
    if (!form.name || !form.date) {
      alert("필수값 입력");
      return;
    }

    const newTrade: Trade = {
      ...form,
      id: Date.now().toString(),
    };

    const next = [newTrade, ...trades];
    setTrades(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    setForm({
      id: "",
      name: "",
      side: "매수",
      date: "",
      price: "",
      qty: "",
      memo: "",
    });

    setKeyword("");
  };

  if (!isLoaded) return <div>로딩중...</div>;

  return (
    <main className="p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">
        매매일지
      </h1>

      {/* 입력 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 relative border border-gray-100">
        <input
          className="w-full p-3 mb-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/70"
          placeholder="종목명"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setForm({ ...form, name: e.target.value });
          }}
        />

        {/* 자동완성 */}
        {results.length > 0 && (
          <div className="absolute bg-white border w-full mt-1 z-50 rounded-xl shadow max-h-60 overflow-y-auto">
            {results.map((item, i) => (
              <div
                key={i}
                className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
                onClick={() => {
                  setKeyword(item.name);
                  setForm({ ...form, name: item.name });
                  setResults([]);
                }}
              >
                <span>{item.name}</span>
                <span className="text-xs text-gray-400">
                  {item.market}
                </span>
              </div>
            ))}
          </div>
        )}

        <input
          type="date"
          className="w-full p-3 mb-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/70"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          className="w-full p-3 mb-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/70"
          placeholder="가격"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          className="w-full p-3 mb-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/70"
          placeholder="수량"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
        />

        {/* ✅ 메모 추가 */}
        <textarea
          className="w-full p-3 mb-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/70"
          placeholder="메모 (매매 이유, 느낀점)"
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="w-full p-3 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition"
        >
          저장
        </button>
      </div>

      {/* 리스트 */}
      <div>
        {trades.map((t) => (
          <div
            key={t.id}
            className="border border-gray-200 p-4 mb-3 rounded-xl shadow-sm"
          >
            <div className="font-semibold text-lg">{t.name}</div>
            <div className="text-sm text-gray-500">
              {t.date} / {t.price} / {t.qty}
            </div>
            {t.memo && (
              <div className="text-sm mt-2 text-gray-700">
                📝 {t.memo}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}