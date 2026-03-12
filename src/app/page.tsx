"use client";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#110322] to-[#2b1250] px-6 py-14">
      <Card className="mx-auto mt-12 max-w-2xl border-fuchsia-400/40 bg-slate-900/75">
        <h1 className="text-center text-3xl font-bold tracking-wide text-white">个人成长记录型博客</h1>
        <p className="mt-4 text-center text-slate-300">
          以横向时间轴为主视图，支持多媒体内容管理、节点搜索、权限控制等功能。
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push("/timeline")}>开始记录</Button>
          <Button variant="secondary" onClick={() => router.push("/timeline")}>
            浏览时间轴
          </Button>
        </div>
      </Card>
    </div>
  );
}
