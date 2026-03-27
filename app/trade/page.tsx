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

const STORAGE_KEY = "trades";

export default function TradePage() {
  const { userId, isLoaded } = useAuth();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    side: "매수",
    date: "",
    price: "",
    qty: "",
    memo: "",
  });

  useEffect(() => {
    if (!isLoaded) return;

    const fetchTrades = async () => {
      try {
        setLoading(true);

        if (!userId) {
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
          } else {
            setTrades([]);
          }

          return;
        }

        // ✅ userId 포함해서 가져오기
        const res = await fetch(`/api/trades?userId=${userId}`, {
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
      } catch (error: any) {
        console.error(error);
        alert(error?.message || "거래 기록을 불러오는 중 오류가 발생했어.");
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [isLoaded, userId]);

  const saveGuestTrades = (nextTrades: Trade[]) => {
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

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.date || !form.price || !form.qty) {
      alert("종목명, 날짜, 가격, 수량은 꼭 입력해줘");
      return;
    }

    try {
      setSaving(true);

      if (!userId) {
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

          saveGuestTrades(nextTrades);
          resetForm();
          alert("수정 완료");
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

        saveGuestTrades([newTrade, ...trades]);
        resetForm();
        alert("저장 완료");
        return;
      }

      if (editingId) {
        const res = await fetch(`/api/trades/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            side: form.side,
            date: form.date,
            price: Number(form.price),
            qty: Number(form.qty),
            memo: form.memo.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "거래 수정 실패");
        }

        setTrades((prev) =>
          prev.map((trade) =>
            trade.id === editingId
              ? {
                  id: String(data.id ?? ""),
                  name: String(data.name ?? ""),
                  side: String(data.side ?? "매수"),
                  date: data.date ? String(data.date).slice(0, 10) : "",
                  price: String(data.price ?? ""),
                  qty: String(data.qty ?? ""),
                  memo: String(data.memo ?? ""),
                }
              : trade
          )
        );

        resetForm();
        alert("수정 완료");
        return;
      }

      // ✅ userId 추가 (핵심)
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          name: form.name.trim(),
          side: form.side,
          date: form.date,
          price: Number(form.price),
          qty: Number(form.qty),
          memo: form.memo.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "거래 저장 실패");
      }

      const newTrade: Trade = {
        id: String(data.id ?? ""),
        name: String(data.name ?? ""),
        side: String(data.side ?? "매수"),
        date: data.date ? String(data.date).slice(0, 10) : "",
        price: String(data.price ?? ""),
        qty: String(data.qty ?? ""),
        memo: String(data.memo ?? ""),
      };

      setTrades((prev) => [newTrade, ...prev]);
      resetForm();
      alert("저장 완료");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "처리 중 오류가 발생했어.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("이 거래 기록을 삭제할까?");
    if (!ok) return;

    try {
      setDeletingId(id);

      if (!userId) {
        const nextTrades = trades.filter((trade) => trade.id !== id);
        saveGuestTrades(nextTrades);

        if (editingId === id) {
          resetForm();
        }

        alert("삭제 완료");
        return;
      }

      const res = await fetch(`/api/trades/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "거래 삭제 실패");
      }

      setTrades((prev) => prev.filter((trade) => trade.id !== id));

      if (editingId === id) {
        resetForm();
      }

      alert("삭제 완료");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "삭제 중 오류가 발생했어.");
    } finally {
      setDeletingId(null);
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

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            불러오는 중...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          매매 기록
        </h1>

        {!userId && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            현재 게스트 모드야. 로그인하지 않으면 기록은 이 브라우저에만 저장돼.
          </div>
        )}

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
                disabled={saving}
                className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${
                  editingId
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-slate-900 hover:bg-slate-800"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {saving ? "처리 중..." : editingId ? "수정 완료" : "저장"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">저장된 기록</h2>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
                불러오는 중...
              </div>
            ) : trades.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                <p className="mb-2 text-base font-medium text-slate-700">
                  아직 매매 기록이 없습니다.
                </p>
                <p className="text-sm text-slate-500">
                  왼쪽 입력창에서 첫 거래를 추가해보세요.
                </p>
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
                          disabled={deletingId === trade.id}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === trade.id ? "삭제 중..." : "삭제"}
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