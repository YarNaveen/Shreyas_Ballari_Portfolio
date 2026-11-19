import { useEffect, useRef } from 'react';
import { profile } from '@/content/portfolio';
import './stage.css';

/**
 * Hero: his photo on a soft blue-grey backdrop, turning a little towards the pointer; his name set
 * edge to edge across the bottom in large white capitals; a dark glass card says hello and follows
 * the pointer while it is over the hero (it glides back to its place when the pointer leaves).
 *
 * `mini` renders a quiet copy (no ids, no pointer effects) for the ring card the hero becomes.
 */

const BASE = import.meta.env.BASE_URL;

export function StageHero({ mini = false }: { mini?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const nameText = useRef<HTMLSpanElement>(null);
  const person = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const s = useRef({ x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0, ctx: 0, cty: 0, raf: 0 });

  // The name always fills the width.
  useEffect(() => {
    const h = name.current;
    const t = nameText.current;
    if (!h || !t) return;
    const fit = () => {
      h.style.fontSize = '100px';
      // Layout width (not affected by the scaling when the hero shrinks into its card).
      const w = t.offsetWidth;
      if (w) h.style.fontSize = `${(100 * h.clientWidth) / w}px`;
    };
    fit();
    void document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(h);
    return () => ro.disconnect();
  }, []);

  // The portrait leans towards the pointer; the hello card follows it.
  useEffect(() => {
    if (mini || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const st = s.current;
    const tick = () => {
      st.x += (st.tx - st.x) * 0.08;
      st.y += (st.ty - st.y) * 0.08;
      st.cx += (st.ctx - st.cx) * 0.12;
      st.cy += (st.cty - st.cy) * 0.12;
      if (person.current) person.current.style.transform = `translate3d(${st.x * 16}px, ${st.y * 6}px, 0) rotateY(${st.x * 7}deg) rotateX(${-st.y * 3}deg)`;
      if (card.current) card.current.style.translate = `${st.cx}px ${st.cy}px`;
      const moving = Math.abs(st.tx - st.x) + Math.abs(st.ty - st.y) + Math.abs(st.ctx - st.cx) + Math.abs(st.cty - st.cy) > 0.2;
      st.raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!st.raf) st.raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const el = root.current;
      const c = card.current;
      if (!el || !c) return;
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && r.width > window.innerWidth * 0.8;
      st.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      st.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (inside && e.pointerType === 'mouse') {
        // The card's resting box (without the follow offset), then aim its corner just past the pointer.
        const cw = c.offsetWidth;
        const ch = c.offsetHeight;
        const restX = c.offsetLeft;
        const restY = c.offsetTop;
        const gx = Math.min(r.width - cw - 12, Math.max(12, e.clientX - r.left + 24));
        const gy = Math.min(r.height - ch - 12, Math.max(12, e.clientY - r.top + 24));
        st.ctx = gx - restX;
        st.cty = gy - restY;
      } else {
        st.ctx = 0;
        st.cty = 0;
      }
      kick();
    };
    const leave = () => {
      st.tx = st.ty = st.ctx = st.cty = 0;
      kick();
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(st.raf);
    };
  }, [mini]);

  return (
    <section ref={root} id={mini ? undefined : 'home'} className={`sh ${mini ? 'is-mini' : ''}`} aria-labelledby={mini ? undefined : 'sh-name'} aria-hidden={mini || undefined}>
      <img className="sh-bg" src={`${BASE}assets/shreyas/hero-backdrop.jpg`} alt="" aria-hidden="true" />
      <div className="sh-person" ref={person}>
        <img src={`${BASE}assets/shreyas/hero-cutout.png`} alt={mini ? '' : `${profile.name}, in a dark suit, light blue shirt and blue tie`} fetchPriority={mini ? 'low' : 'high'} />
      </div>
      <aside ref={card} className="sh-card">
        <p className="sh-hey">Hey, I’m {profile.firstName}</p>
        <p className="sh-intro">
          A <b>student researcher</b> and <b>peer tutor</b>, a junior at {profile.school}. Exploring how <b>AI</b> could make cancer treatment more precise, and building an{' '}
          <b>stock trading application</b>.
        </p>
      </aside>
      <h1 id={mini ? undefined : 'sh-name'} className="sh-name" ref={name}>
        <span ref={nameText}>{profile.name}</span>
      </h1>
    </section>
  );
}
