import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
