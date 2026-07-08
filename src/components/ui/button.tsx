import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[6px] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-white hover:bg-accent/90 shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-black/5": variant === "default",
            "bg-white text-[#333] hover:bg-[#f4f5f5] border border-[#d1d1d6] shadow-[0_1px_2px_rgba(0,0,0,0.05)]": variant === "outline" || variant === "secondary",
            "hover:bg-black/5 text-[#333]": variant === "ghost",
            "bg-error text-white hover:bg-error/90 shadow-[0_1px_2px_rgba(0,0,0,0.1)]": variant === "danger",
            "bg-success text-white hover:bg-success/90 shadow-[0_1px_2px_rgba(0,0,0,0.1)]": variant === "success",
            "h-7 px-3": size === "default",
            "h-6 px-2 text-[12px]": size === "sm",
            "h-9 px-6 text-[14px]": size === "lg",
            "h-7 w-7": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
