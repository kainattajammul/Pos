"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapMount(
  animation: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(() => {
      animation(ctx);
    }, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}
