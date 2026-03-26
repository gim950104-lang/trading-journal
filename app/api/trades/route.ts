import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔥 userId 없으면 저장 막기
    if (!body.userId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.create({
      data: {
        userId: body.userId,
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json([]);
    }

    const trades = await prisma.trade.findMany({
      where: {
        userId,
      },
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