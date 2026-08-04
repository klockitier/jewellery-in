/**
 * Scroll-reveal wrapper: fades + slides content in as it enters the viewport.
 * Pure CSS transitions driven by an IntersectionObserver — no animation lib.
 * Respects prefers-reduced-motion (handled in app.css).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** delay class: reveal-delay-1 … reveal-delay-4 (0 = none) */
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

export function Reveal({ children, delay, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as "div";
  const delayClass = delay ? ` reveal-delay-${delay}` : "";
  return (
    <Tag ref={ref as never} className={`reveal${delayClass} ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
