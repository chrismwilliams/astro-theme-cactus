/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { type CSSProperties } from "react";
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { cn } from "src/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  background?: string;
  borderRadius?: string;
  children?: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerDuration?: string;
  shimmerSize?: string;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      background = "rgba(0, 0, 0, 1)",
      borderRadius = "100px",
      children,
      className,
      shimmerColor = "#ffffff",
      shimmerDuration = "3s",
      shimmerSize = "0.05em",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]",
          className,
        )}
        ref={ref}
        style={
          {
            "--bg": background,
            "--cut": shimmerSize,
            "--radius": borderRadius,
            "--shimmer-color": shimmerColor,
            "--speed": shimmerDuration,
            "--spread": "90deg",
          } as CSSProperties
        }
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "insert-0 absolute h-full w-full",

            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",

            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
