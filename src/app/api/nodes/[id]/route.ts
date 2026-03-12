import { NextRequest, NextResponse } from "next/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

interface Params {
  params: Promise<{ id: string }>;
}

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

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const node = await caller.node.update({ id, data: body });
    return NextResponse.json(toClientNode(node));
  } catch (error) {
    console.error("PUT /api/nodes/:id failed:", error);
    return NextResponse.json({ error: "Failed to update node" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    const context = await createContext();
    const caller = appRouter.createCaller(context);
    const result = await caller.node.delete({ id });
    return NextResponse.json(result, { status: result.deleted ? 200 : 404 });
  } catch (error) {
    console.error("DELETE /api/nodes/:id failed:", error);
    return NextResponse.json({ error: "Failed to delete node" }, { status: 400 });
  }
}
