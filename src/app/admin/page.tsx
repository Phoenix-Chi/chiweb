"use client";
import React, { useRef, useState } from "react";
import { Input, message } from "antd";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [inputValue, setInputValue] = useState("");
  const [focus, setFocus] = useState(false);
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // 监听键盘输入（仅输入框不聚焦时激活）
  React.useEffect(() => {
    if (!listening) return;
    let buffer = "";
    const onKeyDown = (e: KeyboardEvent) => {
      if (focus) return; // 聚焦输入框时不监听
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        buffer += e.key;
        setTyped(buffer);
        if (buffer.length > 10) buffer = buffer.slice(-10); // 最多保留10位
      }
      if (e.key === "Enter") {
        if (buffer.toLowerCase() === "chi") {
          message.success("登录成功，进入管理员模式");
          setListening(false);
          setTyped("");
          if (timerRef.current) clearTimeout(timerRef.current);
          // 跳转到时间轴页面并设置管理员模式
          window.localStorage.setItem("isAdmin", "1");
          router.replace("/timeline");
        } else {
          message.error("特殊口令错误，已重置");
          buffer = "";
          setTyped("");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    timerRef.current = setTimeout(() => {
      setListening(false);
      setTyped("");
      message.warning("超时，需重新触发特殊登录");
      window.removeEventListener("keydown", onKeyDown);
    }, 5000);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [listening, focus, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#18102a" }}>
      <div style={{ background: "rgba(30,20,60,0.95)", padding: 40, borderRadius: 16, boxShadow: "0 0 40px #7f5fff" }}>
        <Input.Password
          autoFocus
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => { setFocus(true); setListening(false); }}
          onBlur={() => { setFocus(false); setListening(true); setTyped(""); }}
          placeholder="请输入密码"
          style={{ width: 260, fontSize: 18, marginBottom: 16 }}
          onPressEnter={() => message.info("请点击输入框外后输入特殊口令")}
        />
        <div style={{ minHeight: 24, color: listening ? "#ff3ec8" : "#888", fontWeight: 600 ,textAlign: 'center'}}>
          {/* {listening ? `chi：${typed}` : ""} */}
          {listening ? `chi` : ""}
        </div>
      </div>
    </div>
  );
}
