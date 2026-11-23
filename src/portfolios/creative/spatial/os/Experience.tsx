import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, Briefcase, ChalkboardTeacher, Flask, FirstAid, Flower, Guitar, HandFist, SpeakerHigh, SwimmingPool, X, type IconProps } from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { EXPERIENCE, EXPERIENCE_GROUPS, EXPERIENCE_TITLE, experienceById, type Experience } from '@/content/experience';
import { MotionMedia } from '@/features/experience/MotionMedia';
import { speak } from '../story/narrator';
import { playUi, spatial, useSpatial } from '../store';
import { openPavilion } from '../ui/commands';
import { OSWindow } from './Window';

/**
 * Activities and Experience: his volunteering and his other activities, each a button that opens
 * a card with a looping video (a motion preview until a real video arrives) and the details. The
 * same card is used in the Sports & Fitness Pavilion, so every activity looks alike.
 */

export const XP_ICON: Record<string, ComponentType<IconProps>> = {
  tama: FirstAid,
  temple: Flower,
  tutoring: ChalkboardTeacher,
  swim: SwimmingPool,
  muaythai: HandFist,
  guitar: Guitar,
  olympiad: Flask,
  deca: Briefcase,
};
const PAVILION = new Set(['swim', 'muaythai', 'olympiad', 'deca']);
const st = (i: number, tint?: string) => ({ '--i': i, ...(tint ? { '--tint': tint } : {}) }) as CSSProperties;

/** A card for one activity: the video on one side, the story on the other. */
export function ExperienceCard({ x, inPavilion = false }: { x: Experience; inPavilion?: boolean }) {
  const I = XP_ICON[x.id] ?? Guitar;
  const group = x.group === 'volunteering' ? 'Volunteering' : 'Other Activities';
  return (
    <article className={`pv-card is-${x.id}`} style={st(0, x.tint)} aria-live="polite">
      <MotionMedia item={x} className="pv-card-art" />
      <div className="pv-card-body">
        <span className="pv-card-ico">
          <I weight="duotone" aria-hidden="true" />
        </span>
        <p className="pv-card-k">
          {group} · {x.org}
        </p>
        <h3>{x.title}</h3>
        <p className="pv-card-role">{x.role}</p>
        <p className="xp-line">{x.line}</p>
        <p className="pv-card-line">{x.detail}</p>
        {(x.when || x.pending) && (
          <div className="pv-years">
            {x.when &&
              x.when.split(/, | and /).map((y, i) => (
                <span key={y} style={st(i)}>
                  {y}
                </span>
              ))}
            {x.pending && <span className="xp-pending">More details · to be added</span>}
          </div>
        )}
        <div className="pv-card-actions">
          <button type="button" className="os-chip" data-voice="listen" onClick={() => speak(`${x.title}. ${x.detail}`)}>
            <SpeakerHigh weight="bold" aria-hidden="true" /> Listen
          </button>
          {!inPavilion && PAVILION.has(x.id) && (
            <button type="button" className="os-chip" data-voice="see it in the pavilion" onClick={() => (spatial.closeWindow('experience'), openPavilion(x.id))}>
              In the pavilion <ArrowRight weight="bold" aria-hidden="true" />
            </button>
          )}
          {x.id === 'guitar' && (
            <button
              type="button"
              className="os-chip"
              data-voice="play his guitar pieces"
              onClick={() => {
                spatial.closeWindow('experience');
                spatial.closeWindow('pavilion');
                spatial.goChapter('activities');
              }}
            >
              Play guitar pieces <ArrowRight weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ExperienceWindow() {
  const want = useSpatial((s) => s.experienceItem);
  const [sel, setSel] = useState<string>(want ?? EXPERIENCE[0]!.id);
  useEffect(() => {
    if (want) setSel(want);
  }, [want]);
  const close = () => {
    spatial.set({ experienceItem: null });
    spatial.closeWindow('experience');
  };
  const x = experienceById(sel) ?? EXPERIENCE[0]!;
  let k = 0;
  return (
    <OSWindow id="experience" title={EXPERIENCE_TITLE} className="os-pavilion os-experience" onClose={close}>
      <button type="button" className="os-inclose" aria-label="Close activities and experience" data-voice="close" onClick={close}>
        <X weight="bold" />
      </button>
      <div className="pv xp os-scroll" data-lenis-prevent>
        <header className="xp-head">
          <p className="pv-kicker">Shreyas Ballari</p>
          <h2>{EXPERIENCE_TITLE}</h2>
          <p>Volunteering and the activities he does outside class. Choose one to watch and read.</p>
        </header>
        {EXPERIENCE_GROUPS.map((g) => (
          <section key={g.id} className="xp-group" aria-label={g.title}>
            <p className="xp-group-h">
              {g.title} <small>{g.items.length}</small>
            </p>
            <div className={`pv-zones is-${g.items.length}`}>
              {g.items.map((it) => {
                const I = XP_ICON[it.id] ?? Guitar;
                return (
                  <button
                    key={it.id}
                    type="button"
                    className={`pv-zone ${sel === it.id ? 'is-on' : ''}`}
                    style={st(k++, it.tint)}
                    aria-pressed={sel === it.id}
                    data-voice={it.title}
                    onClick={() => {
                      setSel(it.id);
                      playUi('open');
                    }}
                  >
                    <I weight={sel === it.id ? 'fill' : 'duotone'} aria-hidden="true" />
                    <span>
                      <b>{it.title}</b>
                      <small>{it.role}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <ExperienceCard key={x.id} x={x} />
      </div>
    </OSWindow>
  );
}
