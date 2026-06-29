import { useEffect, useRef, useState } from "react";

export interface UseScrollHideOptions {
  /**
   * When true, forces the element to stay visible regardless of scroll.
   * Useful for modals, focused inputs, etc.
   */
  inhibit?: boolean;

  /** Minimum scroll distance (px) from the top before hiding is allowed. Default: 40. */
  topThreshold?: number;

  /** Minimum scroll distance (px) from the top where hiding kicks in. Default: 80. */
  hideThreshold?: number;

  /** Minimum scroll delta (px) to register as intentional scroll. Default: 10. */
  minDelta?: number;
}

export interface UseScrollHideReturn {
  /** True when the element should be hidden (user scrolled down). */
  hidden: boolean;
}

/**
 * useScrollHide — hides an element when the user scrolls down and reveals
 * it again when they scroll up.
 *
 * @returns `{ hidden }` — apply a translate transform based on this value.
 *
 * @example
 * const { hidden } = useScrollHide();
 * // Slide up (navbar): hidden ? "-translate-y-full" : "translate-y-0"
 * // Slide right (sidebar pill): hidden ? "translate-x-full" : "translate-x-0"
 */
export function useScrollHide({
  inhibit = false,
  topThreshold = 40,
  hideThreshold = 80,
  minDelta = 10,
}: UseScrollHideOptions = {}): UseScrollHideReturn {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;

      // While inhibited, always stay visible and reset baseline
      if (inhibit) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      // Near the top → always visible
      if (y < topThreshold) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      const delta = y - lastY.current;

      // Ignore micro-jitter
      if (Math.abs(delta) < minDelta) return;

      if (delta > 0 && y > hideThreshold) {
        setHidden(true);
      } else if (delta < 0) {
        setHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [inhibit, topThreshold, hideThreshold, minDelta]);

  return { hidden };
}
