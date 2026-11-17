import type { CSSProperties } from 'react';
import { ArrowUpRight, ChalkboardTeacher, GraduationCap, Medal, Sparkle } from '@phosphor-icons/react';
import { achievements, goals, profile, researchInterests, resume, schools, subjects } from '@/content/portfolio';
import { ContactPanel } from '@/features/details/Contact';
import '@/features/details/style';
import { Activities, Certificates, Scores } from '@/features/visuals/Visuals';
import { OncureFull, TradingFull } from './Projects';
import { Sec, useSeen, Words } from './ui';
import './more.css';
import './projects.css';

/**
 * After the scroll film: Oncure and the trading app in full (see Projects.tsx), then the rest of his story in one cinematic, dark style (black with violet and
 * blue light): two-tone headlines that light up word by word, a large school card, number cards
 * for his scores, an editorial list for tutoring, step cards for his goals and a blue finale with
 * the contact form. Every fact comes from content/portfolio.ts. The menu bar's links reach the
 * sections by id (cx-about, cx-wall, cx-life, cx-tutoring, cx-goals, cx-contact).
 */

const BASE = import.meta.env.BASE_URL;

/** Big words that drift sideways across the section. */
function Drift({ items }: { items: string[] }) {
  return (
    <div className="cx-drift" aria-hidden="true">
      <div className="cx-drift-track">
        {[0, 1].map((k) => (
          <span key={k}>
            {items.map((t) => (
              <em key={t}>
                {t} <i>✦</i>{' '}
              </em>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function Learn() {
  const ref = useSeen<HTMLDivElement>();
  const [elementary, middle, high] = schools;
  return (
    <>
      <div ref={ref} className="cx-learn">
        <article className="cx-feature">
          <img src={`${BASE}assets/photos/classroom.jpg`} alt="" loading="lazy" />
          <span className="cx-feature-shade" aria-hidden="true" />
          <span className="cx-tag">Present</span>
          <div className="cx-feature-text">
            <h3>{high?.name ?? profile.school}</h3>
            <p>
              {profile.grade} · {profile.schoolTown} · all Honors and AP
            </p>
          </div>
        </article>
        <div className="cx-learn-side">
          {[middle, elementary].map((s, i) =>
            s ? (
              <article key={s.name} className="cx-glass" style={{ '--i': i + 1 } as CSSProperties}>
                <span className="cx-glass-ico">
                  <GraduationCap weight="duotone" aria-hidden="true" />
                </span>
                <small>{s.level}</small>
                <b>{s.name}</b>
              </article>
            ) : null,
          )}
        </div>
      </div>
      <Drift items={[...subjects, ...researchInterests.map((r) => `Research: ${r.title}`)]} />
    </>
  );
}

function Numbers() {
  const ref = useSeen<HTMLDivElement>();
  const cards = [
    { v: 'Top 99%', k: 'PSAT', s: '8th and 10th grade', tone: 'is-white' },
    { v: 'Top 99%', k: 'MAP', s: '10th grade', tone: 'is-blue' },
    { v: '1280', k: 'PSAT 8/9 score', s: 'out of 1440', tone: 'is-black' },
    { v: String(achievements.length), k: 'Awards and honors', s: 'From 2nd grade to now', tone: 'is-violet' },
  ];
  return (
    <div ref={ref} className="cx-nums">
      {cards.map((c, i) => (
        <article key={c.k} className={`cx-num ${c.tone}`} style={{ '--i': i } as CSSProperties}>
          <Medal weight="duotone" aria-hidden="true" />
          <b>{c.v}</b>
          <span>{c.k}</span>
          <small>{c.s}</small>
        </article>
      ))}
    </div>
  );
}

function TutorList() {
  const ref = useSeen<HTMLOListElement>();
  return (
    <ol ref={ref} className="cx-list">
      {resume.tutoring.map((t, i) => (
        <li key={t} style={{ '--i': i } as CSSProperties}>
          <span className="cx-list-n">{String(i + 1).padStart(2, '0')}</span>
          <p>{t}</p>
        </li>
      ))}
    </ol>
  );
}

function Steps() {
  const ref = useSeen<HTMLDivElement>();
  const steps = [{ k: 'Next', t: goals.education }, ...goals.career.map((t) => ({ k: 'Career', t }))];
  return (
    <div ref={ref} className="cx-steps">
      {steps.map((s, i) => (
        <article key={s.t} className="cx-step" style={{ '--i': i } as CSSProperties}>
          <span className="cx-step-n">{String(i + 1).padStart(2, '0')}</span>
          <small>{s.k}</small>
          <p>{s.t.replace(/\.$/, '')}</p>
        </article>
      ))}
    </div>
  );
}

function Finale() {
  const ref = useSeen<HTMLElement>();
  return (
    <section ref={ref} id="cx-contact" className="cx cx-finale" aria-labelledby="cx-contact-h">
      <span className="cx-orb" aria-hidden="true" />
      <div className="cx-in">
        <header className="cx-finale-head">
          <p className="cx-kicker">
            <Sparkle weight="fill" aria-hidden="true" /> Contact
          </p>
          <Words lead="Questions?" rest="Let’s talk." id="cx-contact-h" />
          <p className="cx-lede">About Oncure, the trading app or tutoring. Messages are read by his family first.</p>
          <a className="cx-cta" href="#cx-contact-form">
            Write a message <ArrowUpRight weight="bold" aria-hidden="true" />
          </a>
        </header>
        <div id="cx-contact-form" className="dt dt--classic cx-contact">
          <ContactPanel />
        </div>
      </div>
    </section>
  );
}

export function ClassicMore() {
  return (
    <div className="cx-wrap">
      <OncureFull />
      <TradingFull />

      <Sec id="about" kicker="Education" lead={`Where ${profile.firstName}`} rest="learns." lede={`A ${profile.grade.toLowerCase()} at ${profile.school}, taking all Honors and AP courses.`}>
        <Learn />
      </Sec>

      <Sec id="wall" tone="ink" kicker="Achievements and certificates" lead="Awards" rest="and scores." lede="Every award and certificate, and how his test scores compare nationwide.">
        <Numbers />
        <div className="cx-gap" />
        <div className="vz-on-dark">
          <Certificates />
          <div className="cx-gap" />
          <Scores />
        </div>
      </Sec>

      <Sec id="life" kicker="Beyond the classroom" lead="Activities and" rest="volunteering." lede="Sport, music, competitions and giving back.">
        <div className="vz-on-dark">
          <Activities />
        </div>
      </Sec>

      <Sec id="tutoring" tone="paper" kicker="Peer tutoring" lead="Helping others" rest="learn." lede="One on one and in groups, at lunch and after school.">
        <div className="cx-tutor">
          <span className="cx-tutor-ico" aria-hidden="true">
            <ChalkboardTeacher weight="duotone" />
          </span>
          <TutorList />
        </div>
      </Sec>

      <Sec id="goals" tone="ink" kicker="Goals" lead="Where he is" rest="heading." lede="From university to an AI-enabled oncology lab.">
        <Steps />
      </Sec>

      <Finale />
    </div>
  );
}
