"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export function Toggle({
  pressed,
  onPressedChange,
  className,
  children,
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      className={cn(
        "relative inline-flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500",
        className
      )}
      onClick={() => onPressedChange(!pressed)}
      {...props}
    >
      {/* Background pill */}
      <div
        className={cn(
          "w-10 h-6 rounded-full transition-colors",
          pressed
            ? "bg-gradient-to-r from-pink-500 to-purple-600"
            : "bg-zinc-800"
        )}
      />
      {/* Sliding circle */}
      <span
        className={cn(
          "absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
          pressed ? "translate-x-4" : "translate-x-0"
        )}
      />
      {/* Optional children inside */}
      {children}
    </button>
  );
}
