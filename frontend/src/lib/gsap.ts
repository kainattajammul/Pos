import gsap from "gsap";

export const easings = {
  smooth: "power3.out",
  bounce: "back.out(1.2)",
  snap: "power2.inOut",
} as const;

export function fadeUp(
  targets: gsap.TweenTarget,
  options?: gsap.TweenVars,
) {
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

export function staggerChildren(
  parent: gsap.TweenTarget,
  childSelector: string,
  options?: gsap.TweenVars,
) {
  return gsap.from(`${typeof parent === "string" ? parent : ""} ${childSelector}`, {
    opacity: 0,
    y: 16,
    duration: 0.5,
    stagger: 0.06,
    ease: easings.smooth,
    ...options,
  });
}

export function animateCounter(
  element: HTMLElement,
  endValue: number,
  duration = 1.2,
) {
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
