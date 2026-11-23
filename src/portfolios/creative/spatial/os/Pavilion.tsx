import { useEffect, useState, type CSSProperties } from 'react';
import { Barbell, Briefcase, Flask, HandFist, MapPin, PersonSimpleWalk, SpeakerHigh, SwimmingPool, X, type IconProps } from '@phosphor-icons/react';
import { experienceById } from '@/content/experience';
import { ExperienceCard } from './Experience';
import type { ComponentType } from 'react';
import { pavilion } from '@/content/portfolio';
import { speak } from '../story/narrator';
import { TOUR } from '../story/tour';
import { playUi, spatial, useSpatial } from '../store';
import { STILL } from './media';
import { OSWindow } from './Window';

/**
 * The Sports & Fitness Pavilion as a spatial window: an introduction over a render of the
 * pavilion in his garden, the activity zones to choose from, and a card for each zone with its own
 * look (water for swimming, the training mats for Muay Thai, a lab grid for Science Olympiad,
 * navy and gold for DECA). Opened from the house tour, the Activities app and voice ("swimming").
 */

const ICON: Record<string, ComponentType<IconProps>> = { swim: SwimmingPool, muaythai: HandFist, olympiad: Flask, deca: Briefcase };
const st = (i: number) => ({ '--i': i }) as CSSProperties;

/** Walk to the pavilion in the house tour (the rooms load first if needed). */
export function walkToPavilion() {
  const i = TOUR.findIndex((s) => s.station === 'pavilion');
  spatial.closeWindow('pavilion');
  if (spatial.get().tour) spatial.tourTo(i, TOUR.length);
  else spatial.startTour(i);
}

export function PavilionWindow() {
  const want = useSpatial((s) => s.pavilionZone);
  const tour = useSpatial((s) => s.tour);
  const [zone, setZone] = useState<string | null>(want);
  useEffect(() => {
    if (want) setZone(want);
  }, [want]);
  const close = () => {
    spatial.set({ pavilionZone: null });
    spatial.closeWindow('pavilion');
  };
  const z = pavilion.zones.find((x) => x.id === zone) ?? null;
  return (
    <OSWindow id="pavilion" title={pavilion.title} className="os-pavilion" onClose={close}>
      <button type="button" className="os-inclose" aria-label="Close the pavilion" data-voice="close" onClick={close}>
        <X weight="bold" />
      </button>
      <div className="pv os-scroll" data-lenis-prevent>
        <header className="pv-hero">
          <img src={STILL('pavilion.jpg')} alt="The Sports & Fitness Pavilion in the garden of his 3D home: a pool and a Muay Thai training area under one roof" />
          <span className="pv-hero-shade" aria-hidden="true" />
          <div className="pv-hero-text">
            <p className="pv-kicker">
              <MapPin weight="fill" aria-hidden="true" /> In the garden of his home
            </p>
            <h2>{pavilion.title}</h2>
            <p>{pavilion.intro}</p>
            <div className="pv-hero-actions">
              <button type="button" className="os-chip is-solid" data-voice="listen" onClick={() => speak(`${pavilion.title}. ${pavilion.intro}`)}>
                <SpeakerHigh weight="bold" aria-hidden="true" /> Listen
              </button>
              {!tour && (
                <button type="button" className="os-chip" data-voice="walk to the pavilion" onClick={walkToPavilion}>
                  <PersonSimpleWalk weight="bold" aria-hidden="true" /> Walk there in 3D
                </button>
              )}
            </div>
          </div>
        </header>

        <nav className="pv-zones" aria-label="Activity areas">
          {pavilion.zones.map((x, i) => {
            const I = ICON[x.id] ?? Barbell;
            return (
              <button
                key={x.id}
                type="button"
                className={`pv-zone is-${x.id} ${zone === x.id ? 'is-on' : ''}`}
                style={st(i)}
                aria-pressed={zone === x.id}
                data-voice={x.title}
                onClick={() => {
                  setZone(zone === x.id ? null : x.id);
                  playUi('open');
                }}
              >
                <I weight={zone === x.id ? 'fill' : 'duotone'} aria-hidden="true" />
                <span>
                  <b>{x.title}</b>
                  <small>{x.when || x.role}</small>
                </span>
              </button>
            );
          })}
        </nav>

        {z ? (
          <ExperienceCard key={z.id} x={experienceById(z.id)!} inPavilion />
        ) : (
          <p className="pv-pick">Choose an area: Swimming or Muay Thai, or his school competitions.</p>
        )}
      </div>
    </OSWindow>
  );
}
