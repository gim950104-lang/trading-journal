import { prisma } from "@/lib/prisma";

export async function isProUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.plan === "PRO";
}