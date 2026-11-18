import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUp, ArrowUpRight } from '@phosphor-icons/react';
import { achievements } from '@/content/portfolio';
import { PHOTOS } from '@/content/photos';
import { SmoothScrollContext } from '@/app/providers/SmoothScroll';
import './honors.css';

/**
 * Awards and achievements, right after the trading app: a horizontal strip of portrait cards, one
 * per award. Scrolling moves a fisheye along the strip (the card in focus is largest, its
 * neighbours fall off) and a large counter follows. Past the last card (College Board) the trophy
 * eases out to fill the screen and the closing line appears. Click a card, or use the arrow keys
 * while the section is pinned, to bring it to the centre. Every fact comes from content/portfolio.ts.
 */

const BASE = import.meta.env.BASE_URL;
const local = (n: string) => `${BASE}assets/photos/${n}.jpg`;

/** Order on the strip (earliest first, the College Board award last) and the photo for each. */
const ORDER: { id: string; src: string; tint: string; focus?: string }[] = [
  { id: 'arrow', src: local('archery-target'), tint: '#d9dbe2' },
  { id: 'minimed', src: local('stethoscope'), tint: '#d6d9e0' },
  { id: 'authors', src: local('writing'), tint: '#dcd8d0' },
  { id: 'psat', src: PHOTOS.notes.src, tint: '#e2e1dc' },
  { id: 'map', src: local('chalkboard-math'), tint: '#2a2d33' },
  { id: 'honors', src: local('classroom'), tint: '#d8d6d2' },
  { id: 'cbnrp', src: local('trophy'), tint: '#5b78c9', focus: '50% 45%' },
];

const PLATES = ORDER.flatMap((o) => {
  const a = achievements.find((x) => x.id === o.id);
  return a ? [{ ...o, ...a }] : [];
});
const N = PLATES.length;
const LAST = PLATES[N - 1]!;
const STRIP_END = 0.84; // share of the scroll used by the strip; the rest expands the last card
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const pad = (n: number) => String(n).padStart(2, '0');

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const sub = (p: (typeof PLATES)[number]) => [p.kind, p.when].filter((v, i, all) => all.indexOf(v) === i).join(' · ');

export function Honors() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const countRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const smoothScroll = useContext(SmoothScrollContext);
  const reduced = useReducedMotion();

  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(() => PLATES.map(() => false));
  const [failed, setFailed] = useState<boolean[]>(() => PLATES.map(() => false));
  const activeRef = useRef(0);
  activeRef.current = active;

  /** Page offset for a progress value (0 → section start, 1 → section end). */
  const yFor = (p: number) => {
    const track = trackRef.current;
    if (!track) return null;
    const top = track.getBoundingClientRect().top + window.scrollY;
    return top + p * (track.offsetHeight - window.innerHeight);
  };
  const scrollToProgress = (p: number) => {
    const y = yFor(p);
    if (y == null) return;
    if (smoothScroll && !reduced) smoothScroll.scrollToY(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  const goTo = (i: number) => scrollToProgress((clamp(i, 0, N - 1) / (N - 1)) * STRIP_END);

  /* ------------------------------------------- per-frame fisheye layout */
  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    let vw = stage.clientWidth;
    let vh = stage.clientHeight;
    const ro = new ResizeObserver(() => {
      vw = stage.clientWidth;
      vh = stage.clientHeight;
      dirty = true;
    });
    ro.observe(stage);

    // Only lay out while the section is near the screen (it sits in the middle of a long page).
    let near = true;
    let dirty = true;
    const io = new IntersectionObserver(([e]) => { near = !!e?.isIntersecting; }, { rootMargin: '50% 0px' });
    io.observe(track);

    let skew = 0;
    let lastY = window.scrollY;
    let lastP = -1;
    let lastActive = -1;
    const X = new Array<number>(N).fill(0);
    const W = new Array<number>(N).fill(0);
    const H = new Array<number>(N).fill(0);

    const frame = () => {
      if (!near) return;
      const rect = track.getBoundingClientRect();
      const span = track.offsetHeight - window.innerHeight;
      const p = span > 0 ? clamp(-rect.top / span) : 0;
      const y = window.scrollY;
      const velocity = y - lastY;
      lastY = y;
      skew = lerp(skew, reduced ? 0 : clamp(velocity * 0.12, -6, 6), 0.1);
      if (p === lastP && !dirty && Math.abs(skew) < 0.01) return;
      lastP = p;
      dirty = false;

      const f = clamp(p / STRIP_END) * (N - 1);
      const e = reduced ? 0 : smooth(STRIP_END + 0.02, 0.995, p);
      const fade = reduced ? smooth(STRIP_END + 0.02, 0.95, p) : e;
      const mobile = vw < 700;
      const short = vh < 620; // phones held sideways: no header, cards higher up
      const H0 = Math.min(vh * (short ? 0.4 : mobile ? 0.5 : 0.44), (vw * (mobile ? 0.66 : vw < 1100 ? 0.46 : 0.34)) / 0.75, 600);
      const gap = Math.max(12, vw * 0.018);
      const centerY = vh * (short ? 0.36 : mobile ? 0.45 : 0.42);

      let acc = 0;
      for (let i = 0; i < N; i++) {
        const d = i - f;
        const s = 0.42 + 0.58 * Math.exp(-(d * d) / 0.7);
        H[i] = H0 * s;
        W[i] = H[i]! * 0.75;
        X[i] = acc + W[i]! / 2;
        acc += W[i]! + gap;
      }
      const i0 = Math.floor(f);
      const i1 = Math.min(N - 1, i0 + 1);
      const focusX = lerp(X[i0]!, X[i1]!, f - i0);
      const offset = vw / 2 - focusX;

      for (let i = 0; i < N; i++) {
        const el = cardsRef.current[i];
        if (!el) continue;
        let x = X[i]! + offset;
        let cy = centerY;
        let w = W[i]!;
        let h = H[i]!;
        let op = 1;
        if (i === N - 1 && e > 0) {
          x = lerp(x, vw / 2, e);
          cy = lerp(cy, vh / 2, e);
          w = lerp(w, vw, e);
          h = lerp(h, vh, e);
        } else if (e > 0) {
          op = 1 - e * 1.6;
          x += (x < vw / 2 ? -1 : 1) * e * vw * 0.2;
        }
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.opacity = `${clamp(op)}`;
        el.style.visibility = op <= 0 ? 'hidden' : '';
        el.style.transform = `translate3d(${x - w / 2}px, ${cy - h / 2}px, 0) skewX(${(skew * (1 - e)).toFixed(2)}deg)`;
        el.style.borderRadius = i === N - 1 ? `${lerp(16, 0, e)}px` : '16px';
        if (i === N - 1) el.classList.toggle('is-full', e > 0.02);
        const img = imgsRef.current[i];
        if (img) img.style.transform = `translate3d(${clamp(-(i - f) * 7, -10, 10) * (1 - e)}%, 0, 0) scale(${lerp(1.22, 1, i === N - 1 ? e : 0)})`;
      }

      if (captionRef.current) captionRef.current.style.top = `${centerY + H0 / 2 + 20}px`;
      if (countRef.current) countRef.current.textContent = pad(Math.round(f) + 1);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${f / (N - 1)})`;
      if (chromeRef.current) chromeRef.current.style.opacity = `${1 - fade}`;
      if (introRef.current) {
        const t = smooth(0, 0.05, p);
        introRef.current.style.opacity = `${1 - t}`;
        introRef.current.style.transform = `translate3d(${-t * 40}px, -50%, 0)`;
      }
      if (finalRef.current) {
        const t = smooth(0.93, 1, p);
        const show = reduced ? fade : t;
        finalRef.current.style.opacity = `${show}`;
        finalRef.current.style.transform = `translate3d(0, ${(1 - t) * 30}px, 0)`;
        finalRef.current.style.pointerEvents = show > 0.5 ? 'auto' : 'none';
        finalRef.current.style.visibility = show > 0.01 ? 'visible' : 'hidden';
      }

      const idx = Math.round(f);
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
    };

    gsap.ticker.add(frame);
    frame();
    return () => {
      gsap.ticker.remove(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  /* ------------------------------------------------------------- intro */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (reduced || !stage) return;
    let io: IntersectionObserver | null = null;
    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .fromTo('.hn-clip', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, stagger: { each: 0.06, from: 'center' } })
        .from('.hn-top > *', { opacity: 0, y: -10, duration: 1, stagger: 0.08 }, 0.3)
        .from('.hn-count > *', { yPercent: 100, opacity: 0, duration: 1.4, stagger: 0.08 }, 0.4)
        .from('.hn-caption', { opacity: 0, duration: 1 }, 0.8);
      io = new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) {
            tl.play();
            io?.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(stage);
    }, stage);
    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, [reduced]);

  /* ------------------------------------------- arrow keys while pinned */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const track = trackRef.current;
      if (!track) return;
      const r = track.getBoundingClientRect();
      if (r.top > 1 || r.bottom < window.innerHeight - 1) return;
      if ((e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      e.preventDefault();
      goTo(activeRef.current + (e.key === 'ArrowRight' ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, smoothScroll]);

  const plate = PLATES[active] ?? PLATES[0]!;
  const openAwards = () => window.dispatchEvent(new CustomEvent('sd-page', { detail: 'awards' }));

  return (
    <section ref={trackRef} id="cx-honors" className="hn" style={{ height: `${N * 42 + 170}vh` }} aria-labelledby="hn-h">
      <div ref={stageRef} className="hn-stage">
        <div ref={chromeRef} className="hn-chrome">
          <header className="hn-top">
            <h2 id="hn-h" className="hn-label">
              <i aria-hidden="true" /> Awards and achievements
            </h2>
            <span className="hn-top-r">
              {N} honors · scroll or use ← →
            </span>
          </header>

          <p ref={introRef} className="hn-intro">
            <span>Every award, honor and certificate.</span> From Project Arrow in 2nd grade to the College Board National Recognition Program.
          </p>

          <div ref={captionRef} className="hn-caption" aria-live="polite">
            <span className="hn-cap-no">
              {pad(active + 1)} / {pad(N)} · {plate.kind}
            </span>
            <span key={active} className="hn-cap-title">
              {plate.title}
            </span>
            <span className="hn-cap-value">
              <b>{plate.value}</b> {sub(plate) && <>· {sub(plate)}</>}
            </span>
            <span className="hn-cap-detail">{plate.detail}</span>
          </div>

          <div className="hn-count" aria-hidden="true">
            <span className="hn-count-now" ref={countRef}>
              01
            </span>
            <span className="hn-count-line">
              <i ref={fillRef} />
            </span>
            <span className="hn-count-end">{pad(N)}</span>
          </div>
        </div>

        <div className="hn-strip">
          {PLATES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className={`hn-card${i === active ? ' is-active' : ''}`}
              style={{ background: p.tint }}
              aria-label={`${pad(i + 1)}: ${p.title}, ${p.value}. ${p.detail}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
            >
              <span className="hn-clip">
                {!failed[i] ? (
                  <img
                    ref={(el) => {
                      imgsRef.current[i] = el;
                    }}
                    src={p.src}
                    alt=""
                    decoding="async"
                    loading="lazy"
                    draggable={false}
                    style={p.focus ? { objectPosition: p.focus } : undefined}
                    className={loaded[i] ? 'is-loaded' : ''}
                    onLoad={() => setLoaded((l) => l.map((v, j) => (j === i ? true : v)))}
                    onError={() => setFailed((l) => l.map((v, j) => (j === i ? true : v)))}
                  />
                ) : null}
                <span className="hn-card-tag" aria-hidden="true">
                  <b>{pad(i + 1)}</b>
                  {p.title}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div ref={finalRef} className="hn-final">
          <p className="hn-final-kicker">
            {pad(N)} · {LAST.title} · {LAST.value}
          </p>
          <p className="hn-final-h">
            <span>{WORDS[N] ?? N} honors,</span>
            <span className="is-soft">since 2nd grade.</span>
          </p>
          <p className="hn-final-body">Top 99% on the PSAT and MAP, the Principal’s Honors List in 2025 and 2026, and the College Board National Recognition Program.</p>
          <div className="hn-final-cta">
            <button type="button" className="sd-pill is-white" onClick={openAwards}>
              See every award <ArrowUpRight weight="bold" aria-hidden="true" />
            </button>
            <button type="button" className="hn-back" onClick={() => scrollToProgress(0)}>
              Back to the first <ArrowUp weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
