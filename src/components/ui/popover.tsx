"use client";
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 rounded-md border border-white/10 bg-black p-4 text-sm text-white shadow-md outline-none",
      className
    )}
    {...props}
  />
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
