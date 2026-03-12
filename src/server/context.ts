import { prisma } from "@/lib/server/db/client";

export interface TrpcContext {
  prisma: typeof prisma;
}

export async function createContext(): Promise<TrpcContext> {
  return { prisma };
}
