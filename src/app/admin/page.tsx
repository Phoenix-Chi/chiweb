"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminLogin() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [typed, setTyped] = useState("");
  const [hint, setHint] = useState("输入框失焦后键盘输入口令并回车");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // 监听键盘输入（仅输入框不聚焦时激活）
  React.useEffect(() => {
    if (!isListening) return;
    let buffer = "";
    const onKeyDown = (e: KeyboardEvent) => {
      if (isFocused) return; // 聚焦输入框时不监听
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        buffer += e.key;
        setTyped(buffer);
        if (buffer.length > 10) buffer = buffer.slice(-10); // 最多保留10位
      }
      if (e.key === "Enter") {
        if (buffer.toLowerCase() === "chi") {
          setHint("登录成功，正在进入管理员模式");
          setIsListening(false);
          setTyped("");
          if (timerRef.current) clearTimeout(timerRef.current);
          // 跳转到时间轴页面并设置管理员模式
          window.localStorage.setItem("isAdmin", "1");
          router.replace("/timeline");
        } else {
          setHint("特殊口令错误，已重置");
          buffer = "";
          setTyped("");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    timerRef.current = setTimeout(() => {
      setIsListening(false);
      setTyped("");
      setHint("输入超时，请重新触发特殊登录");
      window.removeEventListener("keydown", onKeyDown);
    }, 5000);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isListening, isFocused, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#18102a] px-6">
      <Card className="w-full max-w-sm border-purple-400/50 bg-[rgba(30,20,60,0.95)] p-10 shadow-[0_0_40px_#7f5fff]">
        <Input
          autoFocus
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setIsListening(false);
            setHint("输入框失焦后开始监听隐藏口令");
          }}
          onBlur={() => {
            setIsFocused(false);
            setIsListening(true);
            setTyped("");
            setHint("监听中：请键入口令并按 Enter");
          }}
          placeholder="请输入密码"
          className="mb-4 text-base"
        />
        <div className="min-h-6 text-center text-sm font-semibold text-fuchsia-300">
          {isListening ? "chi" : ""}
        </div>
        <div className="mt-2 text-center text-xs text-slate-300">{hint}</div>
        <div className="mt-1 text-center text-xs text-slate-500">{typed ? `buffer: ${typed}` : ""}</div>
        <div className="mt-4 text-center text-xs text-slate-400">
          出于安全考虑，输入框值不会用于鉴权，实际鉴权走失焦后键盘监听。
        </div>
      </Card>
    </div>
  );
}
