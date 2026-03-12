import { NextRequest, NextResponse } from "next/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

function toClientNode(node: {
  media: Array<{
    id: string;
    url: string;
    type: string;
    thumbnailUrl: string | null;
    size: number;
    width: number | null;
    height: number | null;
  }>;
}): unknown {
  return {
    ...node,
    media: node.media.map((media) => ({
      fileId: media.id,
      url: media.url,
      type: media.type.toLowerCase(),
      thumbnail: media.thumbnailUrl ?? undefined,
      size: media.size,
      width: media.width ?? undefined,
      height: media.height ?? undefined,
    })),
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const nodes = await caller.node.list({ q });
    return NextResponse.json(nodes.map((node) => toClientNode(node)));
  } catch (error) {
    console.error("GET /api/nodes failed:", error);
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const node = await caller.node.create(body);
    return NextResponse.json(toClientNode(node), { status: 201 });
  } catch (error) {
    console.error("POST /api/nodes failed:", error);
    return NextResponse.json({ error: "Failed to create node" }, { status: 400 });
  }
}
