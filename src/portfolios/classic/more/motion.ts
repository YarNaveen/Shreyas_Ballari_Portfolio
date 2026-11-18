import { useEffect } from 'react';

/**
 * Classic motion layer, one hook for the whole page:
 *  - sections get `is-seen` each time they come into view (so entrances replay both ways);
 *  - scroll-linked effects: a progress bar, the marquee leans with scroll speed, photos drift
 *    (parallax), the Oncure film grows into place, the app mockup tilts flat;
 *  - 3D tilt with a soft glare on cards under the mouse.
 * Nothing runs for visitors who ask for reduced motion; then every section simply shows.
 */

const SEEN = '.sd-momentum, .sd-marquee, .sd-craft, .sd-film, .sd-goals, .sd-contact, .sd-finale, .pg-bhead, .pg-note, .pg-media, .pg-mock, .pg-verdict, .pg-prose';
const TILT = '.sd-b, .sd-card, .sd-cols article, .gp-step, .pg-card, .pg-stat, .vx-cert-in, .sd-g';
const CURTAIN = '.sd-work, .sd-goals, .sd-finale';
const COUNT = '.sd-b-big, .sd-b-over b';
const PARALLAX = '.sd-craft-pic img, .sd-b-photo img, .sd-card img, .pg-hero img';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function useClassicMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('sd-motion');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // --- sections in view (replays each time) ---
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.15) e.target.classList.add('is-seen');
          else if (!e.isIntersecting) e.target.classList.remove('is-seen');
        }
      },
      { threshold: [0, 0.15] },
    );
    const watched = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll(SEEN).forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    scan();
    // Inner pages mount later (in a portal): look again when one opens.
    const onPage = () => window.setTimeout(scan, 120);
    window.addEventListener('sd-page', onPage);

    // --- numbers count up each time they come into view ---
    const counted = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const final = el.dataset.final ?? el.textContent ?? '';
          el.dataset.final = final;
          if (!e.isIntersecting) {
            el.textContent = final;
            continue;
          }
          if (final.includes('·')) continue; // year ranges stay as they are
          const t0 = performance.now();
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / 1400);
            const ease = 1 - Math.pow(1 - k, 3);
            el.textContent = final.replace(/\d+/g, (n) => String(Math.round(Number(n) * ease)));
            if (k < 1 && el.isConnected) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll(COUNT).forEach((el) => counted.observe(el));

    // --- scroll-linked effects ---
    const bar = document.createElement('div');
    bar.className = 'sd-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let lastY = window.scrollY;
    let vel = 0;
    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;
      vel = vel * 0.82 + (y - lastY) * 0.18;
      lastY = y;

      const wrap = document.querySelector<HTMLElement>('.cx-wrap.sd');
      if (wrap) {
        const top = wrap.getBoundingClientRect().top + y;
        const p = clamp((y - top + vh) / Math.max(1, wrap.offsetHeight), 0, 1);
        bar.style.transform = `scaleX(${p.toFixed(4)})`;
        bar.style.opacity = y + vh > top ? '1' : '0';
      }

      const skew = clamp(vel * -0.35, -10, 10).toFixed(2);
      document.querySelectorAll<HTMLElement>('.sd-mq-row').forEach((r) => r.style.setProperty('--skew', `${skew}deg`));

      const film = document.querySelector<HTMLElement>('.sd-film .fv.is-free');
      if (film) {
        const r = film.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
        film.style.scale = (0.84 + 0.16 * p).toFixed(4);
        film.style.borderRadius = `${(48 - 24 * p).toFixed(1)}px`;
      }

      // Curtains: a section slides over the one before it with rounded top corners.
      document.querySelectorAll<HTMLElement>(CURTAIN).forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top > vh || r.bottom < 0) return;
        const p = clamp((vh - r.top) / (vh * 0.7), 0, 1);
        if (p >= 1) {
          s.style.scale = '';
          s.style.borderRadius = '';
          return;
        }
        s.style.scale = (0.92 + 0.08 * p).toFixed(4);
        const rr = (1 - p) * 56;
        s.style.borderRadius = `${rr.toFixed(1)}px ${rr.toFixed(1)}px 0 0`;
      });

      // The closing headline settles from large to its size as it arrives.
      const fin = document.querySelector<HTMLElement>('.sd-fin-h');
      if (fin) {
        const r = fin.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.8), 0, 1);
        const big = window.innerWidth < 700 ? 0.12 : 0.35;
        fin.style.scale = (1 + big - big * p).toFixed(4);
      }

      const mk = document.querySelector<HTMLElement>('.sd-hero-mock .mk');
      if (mk) {
        const r = mk.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.9), 0, 1);
        mk.style.rotate = `x ${((1 - p) * 16).toFixed(2)}deg`;
      }

      document.querySelectorAll<HTMLElement>(PARALLAX).forEach((img) => {
        const r = (img.parentElement ?? img).getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = `0 ${(c * -36).toFixed(1)}px`;
      });

      if (Math.abs(vel) > 0.05) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    frame();

    // --- 3D tilt under the mouse ---
    let cur: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.rotate = '';
      el.classList.remove('is-tilt');
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(TILT) ?? null;
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const yy = (e.clientY - r.top) / r.height - 0.5;
      const max = el.matches('.sd-card') ? 4 : 9;
      const ang = Math.min(1, Math.hypot(x, yy) * 2) * max;
      el.style.rotate = `${(-yy).toFixed(3)} ${x.toFixed(3)} 0 ${ang.toFixed(2)}deg`;
      el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((yy + 0.5) * 100).toFixed(1)}%`);
      el.classList.add('is-tilt');
    };
    const onLeave = () => {
      if (cur) reset(cur);
      cur = null;
    };
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    return () => {
      root.classList.remove('sd-motion');
      io.disconnect();
      counted.disconnect();
      cancelAnimationFrame(raf);
      bar.remove();
      window.removeEventListener('sd-page', onPage);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);
}
