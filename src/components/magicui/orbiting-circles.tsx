/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { cn } from "src/utils/cn"

export default function OrbitingCircles({
  children,
  className,
  delay = 10,
  duration = 20,
  path = true,
  radius = 50,
  reverse,
}: {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  path?: boolean;
  radius?: number;
  reverse?: boolean;
}) {
  return (
    <>
      {path && (
        // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            fill="none"
            r={radius}
            strokeDasharray={"4 4"}
          />
        </svg>
      )}

      <div
        className={cn(
          "absolute flex h-full w-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10",
          { "[animation-direction:reverse]": reverse },
          className,
        )}
        style={
          {
            "--delay": -delay,
            "--duration": duration,
            "--radius": radius,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </>
  );
}
