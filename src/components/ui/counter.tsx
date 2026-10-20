"use client";

import * as React from "react";

/**
 * Counts a metric up on mount. Screen readers get the final value immediately;
 * the animation is decorative and respects reduced-motion preferences.
 */
export function Counter({
  value,
  duration = 850,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <>
      <span className={className} aria-hidden>
        {Math.round(display).toLocaleString("en-GB")}
      </span>
      <span className="sr-only">{value.toLocaleString("en-GB")}</span>
    </>
  );
}
