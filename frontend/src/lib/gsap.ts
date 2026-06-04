export const easings = {
  smooth: "power3.out",
  bounce: "back.out(1.2)",
  snap: "power2.inOut",
} as const;

export async function fadeUp(
  targets: string | object | Element | null,
  options?: Record<string, unknown>,
) {
  const { default: gsap } = await import("gsap");
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: easings.smooth,
      stagger: 0.08,
      ...options,
    },
  );
}

export async function staggerChildren(
  parent: string | object | Element | null,
  childSelector: string,
  options?: Record<string, unknown>,
) {
  const { default: gsap } = await import("gsap");
  return gsap.from(`${typeof parent === "string" ? parent : ""} ${childSelector}`, {
    opacity: 0,
    y: 16,
    duration: 0.5,
    stagger: 0.06,
    ease: easings.smooth,
    ...options,
  });
}

export async function animateCounter(
  element: HTMLElement,
  endValue: number,
  duration = 1.2,
) {
  const { default: gsap } = await import("gsap");
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: endValue,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString();
    },
  });
}
