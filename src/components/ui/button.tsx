"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "danger";
}

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" && "bg-fuchsia-500 text-white hover:bg-fuchsia-400",
        variant === "secondary" && "bg-slate-700 text-white hover:bg-slate-600",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        className,
      )}
      {...props}
    />
  );
}
