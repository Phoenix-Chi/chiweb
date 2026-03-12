import { NextRequest, NextResponse } from "next/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const fileIds = Array.isArray(body?.fileIds) ? body.fileIds : [];
    if (fileIds.length === 0) {
      return NextResponse.json({ deletedCount: 0 });
    }

    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const result = await caller.media.cleanTemp({ fileIds });
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/media/clean failed:", error);
    return NextResponse.json({ error: "清理失败" }, { status: 400 });
  }
}
