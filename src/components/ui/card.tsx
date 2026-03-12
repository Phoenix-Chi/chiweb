import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl", className)}
      {...props}
    />
  );
}
