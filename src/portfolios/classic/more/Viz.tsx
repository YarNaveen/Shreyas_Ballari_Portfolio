import type { CSSProperties, ReactNode } from 'react';
import { Medal, Seal, Sparkle } from '@phosphor-icons/react';
import { useSeen } from './ui';

/**
 * Visual pieces for the inner pages: certificates, gauges, charts, flows and timelines. Each one
 * animates the first time it is seen (`is-in`). One font (Geist) throughout.
 */

const at = (i: number) => ({ '--i': i }) as CSSProperties;
type Icon = typeof Sparkle;

function Seen({ className, children, as: Tag = 'div' }: { className: string; children: ReactNode; as?: 'div' | 'ol' | 'ul' }) {
  const ref = useSeen<HTMLDivElement>();
  const T = Tag as 'div';
  return (
    <T ref={ref} className={className}>
      {children}
    </T>
  );
}

/* ---------------------------------------------------------------- certificates */

export type Cert = { id: string; issuer: string; kind: string; title: string; value: string; when: string; tone: string };

/** Designed certificate frames (not scans), laid out as a wall that tilts on hover. */
export function CertWall({ items }: { items: Cert[] }) {
  return (
    <Seen className="vx-certs">
      {items.map((c, i) => (
        <article key={c.id} className="vx-cert" style={{ ...at(i), '--tone': c.tone } as CSSProperties}>
          <div className="vx-cert-in">
            <span className="vx-cert-issuer">{c.issuer}</span>
            <span className="vx-cert-kind">{c.kind}</span>
            <h4>{c.title}</h4>
            <span className="vx-cert-to">presented to</span>
            <b className="vx-cert-name">Shreyas Ballari</b>
            <span className="vx-cert-val">
              {c.value} · {c.when}
            </span>
            <span className="vx-cert-seal" aria-hidden="true">
              <Seal weight="fill" />
              <Medal weight="fill" />
            </span>
          </div>
        </article>
      ))}
    </Seen>
  );
}

/* ---------------------------------------------------------------- gauges and charts */

/** Ring gauges that fill to a percentage. */
export function Rings({ items }: { items: { v: number; label: string; sub?: string }[] }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <Seen className="vx-rings">
      {items.map((it, i) => (
        <figure key={it.label + (it.sub ?? '')} className="vx-ring" style={{ ...at(i), '--dash': `${(C * it.v) / 100}`, '--c': `${C}` } as CSSProperties}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r={R} className="vx-ring-bg" />
            <circle cx="60" cy="60" r={R} className="vx-ring-fg" />
          </svg>
          <b>{it.v}%</b>
          <figcaption>
            {it.label}
            {it.sub && <small>{it.sub}</small>}
          </figcaption>
        </figure>
      ))}
    </Seen>
  );
}

/** A line chart of percentiles by grade, one line per test; lines draw themselves in. */
export function LineChart({ series, grades, min = 95, max = 100 }: { series: { name: string; color: string; points: (number | null)[] }[]; grades: string[]; min?: number; max?: number }) {
  const W = 640;
  const H = 260;
  const P = { l: 48, r: 24, t: 24, b: 40 };
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, grades.length - 1);
  const y = (v: number) => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
  const ticks = Array.from({ length: max - min + 1 }, (_, k) => min + k);
  return (
    <Seen className="vx-line">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => `${s.name}: ${s.points.map((p, i) => (p == null ? '' : `${grades[i]} ${p}%`)).filter(Boolean).join(', ')}`).join('. ')}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="vx-grid" />
            <text x={P.l - 12} y={y(t) + 4} textAnchor="end" className="vx-axis">
              {t}
            </text>
          </g>
        ))}
        {grades.map((g, i) => (
          <text key={g} x={x(i)} y={H - 12} textAnchor="middle" className="vx-axis">
            {g}
          </text>
        ))}
        {series.map((s, si) => {
          const pts = s.points.map((p, i) => (p == null ? null : ([x(i), y(p)] as const))).filter(Boolean) as (readonly [number, number])[];
          const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
          return (
            <g key={s.name} style={{ '--i': si, '--col': s.color } as CSSProperties}>
              <path d={d} className="vx-path" pathLength={1} />
              {pts.map(([px, py], k) => (
                <circle key={k} cx={px} cy={py} r={6} className="vx-dot" style={{ '--k': k } as CSSProperties} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="vx-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </Seen>
  );
}

/** Horizontal bars that grow to their share of the largest value. */
export function Bars({ items, unit = '' }: { items: { label: string; v: number; shown: string; note?: string; tone?: string }[]; unit?: string }) {
  const top = Math.max(...items.map((i) => i.v));
  return (
    <Seen className="vx-bars">
      {items.map((it, i) => (
        <div key={it.label} className="vx-bar" style={{ ...at(i), '--w': `${(it.v / top) * 100}%`, '--tone': it.tone ?? '#1f4dff' } as CSSProperties}>
          <span className="vx-bar-label">{it.label}</span>
          <span className="vx-bar-track">
            <i />
          </span>
          <b>
            {it.shown}
            {unit}
          </b>
          {it.note && <small>{it.note}</small>}
        </div>
      ))}
    </Seen>
  );
}

/** A donut showing a range (e.g. 15 to 25%). */
export function Donut({ from, to, label, note }: { from: number; to: number; label: string; note?: string }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  return (
    <Seen className="vx-donut">
      <figure style={{ '--a': `${(C * from) / 100}`, '--b': `${(C * (to - from)) / 100}`, '--c': `${C}` } as CSSProperties}>
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle cx="90" cy="90" r={R} className="vx-d-bg" />
          <circle cx="90" cy="90" r={R} className="vx-d-a" />
          <circle cx="90" cy="90" r={R} className="vx-d-b" />
        </svg>
        <b>
          {from}–{to}%
        </b>
      </figure>
      <div>
        <h4>{label}</h4>
        {note && <p>{note}</p>}
      </div>
    </Seen>
  );
}

/* ---------------------------------------------------------------- flows and timelines */

/** Steps joined by a line that draws itself, each with an icon node. */
export function Flow({ items }: { items: { icon: Icon; title: string; line: string }[] }) {
  return (
    <Seen className="vx-flow" as="ol">
      {items.map(({ icon: I, title, line }, i) => (
        <li key={title} style={at(i)}>
          <span className="vx-flow-node">
            <I weight="duotone" aria-hidden="true" />
            <em>{i + 1}</em>
          </span>
          <h4>{title}</h4>
          <p>{line}</p>
        </li>
      ))}
    </Seen>
  );
}

/** A vertical timeline with a glowing progress line. */
export function Timeline({ items }: { items: { when: string; title: string; line?: string; icon?: Icon }[] }) {
  return (
    <Seen className="vx-tl" as="ol">
      {items.map((it, i) => {
        const I = it.icon ?? Sparkle;
        return (
          <li key={it.when + it.title} style={at(i)}>
            <span className="vx-tl-dot">
              <I weight="fill" aria-hidden="true" />
            </span>
            <small>{it.when}</small>
            <h4>{it.title}</h4>
            {it.line && <p>{it.line}</p>}
          </li>
        );
      })}
    </Seen>
  );
}

/** Years active, as bars on a shared year axis. `to: null` means still going. */
export function Years({ items, from, to }: { items: { title: string; role: string; start: number | null; end: number | null; icon: Icon; note?: string }[]; from: number; to: number }) {
  const span = to - from + 1;
  const years = Array.from({ length: span }, (_, k) => from + k);
  return (
    <Seen className="vx-years">
      <div className="vx-years-axis" aria-hidden="true">
        <span />
        <div>
          {years.map((y) => (
            <em key={y}>{y}</em>
          ))}
        </div>
      </div>
      {items.map(({ title, role, start, end, icon: I, note }, i) => {
        const s = start ?? to;
        const e = end ?? to;
        return (
          <div key={title} className="vx-years-row" style={at(i)}>
            <span className="vx-years-name">
              <I weight="duotone" aria-hidden="true" />
              <span>
                <b>{title}</b>
                <small>{role}</small>
              </span>
            </span>
            <div className="vx-years-track">
              {years.map((y) => (
                <i key={y} />
              ))}
              <span
                className={`vx-years-bar ${end == null ? 'is-open' : ''}`}
                style={{ left: `${((s - from) / span) * 100}%`, width: `${((e - s + 1) / span) * 100}%` }}
              >
                {note ?? (start == null ? 'Now' : end == null ? `${start} to now` : start === end ? `${start}` : `${start}–${end}`)}
              </span>
            </div>
          </div>
        );
      })}
    </Seen>
  );
}

/** Round badges with a ring that spins in. */
export function Badges({ items }: { items: { icon: Icon; title: string; line: string }[] }) {
  return (
    <Seen className="vx-badges">
      {items.map(({ icon: I, title, line }, i) => (
        <figure key={title} style={at(i)}>
          <span className="vx-badge">
            <I weight="duotone" aria-hidden="true" />
          </span>
          <figcaption>
            <b>{title}</b>
            <small>{line}</small>
          </figcaption>
        </figure>
      ))}
    </Seen>
  );
}

/** A glowing core with labelled parts around it (e.g. what each nanobot carries). */
export function Orbit({ center, parts }: { center: string; parts: string[] }) {
  return (
    <Seen className="vx-orbit">
      <div className="vx-orbit-ring" aria-hidden="true" />
      <div className="vx-orbit-core">
        <span>{center}</span>
      </div>
      <ul>
        {parts.map((p, i) => (
          <li key={p} style={{ ...at(i), '--a': `${(i / parts.length) * 360 - 90}deg` } as CSSProperties}>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </Seen>
  );
}

/** Grouped columns per category (e.g. grade), one colour per series, on a zoomed axis. */
export function Columns({ series, groups, min = 95, max = 100 }: { series: { name: string; color: string; points: (number | null)[] }[]; groups: string[]; min?: number; max?: number }) {
  const ticks = Array.from({ length: max - min + 1 }, (_, k) => max - k);
  return (
    <Seen className="vx-cols">
      <div className="vx-cols-plot">
        <div className="vx-cols-axis" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="vx-cols-groups">
          {ticks.map((t) => (
            <i key={t} className="vx-cols-grid" style={{ top: `calc((100% - 32px) * ${(max - t) / (max - min)})` }} aria-hidden="true" />
          ))}
          {groups.map((g, gi) => (
            <div key={g} className="vx-cols-group">
              <div className="vx-cols-bars">
                {series.map((s, si) => {
                  const v = s.points[gi];
                  return v == null ? (
                    <span key={s.name} className="vx-cols-none">
                      no {s.name}
                    </span>
                  ) : (
                    <span key={s.name} className="vx-cols-bar" style={{ '--h': `${((v - min) / (max - min)) * 100}%`, '--col': s.color, '--i': gi * series.length + si } as CSSProperties} title={`${s.name}, ${g}: top ${v}%`}>
                      <b>{v}%</b>
                    </span>
                  );
                })}
              </div>
              <small>{g}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="vx-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </Seen>
  );
}
