import { createContext, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';

/** Maps an in-page id to a page scroll offset, for content that isn't laid out in page flow. */
export type AnchorResolver = (id: string) => { y: number; focus?: HTMLElement | null } | null;

interface SmoothScrollValue {
  /** Scrolls to `#id` (or the top for `#` / `#home`) and moves focus there for keyboard users. */
  scrollTo: (hash: string) => void;
  /** Scrolls to an absolute page offset. */
  scrollToY: (y: number, opts?: { immediate?: boolean; duration?: number }) => void;
  /** Lets a component (the 3D desk) resolve anchors that aren't real page positions. */
  setResolver: (resolver: AnchorResolver | null) => void;
  /** Freezes page scrolling (e.g. while the gate or a dialog is open). */
  setLocked: (locked: boolean) => void;
}

export const SmoothScrollContext = createContext<SmoothScrollValue | null>(null);

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const resolverRef = useRef<AnchorResolver | null>(null);

  useEffect(() => {
    // Touch screens scroll natively (smoothly already); smooth-scroll libraries can block
    // finger scrolling on some phones, so they are only used with a mouse or trackpad.
    if (prefersReducedMotion() || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    const lenis = new Lenis({ autoRaf: true, duration: 1.3, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToY = useCallback(
    (y: number, opts: { immediate?: boolean; duration?: number } = {}) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(y, { duration: opts.duration ?? 1.6, immediate: opts.immediate, force: true });
      } else {
        window.scrollTo(0, y);
      }
    },
    [],
  );

  const scrollTo = useCallback(
    (hash: string) => {
      const id = hash.replace(/^#/, '');
      const resolved = id ? resolverRef.current?.(id) : null;
      const target = resolved ? null : id && id !== 'home' ? document.getElementById(id) : null;

      if (resolved) scrollToY(resolved.y);
      else if (target) scrollToY(target.getBoundingClientRect().top + window.scrollY);
      else scrollToY(0);

      const focusEl = resolved?.focus ?? target ?? null;
      if (focusEl) {
        if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
        focusEl.focus({ preventScroll: true });
      }
      history.replaceState(null, '', id && id !== 'home' ? `#${id}` : location.pathname);
    },
    [scrollToY],
  );

  const setResolver = useCallback((resolver: AnchorResolver | null) => {
    resolverRef.current = resolver;
  }, []);

  const setLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }, []);

  const value = useMemo(
    () => ({ scrollTo, scrollToY, setResolver, setLocked }),
    [scrollTo, scrollToY, setResolver, setLocked],
  );
  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
