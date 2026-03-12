import { NextRequest, NextResponse } from "next/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const unknownFile = formData.get("file");
    if (!(unknownFile instanceof File)) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
    }

    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const media = await caller.media.createTempFromFormData({
      file: unknownFile,
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error("POST /api/media failed:", error);
    return NextResponse.json({ error: "文件处理失败" }, { status: 500 });
  }
}
