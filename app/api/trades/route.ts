import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

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
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const trades = await prisma.trade.findMany({
    where: {
      userId: userId || undefined,
    },
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(trades);
}