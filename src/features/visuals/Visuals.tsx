import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  Atom,
  BookOpen,
  Brain,
  Briefcase,
  Certificate,
  ChalkboardTeacher,
  ChartBar,
  ChartLineUp,
  ChatCircleText,
  Code,
  Cpu,
  Dna,
  Exam,
  Flask,
  Function as FunctionIcon,
  GraduationCap,
  Guitar,
  HandFist,
  HandHeart,
  Lightbulb,
  MathOperations,
  Medal,
  Microscope,
  Notebook,
  PencilLine,
  Star,
  Stethoscope,
  SwimmingPool,
  Translate,
  Trophy,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';
import { achievements, activities, courses, goals, languages, percentiles, profile, researchInterests, resume, schools, subjects, volunteering } from '@/content/portfolio';
import './visuals.css';

/**
 * His information as pictures, not paragraphs: certificates, score bars and a score ring, course
 * and language tiles, activity cards, tutoring icons, a goals path and an education timeline.
 * Every block rises in when it comes into view (each item a little after the one before).
 * Colours and fonts come from the page around them (--vz-* variables in visuals.css), so the same
 * blocks fit Studio, Classic and the detail pages.
 */

const BASE = import.meta.env.BASE_URL;

/** Adds `is-in` to every [data-vz] inside the block the first time it is seen. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>('[data-vz]')];
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

const at = (i: number, extra?: Record<string, string | number>) => ({ '--i': i, ...extra }) as CSSProperties;

/** A block whose [data-vz] children rise in when seen. Also used by the details. */
export function Reveal({ className, children }: { className: string; children: ReactNode }) {
  return <Block className={className}>{children}</Block>;
}

function Block({ className, children }: { className: string; children: ReactNode }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`vz ${className}`}>
      {children}
    </div>
  );
}

// --- Awards: certificates -----------------------------------------------------------------------

const ISSUER: Record<string, string> = {
  cbnrp: 'College Board',
  honors: 'Fulton Science Academy',
  psat: 'College Board · PSAT',
  map: 'NWEA · MAP Growth',
  arrow: 'Indian Prairie School District 204',
  authors: 'Indian Prairie School District 204',
  minimed: 'Mini-Medical School',
};
const KIND_ICON: Record<string, Icon> = { Award: Trophy, Honor: Medal, Score: ChartBar, Program: Star, Certificate: Certificate };
const TONES = ['#c9a227', '#2f5fd6', '#7a3cff', '#0f9488', '#e8432f', '#f97316', '#0ea5e9'];

export function Certificates() {
  return (
    <Block className="vz-certs">
      {achievements.map((a, i) => {
        const I = KIND_ICON[a.kind] ?? Star;
        return (
          <figure key={a.id} className="vz-cert" data-vz style={at(i, { '--tone': TONES[i % TONES.length]! })}>
            <div className="vz-cert-paper">
              <span className="vz-cert-issuer">{ISSUER[a.id]}</span>
              <span className="vz-cert-kind">{a.kind}</span>
              <b className="vz-cert-title">{a.title}</b>
              <span className="vz-cert-to">presented to</span>
              <span className="vz-cert-name">{profile.name}</span>
              <span className="vz-cert-meta">
                {a.value} · {a.when}
              </span>
              <span className="vz-cert-seal" aria-hidden="true">
                <I weight="fill" />
              </span>
            </div>
            {/* A real scan saved as public/assets/certificates/<id>.jpg replaces the design. */}
            <img className="vz-cert-photo" src={`${BASE}assets/certificates/${a.id}.jpg`} alt="" loading="lazy" onError={(e) => e.currentTarget.remove()} />
            <figcaption className="vz-sr">{a.detail}</figcaption>
          </figure>
        );
      })}
    </Block>
  );
}

// --- Scores: percentile bars and the PSAT 8/9 ring ----------------------------------------------

export function Scores() {
  const psat = 1280;
  const of = 1440;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <Block className="vz-scores">
      {(['PSAT', 'MAP'] as const).map((test, k) => (
        <div key={test} className="vz-panel vz-barbox" data-vz style={at(k)}>
          <p className="vz-label">{test}, by grade</p>
          <div className="vz-bars">
            {percentiles
              .filter((p) => p.test === test)
              .map((p, i) => (
                <div key={p.grade} className="vz-bar" style={at(i, { '--v': p.value })}>
                  <b>Top {p.value}%</b>
                  <span className="vz-bar-track">
                    <span className="vz-bar-fill" />
                  </span>
                  <small>{p.grade.replace(' grade', '')}</small>
                </div>
              ))}
          </div>
        </div>
      ))}
      <div className="vz-panel vz-ringbox" data-vz style={at(2)}>
        <svg viewBox="0 0 120 120" className="vz-ring" aria-hidden="true">
          <circle cx="60" cy="60" r={r} className="vz-ring-bg" />
          <circle cx="60" cy="60" r={r} className="vz-ring-fg" style={{ strokeDasharray: c, '--off': c * (1 - psat / of), '--c': c } as CSSProperties} />
        </svg>
        <div className="vz-ring-text">
          <b>{psat}</b>
          <small>out of {of}</small>
        </div>
        <p className="vz-label">PSAT 8/9 score in 8th grade</p>
      </div>
    </Block>
  );
}

// --- Courses and languages -----------------------------------------------------------------------

const COURSE_ICON: { test: RegExp; icon: Icon; tone: string }[] = [
  { test: /Computer Science/, icon: Code, tone: '#2f5fd6' },
  { test: /Precalculus/, icon: FunctionIcon, tone: '#7a3cff' },
  { test: /Biology/, icon: Dna, tone: '#0f9488' },
  { test: /Chemistry/, icon: Flask, tone: '#e8432f' },
  { test: /Physics/, icon: Atom, tone: '#0ea5e9' },
  { test: /Artificial Intelligence/, icon: Brain, tone: '#c026d3' },
  { test: /English/, icon: BookOpen, tone: '#a16207' },
  { test: /Spanish/, icon: Translate, tone: '#f97316' },
  { test: /Entrepreneurship/, icon: Lightbulb, tone: '#ca8a04' },
];
const courseLook = (c: string) => COURSE_ICON.find((x) => x.test.test(c)) ?? { icon: BookOpen, tone: '#64748b' };

const LANG_LOOK: Record<string, { mark: string; tone: string; ink: string; line: string }> = {
  JavaScript: { mark: 'JS', tone: '#f7df1e', ink: '#111', line: 'The language of the web' },
  Python: { mark: 'Py', tone: '#3776ab', ink: '#ffd43b', line: 'A favourite for data and AI' },
  Java: { mark: 'Java', tone: '#e76f00', ink: '#fff', line: 'AP Computer Science A' },
};

export function Courses() {
  return (
    <Block className="vz-courses">
      {courses.map((c, i) => {
        const { icon: I, tone } = courseLook(c);
        return (
          <div key={c} className="vz-course" data-vz style={at(i, { '--tone': tone })}>
            <span className="vz-ico">
              <I weight="duotone" />
            </span>
            <b>{c}</b>
          </div>
        );
      })}
    </Block>
  );
}

export function Languages() {
  return (
    <Block className="vz-langs">
      {languages.map((l, i) => {
        const look = LANG_LOOK[l] ?? { mark: l.slice(0, 2), tone: '#334155', ink: '#fff', line: '' };
        return (
          <div key={l} className="vz-lang" data-vz style={at(i, { '--tone': look.tone, '--ink': look.ink })}>
            <span className="vz-lang-mark">{look.mark}</span>
            <span>
              <b>{l}</b>
              <small>{look.line}</small>
            </span>
          </div>
        );
      })}
    </Block>
  );
}

// --- Activities and volunteering -----------------------------------------------------------------

const ACT_LOOK: Record<string, { icon: Icon; tone: string }> = {
  'Swim Atlanta': { icon: SwimmingPool, tone: '#0ea5e9' },
  'Muay Thai': { icon: HandFist, tone: '#e11d48' },
  Guitar: { icon: Guitar, tone: '#f59e0b' },
  'Science Olympiad': { icon: Atom, tone: '#16a34a' },
  DECA: { icon: Briefcase, tone: '#7c3aed' },
  'TAMA Medical Camp': { icon: Stethoscope, tone: '#0f9488' },
  'Sri Shirdi Sai Temple': { icon: HandHeart, tone: '#ea580c' },
  'Peer tutoring': { icon: ChalkboardTeacher, tone: '#4f46e5' },
};

export function Activities() {
  const all = [...activities.map((a) => ({ ...a, tag: 'Activity' })), ...volunteering.map((v) => ({ ...v, tag: 'Volunteering' }))];
  return (
    <Block className="vz-acts">
      {all.map((a, i) => {
        const look = ACT_LOOK[a.title] ?? { icon: Star, tone: '#64748b' };
        const I = look.icon;
        return (
          <div key={a.title} className="vz-act" data-vz style={at(i, { '--tone': look.tone })}>
            <span className="vz-act-art" aria-hidden="true">
              <I weight="duotone" />
            </span>
            <span className="vz-tag">{a.tag}</span>
            <b>{a.title}</b>
            <small>{a.role}</small>
          </div>
        );
      })}
    </Block>
  );
}

// --- Peer tutoring ------------------------------------------------------------------------------

const TUTOR_ICONS: Icon[] = [Exam, Notebook, PencilLine, MathOperations, UsersThree, ChatCircleText];

export function Tutoring() {
  return (
    <Block className="vz-tutor">
      {resume.tutoring.map((t, i) => {
        const I = TUTOR_ICONS[i % TUTOR_ICONS.length]!;
        return (
          <div key={t} className="vz-tip" data-vz style={at(i)}>
            <span className="vz-ico is-round">
              <I weight="duotone" />
            </span>
            <p>{t}</p>
          </div>
        );
      })}
    </Block>
  );
}

// --- Goals: a path ------------------------------------------------------------------------------

export function Goals() {
  const steps = [
    { icon: GraduationCap, kicker: 'Next', title: 'A bachelor’s degree', line: goals.education },
    ...goals.career.map((g, i) => ({ icon: [Cpu, Microscope, ChartLineUp][i] ?? Star, kicker: 'Career', title: g.replace(/\.$/, ''), line: '' })),
  ];
  return (
    <Block className="vz-goals">
      <span className="vz-goals-line" data-vz aria-hidden="true" />
      {steps.map((s, i) => {
        const I = s.icon;
        return (
          <div key={s.title} className="vz-goal" data-vz style={at(i)}>
            <span className="vz-ico is-round is-big">
              <I weight="duotone" />
            </span>
            <span className="vz-tag">{s.kicker}</span>
            <b>{s.title}</b>
            {s.line && <small>{s.line}</small>}
          </div>
        );
      })}
    </Block>
  );
}

// --- Education and interests ---------------------------------------------------------------------

const SUBJECT_ICON: Record<string, Icon> = { 'Computer Science': Code, 'Artificial Intelligence': Brain, 'Business and FinTech': ChartLineUp };

export function Education() {
  const list = [...schools].reverse();
  return (
    <Block className="vz-edu">
      <div className="vz-schools">
        {list.map((s, i) => (
          <div key={s.name} className={`vz-school ${i === 0 ? 'is-now' : ''}`} data-vz style={at(i)}>
            {i === 0 ? <img src={`${BASE}assets/photos/classroom.jpg`} alt="" loading="lazy" /> : null}
            <span className="vz-tag">{i === 0 ? 'Present' : s.level}</span>
            <b>{s.name}</b>
            <small>{i === 0 ? `${profile.grade} · ${profile.schoolTown} · all Honors and AP` : s.level}</small>
          </div>
        ))}
      </div>
      <div className="vz-interests">
        {subjects.map((s, i) => {
          const I = SUBJECT_ICON[s] ?? Star;
          return (
            <span key={s} className="vz-pill" data-vz style={at(i)}>
              <I weight="duotone" aria-hidden="true" /> {s}
            </span>
          );
        })}
        {researchInterests.map((r, i) => (
          <span key={r.title} className="vz-pill is-accent" data-vz style={at(i + 3)}>
            {i === 0 ? <Microscope weight="duotone" aria-hidden="true" /> : <ChartLineUp weight="duotone" aria-hidden="true" />} Research: {r.title}
          </span>
        ))}
      </div>
    </Block>
  );
}
