import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ POST (저장)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const trade = await prisma.trade.create({
      data: {
        userId: body.userId || "guest", // 🔥 로그인 없어도 저장 가능하게
        name: body.name,
        side: body.side,
        price: Number(body.price),
        qty: Number(body.qty),
        memo: body.memo || "",
        date: new Date(body.date),
      },
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "서버 에러 발생" },
      { status: 500 }
    );
  }
}

// ✅ GET (조회)
export async function GET(req: Request) {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "서버 에러 발생" },
      { status: 500 }
    );
  }
}