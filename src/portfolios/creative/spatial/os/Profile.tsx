import type { CSSProperties } from 'react';
import { Reach } from '@/features/details/Reach';
import { ArrowRight, Books, Briefcase, EnvelopeSimple, Brain, ChalkboardTeacher, ChatsCircle, Code, Flag, GraduationCap, Medal, Rocket, SpeakerHigh, Sparkle, X } from '@phosphor-icons/react';
import { achievements, courses, goals, internship, languages, nationalMerit, profile, researchInterests, resume, subjects } from '@/content/portfolio';
import { openInternship } from '../ui/commands';
import { speak } from '../story/narrator';
import { spatial } from '../store';
import { askAI } from './Dashboard';
import { PORTRAIT_STUDIO } from './media';
import { OSWindow } from './Window';

/**
 * Shreyas's profile, laid out like a spatial media window: a large portrait with a stats bar
 * underneath on the left, and on the right a column of cards (school, interests, code, research,
 * goals), each of which can be read aloud or asked about. A vertical ornament on the left jumps
 * around, and a timeline floats beside the window.
 */

const st = (i: number) => ({ '--i': i }) as CSSProperties;

const ROWS: { icon: typeof Sparkle; k: string; v: string; open?: () => void }[] = [
  { icon: Sparkle, k: 'About him', v: resume.summary },
  { icon: Medal, k: nationalMerit.title, v: `${nationalMerit.test}: ${nationalMerit.result}. ${nationalMerit.status}.`, open: () => {
    spatial.closeWindow('profile');
    spatial.goChapter('awards');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('os-awards', { detail: 'nmsc' })), 700);
  } },
  { icon: GraduationCap, k: 'School', v: `${profile.grade} at ${profile.school}, ${profile.schoolTown}` },
  { icon: Brain, k: 'Interests', v: subjects.join(', ') },
  { icon: Code, k: 'Writes code in', v: languages.join(', ') },
  { icon: Books, k: 'Courses', v: courses.join(', ') },
  { icon: Flag, k: 'Research interests', v: researchInterests.map((r) => r.title).join(' · ') },
  { icon: Briefcase, k: internship.heading, v: internship.summary, open: openInternship },
  { icon: ChalkboardTeacher, k: 'Experience', v: `Peer tutor: ${resume.tutoring.slice(0, 3).join(' ')}` },
  { icon: Rocket, k: 'Goals', v: [goals.education, ...goals.career].join(' ') },
  { icon: Brain, k: 'Skills', v: resume.skills.join(', ') },
];

export function ProfileWindow() {
  const close = () => spatial.closeWindow('profile');
  return (
    <>
      <OSWindow id="profile" title="Profile" className="os-profile" onClose={close}>
        <button type="button" className="os-inclose" aria-label="Close the profile" data-voice="close" onClick={close}>
          <X weight="bold" />
        </button>
        <div className="os-profile-grid">
          <figure className="os-hero">
            <img src={PORTRAIT_STUDIO} alt={`${profile.name}, in a dark suit and blue tie`} />
            <figcaption>
              <b>{profile.name}</b>
              <span>
                {profile.grade} · {profile.school}
              </span>
              <Reach tone="dark" compact className="os-reach" />
              <button type="button" className="os-chip is-solid os-msg" data-voice="send a message" onClick={() => spatial.openWindow('contact')}>
                <EnvelopeSimple weight="bold" aria-hidden="true" /> Send a message
              </button>
            </figcaption>
            <span className="os-hero-sheen" aria-hidden="true" />
          </figure>
          <div className="os-profile-list os-scroll">
            <p className="os-label">About ({ROWS.length})</p>
            {ROWS.map(({ icon: I, k, v, open }, i) => (
              <article key={k} className="os-row" style={st(i)}>
                <span className="os-row-ico">
                  <I weight="duotone" aria-hidden="true" />
                </span>
                <div>
                  <b>{k}</b>
                  <p>{v}</p>
                  <div className="os-row-actions">
                    <button type="button" className="os-round is-sm" aria-label={`Listen: ${k}`} data-voice={`listen ${k}`} onClick={() => speak(`${k}. ${v}`)}>
                      <SpeakerHigh weight="bold" />
                    </button>
                    {open && (
                      <button type="button" className="os-chip is-sm" data-voice={`open ${k}`} onClick={open}>
                        Open <ArrowRight weight="bold" aria-hidden="true" />
                      </button>
                    )}
                    <button type="button" className="os-round is-sm" aria-label={`Ask about ${k}`} data-voice={`ask ${k}`} onClick={() => askAI(`What about his ${k.toLowerCase()}?`)}>
                      <ChatsCircle weight="bold" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="os-statbar" aria-label="Highlights">
            {[
              ['99th+', 'Grade 11 PSAT'],
              ['Top 99%', 'MAP'],
              [String(courses.length), 'Courses'],
              [String(languages.length), 'Languages'],
              [String(achievements.length), 'Achievements'],
            ].map(([v, k], i) => (
              <span key={k} style={st(i)}>
                <b>{v}</b>
                <small>{k}</small>
              </span>
            ))}
          </div>
        </div>
      </OSWindow>
    </>
  );
}
