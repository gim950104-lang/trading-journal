import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const updatedTrade = await prisma.trade.update({
      where: {
        id,
        userId,
      },
      data: {
        name: String(body.name ?? ""),
        side: String(body.side ?? "매수"),
        date: new Date(body.date),
        price: Number(body.price),
        qty: Number(body.qty),
        memo: body.memo ? String(body.memo) : "",
      },
    });

    return NextResponse.json(updatedTrade);
  } catch (error) {
    console.error("PATCH /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "거래 수정 실패" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await prisma.trade.delete({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "거래 삭제 실패" },
      { status: 500 }
    );
  }
}