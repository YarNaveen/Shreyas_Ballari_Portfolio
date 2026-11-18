import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Cube, DownloadSimple, EnvelopeSimple, FileText, LinkSimple, List, X } from '@phosphor-icons/react';
import { Reach } from '@/features/details/Reach';
import { RESUME } from './timeline';

/**
 * The top bar: a small dark pill at the top centre (his mark and a menu icon). Point at it (or
 * tap, or tab into it) and it stretches to the full width at the same height, showing every
 * chapter, Download resume, Contact and quick actions.
 */

export const NAV_ITEMS = [
  { id: 'work', label: 'Work' },
  { id: 'oncure', label: 'Oncure' },
  { id: 'finance', label: 'Trading app' },
  { id: 'wall', label: 'Awards' },
  { id: 'life', label: 'Activities' },
  { id: 'goals', label: 'Goals' },
] as const;

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg className="dk-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="dk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b48cff" />
          <stop offset="0.55" stopColor="#6a3dff" />
          <stop offset="1" stopColor="#2a1290" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#dk-g)" />
      <path d="M16 5.5 Q17.6 14.4 26.5 16 Q17.6 17.6 16 26.5 Q14.4 17.6 5.5 16 Q14.4 14.4 16 5.5Z" fill="#fff" />
    </svg>
  );
}

export function Dock({ go, active }: { go: (id: string) => void; active: string }) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  /** The resume PDF is only offered when the file is really there. */
  const [hasResume, setHasResume] = useState(false);
  useEffect(() => {
    fetch(RESUME, { method: 'HEAD' })
      .then((r) => setHasResume(r.ok && (r.headers.get('content-type') ?? '').includes('pdf')))
      .catch(() => setHasResume(false));
  }, []);
  const closeT = useRef(0);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    const el = root.current;
    if (!vv || !el) return;
    const pin = () => {
      el.style.transform = `translate3d(0, ${Math.max(0, vv.offsetTop).toFixed(1)}px, 0)`;
    };
    pin();
    vv.addEventListener('scroll', pin);
    vv.addEventListener('resize', pin);
    return () => {
      vv.removeEventListener('scroll', pin);
      vv.removeEventListener('resize', pin);
    };
  }, []);

  /** Phones and small tablets: the bar never widens; the menu button opens the full sheet. */
  const small = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;
  const show = () => {
    window.clearTimeout(closeT.current);
    if (!small()) setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => {
      setOpen(false);
      setSheet(false);
    }, 260);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (setOpen(false), setSheet(false));
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) (setOpen(false), setSheet(false));
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.clearTimeout(closeT.current);
    };
  }, []);

  const jump = (id: string) => {
    go(id);
    setSheet(false);
    setOpen(false);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <nav
      ref={root}
      className={`dk ${open ? 'is-open' : ''} ${sheet ? 'has-sheet' : ''}`}
      aria-label="Site"
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onFocus={show}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide()}
    >
      <div className="dk-bar">
        <button type="button" className="dk-logo" onClick={() => jump('home')} aria-label="Shreyas Ballari, back to the top">
          <Logo />
          <span className="dk-name">Shreyas Ballari</span>
        </button>

        <ul className="dk-links">
          {NAV_ITEMS.map((n, i) => (
            <li key={n.id} style={{ ['--i' as string]: i }}>
              <button type="button" className={active === n.id ? 'is-on' : ''} aria-current={active === n.id ? 'true' : undefined} onClick={() => jump(n.id)}>
                {n.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="dk-actions">
          <button type="button" className="dk-icon" onClick={() => void copy()} aria-label="Copy the link to this page" title="Copy link">
            {copied ? <Check weight="bold" /> : <LinkSimple weight="bold" />}
          </button>
          <a className="dk-icon" href={`${import.meta.env.BASE_URL}?style=creative`} aria-label="Open the 3D house" title="Walk through his 3D house">
            <Cube weight="bold" />
          </a>
          <button type="button" className="dk-btn is-ghost" onClick={() => go('contact')}>
            <EnvelopeSimple weight="bold" aria-hidden="true" /> Contact
          </button>
          {hasResume && (
            <>
              <a className="dk-btn is-ghost" href={RESUME} target="_blank" rel="noopener">
                <FileText weight="bold" aria-hidden="true" /> View resume
              </a>
              <a className="dk-btn" href={RESUME} download="Shreyas_Ballari_Resume.pdf">
                <DownloadSimple weight="bold" aria-hidden="true" /> Download
              </a>
            </>
          )}
        </div>

        <button type="button" className="dk-toggle" aria-label={sheet ? 'Close the menu' : 'Open the menu'} aria-expanded={open || sheet} onClick={() => (small() ? (setOpen(false), setSheet((s) => !s)) : open ? setSheet((s) => !s) : setOpen(true))}>
          {sheet ? <X weight="bold" /> : <List weight="bold" />}
        </button>
      </div>

      {/* Small screens: the links drop down under the bar. */}
      <div className="dk-sheet" hidden={!sheet}>
        <p className="dk-sheet-name">{'Shreyas Ballari'}</p>
        {NAV_ITEMS.map((n, i) => (
          <button key={n.id} type="button" className={active === n.id ? 'is-on' : ''} style={{ ['--i' as string]: i }} onClick={() => jump(n.id)}>
            {n.label} <ArrowUpRight weight="bold" aria-hidden="true" />
          </button>
        ))}
        <button type="button" onClick={() => jump('contact')}>
          Contact <ArrowUpRight weight="bold" aria-hidden="true" />
        </button>
        <Reach tone="dark" className="dk-reach" />
      </div>
    </nav>
  );
}
