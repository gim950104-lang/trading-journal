import { prisma } from "@/lib/prisma";

export async function isProUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // 👉 타입 우회 + 안전 처리
  return (user as any)?.plan === "PRO";
}