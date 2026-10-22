import { useEffect, useRef, useState } from "react";

/**
 * Visibility of a loading layer with two guards against flashing: it appears only after `delayMs` of
 * waiting (0 = at once, also on the first render), and once it has appeared it stays for at least `minMs`.
 * A wait that ends before the delay never shows anything.
 */
export function useHoldVisible(active: boolean, delayMs: number, minMs: number): boolean {
  const [shown, setShown] = useState(active && delayMs === 0);
  const shownAt = useRef<number | null>(active && delayMs === 0 ? Date.now() : null);

  useEffect(() => {
    if (active) {
      if (shownAt.current !== null) return undefined; // already up (or held): just keep it
      const show = () => {
        shownAt.current = Date.now();
        setShown(true);
      };
      if (delayMs === 0) {
        show();
        return undefined;
      }
      const timer = setTimeout(show, delayMs);
      return () => clearTimeout(timer);
    }
    if (shownAt.current === null) return undefined; // never appeared: nothing to hold
    const remaining = minMs - (Date.now() - shownAt.current);
    const hide = () => {
      shownAt.current = null;
      setShown(false);
    };
    if (remaining <= 0) {
      hide();
      return undefined;
    }
    const timer = setTimeout(hide, remaining);
    return () => clearTimeout(timer);
  }, [active, delayMs, minMs]);

  return shown;
}
