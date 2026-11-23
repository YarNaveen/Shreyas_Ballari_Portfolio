import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  BookOpenText,
  ChalkboardTeacher,
  ChartLineUp,
  Code,
  Cpu,
  DownloadSimple,
  EnvelopeSimple,
  GraduationCap,
  Medal,
  Microscope,
  NotePencil,
  Phone,
  Student,
  Trophy,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';
import { achievements, contact, goals, languages, profile, resume, schools, skillsCourses, subjects } from '@/content/portfolio';
import type { DetailId } from '@/features/details/Details';
import './sections.css';
import { ExperienceGrid } from '@/features/experience/ExperienceGrid';

/**
 * Studio, from Education down, in a light gallery style: a soft grey page with white cards,
 * black pill buttons, headings whose words rise into focus, cards that open up on hover, card
 * decks that shuffle, a dark contact block and a footer with his name in large faded letters.
 * Every fact comes from content/portfolio.ts.
 */

const BASE = import.meta.env.BASE_URL;
const photo = (n: string) => `${BASE}assets/photos/${n}.jpg`;
const PORTRAIT = `${BASE}assets/shreyas/portrait-studio.jpg`;
const pad = (n: number) => String(n).padStart(2, '0');
const at = (i: number, extra: Record<string, string | number> = {}) => ({ '--i': i, ...extra }) as CSSProperties;

type More = ((id: DetailId, from: HTMLElement) => void) | undefined;
interface Props {
  go: (id: string) => void;
  live: boolean;
  onMore?: More;
}

/** Adds `is-in` once the element is on screen (also inside the moving phone screen). */
function useIn<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return void el.classList.add('is-in');
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Words that rise out of a blur, one after another. `soft` greys the words from that index on. */
function Words({ text, soft = Infinity, as: Tag = 'h3', className = '' }: { text: string; soft?: number; as?: 'h3' | 'p' | 'b'; className?: string }) {
  const ref = useIn<HTMLHeadingElement>();
  const T = Tag as 'h3';
  return (
    <T ref={ref} className={`sx-words ${className}`}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span className={i >= soft ? 'is-soft' : undefined} style={at(i)}>
            {w}
          </span>{' '}
        </Fragment>
      ))}
    </T>
  );
}

function Head({ kicker, title, soft, sub, center = false }: { kicker: string; title: string; soft?: number; sub?: string; center?: boolean }) {
  const ref = useIn<HTMLParagraphElement>();
  return (
    <header className={`sx-head ${center ? 'is-center' : ''}`}>
      <span className="sx-chip">
        <i aria-hidden="true" /> {kicker}
      </span>
      <Words text={title} soft={soft} className="sx-h" />
      {sub && (
        <p ref={ref} className="sx-sub sx-rise">
          {sub}
        </p>
      )}
    </header>
  );
}

/** Children rise in one after another (each child reads --i for its delay). */
function Rise({ className, children }: { className: string; children: ReactNode }) {
  const ref = useIn<HTMLDivElement>();
  return (
    <div ref={ref} className={`sx-stagger ${className}`}>
      {children}
    </div>
  );
}

/**
 * A stack of cards. The front card is `active`; when it changes the old front card swings out to
 * the side and tucks in at the back. Advances on its own every few seconds while on screen
 * (unless the visitor prefers less motion, or is pointing at it).
 */
function Deck({ count, active, onChange, label, children }: { count: number; active: number; onChange: (i: number) => void; label: string; children: (i: number) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const prev = useRef(active);
  const hover = useRef(false);
  const seen = useRef(false);

  // Swing the previous front card out and to the back.
  useEffect(() => {
    const was = prev.current;
    prev.current = active;
    if (was === active) return;
    const el = box.current?.querySelector<HTMLElement>(`[data-card="${was}"]`);
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dir = was % 2 ? -1 : 1;
    el.animate(
      [
        { transform: 'translate3d(0,0,0) rotate(0deg) scale(1)', zIndex: 50 },
        { transform: `translate3d(${dir * 62}%, -6%, 0) rotate(${dir * 9}deg) scale(0.96)`, zIndex: 50, offset: 0.42 },
        { transform: `translate3d(${dir * 18}%, -10%, 0) rotate(${dir * 4}deg) scale(0.9)`, zIndex: 0, offset: 0.7 },
        { transform: el.style.transform || 'none', zIndex: 0 },
      ],
      { duration: 820, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [active]);

  // Auto advance while visible.
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => (seen.current = !!e?.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const t = window.setInterval(() => {
      if (seen.current && !hover.current && !document.hidden) onChange((prev.current + 1) % count);
    }, 4200);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [count, onChange]);

  return (
    <div
      ref={box}
      className="sx-deck"
      role="group"
      aria-roledescription="card stack"
      aria-label={label}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
    >
      {Array.from({ length: count }, (_, i) => {
        const depth = (i - active + count) % count;
        const tilt = depth === 0 ? 0 : (depth % 2 ? 1 : -1) * Math.min(depth, 2) * 2.2;
        const to = `translate3d(0, ${-depth * 14}px, 0) rotate(${tilt}deg) scale(${1 - depth * 0.05})`;
        return (
          <div
            key={i}
            data-card={i}
            className={`sx-deck-card ${depth === 0 ? 'is-front' : ''}`}
            style={{ transform: to, zIndex: count - depth, opacity: depth > 2 ? 0 : 1 }}
            aria-hidden={depth !== 0}
          >
            {children(i)}
          </div>
        );
      })}
      <div className="sx-deck-dots" role="tablist" aria-label={`${label}: pick a card`}>
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={`Card ${i + 1}`} className={i === active ? 'is-on' : ''} onClick={() => onChange(i)} />
        ))}
      </div>
    </div>
  );
}

function Badge({ icon: I, children }: { icon: Icon; children: ReactNode }) {
  return (
    <span className="sx-badge">
      <span>
        <I weight="bold" aria-hidden="true" />
      </span>
      {children}
    </span>
  );
}

// --- Education ------------------------------------------------------------------------------------

const SCHOOL_LOOK: Record<string, { img: string; line: string; bar: [string, string] }> = {
  'Fulton Science Academy': { img: 'classroom', line: `${profile.grade} in ${profile.schoolTown}, taking all Honors and AP courses.`, bar: ['Now', profile.grade] },
  'Francis Granger Middle School': { img: 'chalkboard-math', line: 'Middle school, where Project Arrow advanced classes continued.', bar: ['Stage', 'Middle school'] },
  'Nancy Young Elementary': { img: 'writing', line: 'Elementary school, where he joined Project Arrow in 2nd grade.', bar: ['Stage', 'Elementary'] },
};

function EducationSec(_: Props) {
  const list = [...schools].reverse();
  return (
    <section className="sx-sec" data-sec="about">
      <Head kicker="Education" title="Where he learns, and what he loves to study." soft={4} sub="From Project Arrow in 2nd grade to a full Honors and AP schedule at Fulton Science Academy." center />
      <Rise className="sx-svc-grid">
        {list.map((s, i) => {
          const look = SCHOOL_LOOK[s.name] ?? { img: 'classroom', line: s.level, bar: ['Stage', s.level] as [string, string] };
          return (
            <article key={s.name} className="sx-svc" style={at(i)}>
              <figure>
                <img src={photo(look.img)} alt="" loading="lazy" draggable={false} />
              </figure>
              <div className="sx-svc-text">
                <h4>{s.name}</h4>
                <p>{look.line}</p>
              </div>
              <p className="sx-svc-bar">
                <span>{look.bar[0]}</span> <b>{look.bar[1]}</b>
              </p>
            </article>
          );
        })}
        <article className="sx-svc is-plain" style={at(3)}>
          <div className="sx-svc-icons" aria-hidden="true">
            <Code weight="duotone" />
            <Cpu weight="duotone" />
            <ChartLineUp weight="duotone" />
          </div>
          <div className="sx-svc-text">
            <h4>Favourite subjects</h4>
            <ul className="sx-pills">
              {subjects.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </article>
      </Rise>
    </section>
  );
}

// --- Technical skills: numbered list + shuffling deck ------------------------------------------------

const SKILL_GROUPS: { name: string; badge: string; icon: Icon; items: string[]; line: string }[] = [
  { name: 'Languages', badge: 'Code', icon: Code, items: languages, line: 'The programming languages he writes.' },
  { name: 'Computing', badge: 'AP and AI', icon: Cpu, items: [skillsCourses.ap[0]!, skillsCourses.ap[1]!, 'Artificial Intelligence'], line: 'Computer science and AI courses.' },
  { name: 'Science', badge: 'AP science', icon: Atom, items: skillsCourses.ap.slice(2), line: 'Advanced Placement sciences.' },
  { name: 'Beyond STEM', badge: 'Honors', icon: BookOpenText, items: skillsCourses.other.filter((c) => c !== 'Artificial Intelligence'), line: 'Literature, language and business.' },
];

function Process({ items, active, onPick, live }: { items: string[]; active: number; onPick: (i: number) => void; live: boolean }) {
  return (
    <ol className="sx-steps">
      {items.map((t, i) => (
        <li key={t}>
          <button type="button" className={i === active ? 'is-on' : ''} tabIndex={live ? undefined : -1} onClick={() => onPick(i)} onPointerEnter={() => onPick(i)}>
            <sup>{pad(i + 1)}</sup>
            {t}
          </button>
        </li>
      ))}
    </ol>
  );
}

function SkillsSec({ live }: Props) {
  const [k, setK] = useState(0);
  return (
    <section className="sx-sec is-white" data-sec="skills">
      <Head kicker="Technical skills" title="Courses and the languages he codes in." soft={3} />
      <div className="sx-split">
        <Process items={SKILL_GROUPS.map((g) => g.name)} active={k} onPick={setK} live={live} />
        <Deck count={SKILL_GROUPS.length} active={k} onChange={setK} label="Technical skills">
          {(i) => {
            const g = SKILL_GROUPS[i]!;
            return (
              <div className="sx-dcard">
                <div className="sx-dcard-top">
                  <span className="sx-slash">/{pad(i + 1)}</span>
                  <Badge icon={g.icon}>{g.badge}</Badge>
                </div>
                <h4>{g.name}</h4>
                <p>{g.line}</p>
                <ul className="sx-dlist">
                  {g.items.map((x) => (
                    <li key={x}>
                      <ArrowRight weight="bold" aria-hidden="true" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }}
        </Deck>
      </div>
      <Rise className="sx-stack">
        {SKILL_GROUPS.map((g, i) => (
          <article key={g.name} className="sx-mcard" style={at(i)}>
            <div className="sx-dcard-top">
              <span className="sx-slash">/{pad(i + 1)}</span>
              <Badge icon={g.icon}>{g.badge}</Badge>
            </div>
            <h4>{g.name}</h4>
            <ul className="sx-tags">
              {g.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </article>
        ))}
      </Rise>
    </section>
  );
}

// --- Awards: a deck of award cards beside the full list ---------------------------------------------

const AWARD_PHOTO: Record<string, string> = { cbnrp: 'trophy', honors: 'classroom', psat: 'writing', map: 'chalkboard-math', arrow: 'archery-target', authors: 'writing', minimed: 'stethoscope' };
const KIND_ICON: Record<string, Icon> = { Award: Trophy, Honor: Medal, Score: ChartLineUp, Program: Student, Certificate: GraduationCap };

function AwardsSec({ live, onMore }: Props) {
  const [k, setK] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <section className="sx-sec" data-sec="awards">
      <Head kicker="Achievements" title={`${achievements.length} awards and honors since 2nd grade.`} soft={4} sub="Qualified for National Merit Scholarship recognition (Grade 11 PSAT, 99th percentile and above), top 99% on the PSAT and MAP, the Principal’s Honors List and the College Board National Recognition Program." />
      <div className="sx-split is-flip">
        <Deck count={achievements.length} active={k} onChange={setK} label="Awards">
          {(i) => {
            const a = achievements[i]!;
            return (
              <div className="sx-acard">
                <figure>
                  <img src={photo(AWARD_PHOTO[a.id] ?? 'trophy')} alt="" loading="lazy" draggable={false} />
                  <Badge icon={KIND_ICON[a.kind] ?? Trophy}>{a.kind}</Badge>
                </figure>
                <div className="sx-acard-text">
                  <h4>{a.title}</h4>
                  <p>
                    <b>{a.value}</b> · {a.when}
                  </p>
                </div>
              </div>
            );
          }}
        </Deck>
        <div className="sx-alist-wrap">
          <ol className="sx-alist">
            {achievements.map((a, i) => (
              <li key={a.id}>
                <button type="button" className={i === k ? 'is-on' : ''} tabIndex={live ? undefined : -1} onClick={() => setK(i)} onPointerEnter={() => setK(i)}>
                  <span className="sx-alist-n">{pad(i + 1)}</span>
                  <span className="sx-alist-t">{a.title}</span>
                  <span className="sx-alist-v">{a.value}</span>
                </button>
              </li>
            ))}
          </ol>
          <button ref={btn} type="button" className="sx-btn is-dark" tabIndex={live ? undefined : -1} data-voice="view more awards" onClick={() => onMore?.('awards', btn.current!)}>
            View more <ArrowUpRight weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
      <Rise className="sx-stack">
        {achievements.map((a, i) => {
          const I = KIND_ICON[a.kind] ?? Trophy;
          return (
            <article key={a.id} className="sx-arow" style={at(i)}>
              <img src={photo(AWARD_PHOTO[a.id] ?? 'trophy')} alt="" loading="lazy" draggable={false} />
              <div>
                <span className="sx-arow-kind">
                  <I weight="bold" aria-hidden="true" /> {a.kind}
                </span>
                <h4>{a.title}</h4>
                <p>
                  <b>{a.value}</b> · {a.when}
                </p>
              </div>
            </article>
          );
        })}
        <button type="button" className="sx-btn is-dark is-block sx-stack-btn" style={at(achievements.length)} tabIndex={live ? undefined : -1} onClick={(e) => onMore?.('awards', e.currentTarget)}>
          View all award details <ArrowUpRight weight="bold" aria-hidden="true" />
        </button>
      </Rise>
    </section>
  );
}

// --- Activities and volunteering ------------------------------------------------------------------------


function LifeSec(_: Props) {
  return (
    <section className="sx-sec is-white" data-sec="life">
      <Head kicker="Activities and Experience" title="Volunteering, sport, music and competitions." soft={1} center />
      <Rise className="sx-xp">
        <ExperienceGrid tone="studio" />
      </Rise>
    </section>
  );
}

// --- Peer tutoring ---------------------------------------------------------------------------------------

function TutoringSec({ live, onMore }: Props) {
  const btn = useRef<HTMLButtonElement>(null);
  const facts: { icon: Icon; k: string; v: string }[] = [
    { icon: Student, k: 'Who', v: '7th and 8th graders' },
    { icon: Atom, k: 'Subjects', v: 'Math and Science' },
    { icon: UsersThree, k: 'How', v: 'One on one and small groups' },
  ];
  return (
    <section className="sx-sec" data-sec="tutoring">
      <Head kicker="Peer tutoring" title="Helping others learn, at lunch and after school." soft={3} />
      <Rise className="sx-tutor">
        <figure className="sx-tutor-photo" style={at(0)}>
          <img src={photo('chalkboard-math')} alt="" loading="lazy" draggable={false} />
          <Badge icon={ChalkboardTeacher}>Peer tutor</Badge>
        </figure>
        <div className="sx-tutor-side" style={at(1)}>
          <ul className="sx-facts">
            {facts.map((f, i) => (
              <li key={f.k} style={at(i + 1)}>
                <span className="sx-facts-ico" aria-hidden="true">
                  <f.icon weight="duotone" />
                </span>
                <span>
                  <small>{f.k}</small>
                  <b>{f.v}</b>
                </span>
              </li>
            ))}
          </ul>
          <p className="sx-quote">{resume.tutoring[2]}</p>
          <button ref={btn} type="button" className="sx-btn is-dark" tabIndex={live ? undefined : -1} data-voice="view more tutoring" onClick={() => onMore?.('tutoring', btn.current!)}>
            View more <ArrowUpRight weight="bold" aria-hidden="true" />
          </button>
        </div>
      </Rise>
    </section>
  );
}

// --- Goals: numbered list + deck ----------------------------------------------------------------------------

const GOALS: { name: string; badge: string; icon: Icon; line: string }[] = [
  { name: 'University', badge: 'Next', icon: GraduationCap, line: goals.education },
  { name: 'AI engineering', badge: 'Career', icon: Cpu, line: goals.career[0] ?? '' },
  { name: 'Oncology lab', badge: 'Research', icon: Microscope, line: goals.career[1] ?? '' },
  { name: 'Trading platform', badge: 'Build', icon: ChartLineUp, line: goals.career[2] ?? '' },
];

function GoalsSec({ live }: Props) {
  const [k, setK] = useState(0);
  return (
    <section className="sx-sec is-white" data-sec="goals">
      <Head kicker="Goals" title="Where he is heading next." soft={3} />
      <div className="sx-split">
        <Process items={GOALS.map((g) => g.name)} active={k} onPick={setK} live={live} />
        <Deck count={GOALS.length} active={k} onChange={setK} label="Goals">
          {(i) => {
            const g = GOALS[i]!;
            return (
              <div className="sx-dcard is-goal">
                <div className="sx-dcard-top">
                  <span className="sx-slash">/{pad(i + 1)}</span>
                  <Badge icon={g.icon}>{g.badge}</Badge>
                </div>
                <h4>{g.name}</h4>
                <p className="sx-dcard-big">{g.line}</p>
              </div>
            );
          }}
        </Deck>
      </div>
      <Rise className="sx-stack sx-tl">
        {GOALS.map((g, i) => (
          <article key={g.name} className="sx-tl-item" style={at(i)}>
            <span className="sx-tl-dot" aria-hidden="true">
              <g.icon weight="bold" />
            </span>
            <div className="sx-mcard">
              <div className="sx-dcard-top">
                <span className="sx-slash">/{pad(i + 1)}</span>
                <span className="sx-tl-tag">{g.badge}</span>
              </div>
              <h4>{g.name}</h4>
              <p>{g.line}</p>
            </div>
          </article>
        ))}
      </Rise>
    </section>
  );
}

// --- Contact (dark) and footer ----------------------------------------------------------------------------

function ContactSec({ live, onMore }: Props) {
  const tab = live ? undefined : -1;
  const btn = useRef<HTMLButtonElement>(null);
  const rows = [
    { k: 'Email', v: <>{contact.email.split('@')[0]}<wbr />@{contact.email.split('@')[1]}</>, href: `mailto:${contact.email}`, icon: EnvelopeSimple },
    { k: 'Phone', v: contact.phone, href: `tel:${contact.phone.replace(/\D/g, '')}`, icon: Phone },
    { k: 'Resume', v: 'Download his resume (PDF)', href: contact.resume, icon: DownloadSimple, download: true },
  ];
  return (
    <section className="sx-sec is-dark" data-sec="contact">
      <div className="sx-contact">
        <div className="sx-contact-l">
          <Words text="Get in touch." as="b" className="sx-h is-light" />
          <p className="sx-sub">Questions about Oncure, the trading app or tutoring? He would love to hear from you.</p>
          <figure className="sx-contact-photo">
            <img src={PORTRAIT} alt={live ? `${profile.name}, in a dark suit and blue tie` : ''} loading="lazy" draggable={false} />
          </figure>
          <div className="sx-contact-btns">
            <button ref={btn} type="button" className="sx-btn is-white is-wide" tabIndex={tab} data-voice="contact form" onClick={() => onMore?.('contact', btn.current!)}>
              <NotePencil weight="bold" aria-hidden="true" /> <span>Send a message</span>
            </button>
            <a className="sx-btn is-ghost" href={`tel:${contact.phone.replace(/\D/g, '')}`} tabIndex={tab} aria-label={`Call ${contact.phone}`}>
              <Phone weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="sx-contact-r">
          {rows.map((r) => (
            <div key={r.k} className="sx-field">
              <small>{r.k}</small>
              <a href={r.href} tabIndex={tab} {...(r.download ? { download: '' } : {})}>
                <r.icon weight="bold" aria-hidden="true" /> {r.v}
                <ArrowUpRight weight="bold" aria-hidden="true" className="sx-field-go" />
              </a>
            </div>
          ))}
          <button type="button" className="sx-btn is-white is-block" tabIndex={tab} onClick={(e) => onMore?.('contact', e.currentTarget)}>
            Write to {profile.firstName}
          </button>
        </div>
      </div>
    </section>
  );
}

function FooterSec({ go, live }: Props) {
  const tab = live ? undefined : -1;
  const links: [string, string][][] = [
    [
      ['home', 'Home'],
      ['work', 'Work'],
      ['skills', 'Skills'],
      ['awards', 'Awards'],
    ],
    [
      ['about', 'Education'],
      ['life', 'Activities'],
      ['tutoring', 'Tutoring'],
      ['contact', 'Contact'],
    ],
  ];
  return (
    <footer className="sx-sec sx-foot" data-sec="footer">
      <div className="sx-foot-top">
        <div>
          <Words text="Keep in touch." as="b" className="sx-h" />
          <p className="sx-sub">A junior at {profile.school}, exploring AI, cancer research and FinTech.</p>
          <p className="sx-foot-mail">
            <small>Email</small>
            <a href={`mailto:${contact.email}`} tabIndex={tab}>
              {contact.email.split('@')[0]}
              <wbr />@{contact.email.split('@')[1]}
            </a>
          </p>
        </div>
        <nav className="sx-foot-links" aria-label="Footer">
          {links.map((col, c) => (
            <div key={c}>
              <small>{c ? 'More' : 'Main'}</small>
              {col.map(([id, l]) => (
                <button key={id} type="button" tabIndex={tab} onClick={() => go(id)}>
                  {l}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="sx-foot-icons">
        <a href={`mailto:${contact.email}`} tabIndex={tab} aria-label="Email">
          <EnvelopeSimple weight="bold" />
        </a>
        <a href={`tel:${contact.phone.replace(/\D/g, '')}`} tabIndex={tab} aria-label="Phone">
          <Phone weight="bold" />
        </a>
        <a href={contact.resume} download tabIndex={tab} aria-label="Download resume">
          <DownloadSimple weight="bold" />
        </a>
      </div>
      <p className="sx-foot-name" aria-hidden="true">
        {profile.name}
      </p>
      <p className="sx-foot-note">Oncure is a conceptual research proposal, not an existing or clinically validated treatment. Trading app figures are hypothetical sample data, not financial advice.</p>
    </footer>
  );
}

/** Everything from Education down, in order. */
export function StudioSections(p: Props) {
  return (
    <div className="sx">
      <EducationSec {...p} />
      <SkillsSec {...p} />
      <AwardsSec {...p} />
      <LifeSec {...p} />
      <TutoringSec {...p} />
      <GoalsSec {...p} />
      <ContactSec {...p} />
      <FooterSec {...p} />
    </div>
  );
}
