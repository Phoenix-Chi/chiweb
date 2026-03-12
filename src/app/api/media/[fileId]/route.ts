import { NextRequest, NextResponse } from "next/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

interface Params {
  params: Promise<{ fileId: string }>;
}

export async function DELETE(_: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { fileId } = await params;
    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const result = await caller.media.deleteOne({ fileId });
    return NextResponse.json(result, { status: result.deleted ? 200 : 404 });
  } catch (error) {
    console.error("DELETE /api/media/:fileId failed:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 400 });
  }
}
