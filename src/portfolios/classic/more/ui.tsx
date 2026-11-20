import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';

/** Shared pieces of the Classic sections: reveal on first sight, two-tone headlines, section frame. */

/** Marks an element `is-in` while it is in view (the CSS plays its entrance each time). */
export function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }
    // In view → play the entrance; fully out of view → reset, so it plays again next time
    // (scrolling down or back up). Reduced motion: shown once and left alone.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        // Any part on screen starts the entrance (tall headings on phones never reach a share).
        if (e.isIntersecting) {
          el.classList.add('is-in');
          if (still) io.disconnect();
        } else el.classList.remove('is-in');
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** A two-tone headline whose words light up one after another. */
export function Words({ lead, rest, id }: { lead: string; rest: string; id: string }) {
  const ref = useSeen<HTMLHeadingElement>();
  const words = [...lead.split(' ').map((w) => ({ w, dim: false })), ...rest.split(' ').map((w) => ({ w, dim: true }))];
  return (
    <h2 ref={ref} id={id} className="cx-h">
      {words.map((x, i) => (
        <Fragment key={i}>
          <span className={`cx-w ${x.dim ? 'is-dim' : ''}`} style={{ '--i': i } as CSSProperties}>
            {x.w}
          </span>{' '}
        </Fragment>
      ))}
    </h2>
  );
}

/** A section: a soft light, a kicker, the two-tone headline, an optional lede, then its content. */
export function Sec({ id, kicker, lead, rest, lede, tone = 'night', children }: { id: string; kicker: ReactNode; lead: string; rest: string; lede?: string; tone?: string; children: ReactNode }) {
  const ref = useSeen<HTMLElement>();
  return (
    <section ref={ref} id={`cx-${id}`} className={`cx is-${tone}`} aria-labelledby={`cx-${id}-h`}>
      <span className="cx-glow" aria-hidden="true" />
      <div className="cx-in">
        <header className="cx-head">
          <p className="cx-kicker">{kicker}</p>
          <Words lead={lead} rest={rest} id={`cx-${id}-h`} />
          {lede && <p className="cx-lede">{lede}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/** A block of content that rises in when seen; its children come one after another (--i). */
export function Reveal({ as: Tag = 'div', className, children }: { as?: 'div' | 'ol' | 'ul'; className: string; children: ReactNode }) {
  const ref = useSeen<HTMLElement>();
  const T = Tag as 'div';
  return (
    <T ref={ref as RefObject<HTMLDivElement>} className={`cx-rv ${className}`}>
      {children}
    </T>
  );
}
