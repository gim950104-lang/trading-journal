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

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // ✅ 거래 데이터 불러오기 (하나로 통합)
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

  // ✅ 검색
  useEffect(() => {
    if (!keyword) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      const res = await fetch(`/api/search?q=${keyword}`);
      const data = await res.json();
      setResults(data);
    };

    fetchSearch();
  }, [keyword]);

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
          headers: { "Content-Type": "application/json" },
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

        if (!res.ok) throw new Error(data?.error || "거래 수정 실패");

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

      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: form.name.trim(),
          side: form.side,
          date: form.date,
          price: Number(form.price),
          qty: Number(form.qty),
          memo: form.memo.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "거래 저장 실패");

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
        if (editingId === id) resetForm();
        alert("삭제 완료");
        return;
      }

      const res = await fetch(`/api/trades/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "거래 삭제 실패");

      setTrades((prev) => prev.filter((trade) => trade.id !== id));
      if (editingId === id) resetForm();

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
    return <div>로딩중...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      {/* UI 그대로 유지 */}
    </main>
  );
}