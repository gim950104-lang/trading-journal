import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// POST (저장)
export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인 필요" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 🔥 유저 없으면 자동 생성
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id },
    });

    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        name: body.name || "",
        side: body.side || "",
        price: Number(body.price || 0),
        qty: Number(body.qty || 0),
        memo: body.memo || "",
        date: body.date ? new Date(body.date) : new Date(),
      },
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      { error: "서버 에러 발생" },
      { status: 500 }
    );
  }
}

// GET (조회)
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json([]);
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "서버 에러 발생" },
      { status: 500 }
    );
  }
}