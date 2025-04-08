import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Using a type instead of an empty interface to fix the linter error
type RainbowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const RainbowButton = React.forwardRef<
  HTMLButtonElement,
  RainbowButtonProps
>(({ children, className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          isMobile 
            ? "h-9 px-3 py-1 text-sm font-bold [border:calc(0.05*1rem)_solid_transparent]" 
            : "h-11 px-8 py-2 font-bold [border:calc(0.08*1rem)_solid_transparent]",
          // before styles - modified to stay within boundaries with smaller height
          "before:absolute before:bottom-0 before:left-0 before:right-0 before:top-auto before:z-0 before:h-1 before:w-full before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
          isMobile 
            ? "before:[filter:blur(calc(0.3*1rem))]" 
            : "before:[filter:blur(calc(0.6*1rem))]",
          // light mode colors - adjusted for better text visibility
          "bg-[linear-gradient(#000000,#000000),linear-gradient(#000000_50%,rgba(0,0,0,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
          // dark mode colors
          "dark:bg-[linear-gradient(#000,#000),linear-gradient(#000_50%,rgba(0,0,0,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
          "text-white z-10 shadow-md",
          className,
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    </div>
    );
});

RainbowButton.displayName = "RainbowButton";
