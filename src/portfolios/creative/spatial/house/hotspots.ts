import { achievements, activities, courses, goals, languages, oncure, pavilion, percentiles, stockApp } from '@/content/portfolio';
import type { StationName } from './stations';

/**
 * Things you can click in each room of the house: a glowing point on the real object (its
 * position in metres, the same frame as layout.ts) and what it tells you. Every fact comes from
 * content/portfolio.ts. The 3D scene moves the points to where the objects are on screen.
 */

export interface Hotspot {
  id: string;
  station: StationName;
  pos: [number, number, number];
  /** Short label on the point. */
  label: string;
  title: string;
  kicker: string;
  text: string;
  items?: string[];
  /** An app that goes deeper. */
  app?: { id: string; label: string };
  /** Open the small AI chat instead. */
  ask?: boolean;
  /** Offer his Oncure video in full view. */
  video?: boolean;
  tint?: string;
}

const ach = (id: string) => achievements.find((a) => a.id === id)!;
const pct = (test: string) => percentiles.filter((p) => p.test === test).map((p) => `${p.grade}: top ${p.value}%`);
const act = (t: string) => activities.find((a) => a.title === t)!;
const GOLD = '#ffd770';
const PINK = '#e0466e';
const GREEN = '#22a06b';
const BLUE = '#5b7cfa';
const SKY = '#3bb2d6';
const ORANGE = '#f28c28';

export const HOTSPOTS: Hotspot[] = [
  // --- Living room -------------------------------------------------------------------------
  {
    id: 'screen',
    station: 'living',
    pos: [-4.9, 2.25, -0.6],
    label: 'The big screen',
    kicker: 'Living room',
    title: 'Oncure, the film',
    text: `${oncure.pitch} Watch his video about it.`,
    video: true,
    tint: PINK,
  },
  {
    id: 'sofa',
    station: 'living',
    pos: [2.85, 0.9, 0],
    label: 'Ask about him',
    kicker: 'Living room',
    title: 'Have a seat and ask',
    text: 'Ask the AI anything about Shreyas: his research, his app, his school, his awards or his goals. It answers only from his portfolio.',
    ask: true,
    tint: '#9b6bff',
  },
  // --- His room ----------------------------------------------------------------------------
  {
    id: 'code',
    station: 'bedroom',
    pos: [-8.95, 1.12, 0.72],
    label: 'Code',
    kicker: 'His room',
    title: 'Programming languages',
    text: `He writes code in ${languages.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`,
    items: languages,
    tint: BLUE,
  },
  {
    id: 'bed-guitar',
    station: 'bedroom',
    pos: [-10.15, 0.95, 0.95],
    label: 'Guitar',
    kicker: 'His room',
    title: 'Guitar',
    text: `${act('Guitar').role}.`,
    app: { id: 'activities', label: 'Play his guitar pieces' },
    tint: ORANGE,
  },
  // --- Study ---------------------------------------------------------------------------------
  {
    id: 'courses',
    station: 'study',
    pos: [-10.9, 1.6, -4.05],
    label: 'Courses',
    kicker: 'The study',
    title: 'Courses taken',
    text: 'He has always taken advanced courses: all honours and AP in high school, with mathematics through AP Pre-calculus.',
    items: courses,
    tint: BLUE,
  },
  {
    id: 'library',
    station: 'study',
    pos: [-12.55, 1.7, -1.8],
    label: 'Reading and writing',
    kicker: 'The study',
    title: 'Reading and writing',
    text: `${ach('authors').detail} He takes English Literature Honors, and his résumé lists advanced literature and essay writing.`,
    tint: BLUE,
  },
  {
    id: 'laptop',
    station: 'study',
    pos: [-10.35, 0.95, -1.6],
    label: 'Code',
    kicker: 'The study',
    title: 'He writes code',
    text: `In ${languages.join(', ').replace(/, ([^,]*)$/, ' and $1')}, alongside AP Computer Science Principles, AP Computer Science A and Artificial Intelligence.`,
    items: languages,
    tint: BLUE,
  },
  {
    id: 'frames',
    station: 'study',
    pos: [-10.0, 1.6, 0.25],
    label: 'Fulton Science Academy',
    kicker: 'The study',
    title: 'Fulton Science Academy',
    text: `A junior at Fulton Science Academy (FSA) in Alpharetta, Georgia. ${ach('honors').detail}`,
    tint: BLUE,
  },
  // --- Research & Development ------------------------------------------------------------------
  {
    id: 'video',
    station: 'lab',
    pos: [-10.1, 2.3, -8.84],
    label: 'Oncure video',
    kicker: 'Research & Development',
    title: 'Watch his Oncure video',
    text: 'His video about Oncure is playing on the wall screen (muted). Open it in full view with sound.',
    video: true,
    tint: PINK,
  },
  {
    id: 'hologram',
    station: 'lab',
    pos: [-10.25, 1.55, -6.6],
    label: 'Oncure',
    kicker: 'Research & Development',
    title: 'Oncure',
    text: `${oncure.summary} ${oncure.disclaimer}`,
    app: { id: 'oncure', label: 'Open Oncure' },
    tint: PINK,
  },
  {
    id: 'onc-board',
    station: 'lab',
    pos: [-12.05, 1.95, -8.84],
    label: '5 steps',
    kicker: 'Research & Development',
    title: 'How Oncure would work',
    text: 'A conceptual workflow in five steps. It has not been demonstrated as a working treatment.',
    items: oncure.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.line}`),
    tint: PINK,
  },
  {
    id: 'microscope',
    station: 'lab',
    pos: [-12.35, 1.15, -7.9],
    label: 'Challenges',
    kicker: 'Research & Development',
    title: 'What has to be solved',
    text: 'The technology does not exist yet. What would need solving first:',
    items: oncure.challenges.map((c) => `${c.title}: ${c.line}`),
    tint: PINK,
  },
  {
    id: 'trade-board',
    station: 'lab',
    pos: [-8.2, 1.95, -8.84],
    label: 'Stock Trading Application',
    kicker: 'Research & Development · his app (concept)',
    title: stockApp.name,
    text: `${stockApp.summary} For: ${stockApp.forWhom.charAt(0).toLowerCase()}${stockApp.forWhom.slice(1)}`,
    items: stockApp.features.map((f) => `${f.title}: ${f.line}`),
    app: { id: 'finance', label: 'Open the trading app' },
    tint: GREEN,
  },
  // --- Gallery -----------------------------------------------------------------------------------
  {
    id: 'cert-cbnrp',
    station: 'gallery',
    pos: [-12.7, 2.05, -11.55],
    label: 'College Board',
    kicker: 'Certificate',
    title: ach('cbnrp').title,
    text: ach('cbnrp').detail,
    tint: GOLD,
  },
  {
    id: 'cert-psat',
    station: 'gallery',
    pos: [-11.3, 1.65, -13.9],
    label: 'PSAT',
    kicker: 'Certificate',
    title: 'PSAT · top 99%',
    text: ach('psat').detail,
    items: pct('PSAT'),
    tint: GOLD,
  },
  {
    id: 'scores',
    station: 'gallery',
    pos: [-10.15, 1.65, -13.9],
    label: 'Scores chart',
    kicker: 'The gallery',
    title: 'His PSAT and MAP results',
    text: 'PSAT and MAP across the years.',
    items: [...pct('PSAT').map((x) => `PSAT ${x}`), ...pct('MAP').map((x) => `MAP ${x}`)],
    tint: GOLD,
  },
  {
    id: 'cert-map',
    station: 'gallery',
    pos: [-9.0, 1.65, -13.9],
    label: 'MAP',
    kicker: 'Certificate',
    title: 'MAP · top 99%',
    text: ach('map').detail,
    items: pct('MAP'),
    tint: GOLD,
  },
  {
    id: 'cert-honors',
    station: 'gallery',
    pos: [-11.3, 1.65, -9.2],
    label: 'Honors List',
    kicker: 'Honour',
    title: ach('honors').title,
    text: ach('honors').detail,
    tint: GOLD,
  },
  {
    id: 'cert-arrow',
    station: 'gallery',
    pos: [-9.0, 1.65, -9.2],
    label: 'Project Arrow',
    kicker: 'Programme',
    title: ach('arrow').title,
    text: ach('arrow').detail,
    tint: GOLD,
  },
  {
    id: 'cup',
    station: 'gallery',
    pos: [-11.75, 1.35, -11.55],
    label: 'All awards',
    kicker: 'The gallery',
    title: 'Awards and honours',
    text: 'Everything in this room, in one list:',
    items: achievements.map((a) => `${a.title} · ${a.value}`),
    app: { id: 'awards', label: 'Open the awards' },
    tint: GOLD,
  },
  {
    id: 'crystal',
    station: 'gallery',
    pos: [-10.0, 1.3, -10.15],
    label: 'Young Authors',
    kicker: 'Award',
    title: ach('authors').title,
    text: ach('authors').detail,
    tint: GOLD,
  },
  {
    id: 'medal',
    station: 'gallery',
    pos: [-10.0, 1.35, -12.95],
    label: 'Mini-Medical',
    kicker: 'Certificate',
    title: ach('minimed').title,
    text: 'Completed Mini-Medical School for middle school students in July 2021, and received a certificate of completion.',
    tint: GOLD,
  },
  // --- Volunteering & tutoring -------------------------------------------------------------------
  {
    id: 'tutor-board',
    station: 'kitchen',
    pos: [-2.2, 1.95, -13.9],
    label: 'How he tutors',
    kicker: 'Volunteering & tutoring',
    title: 'How Shreyas tutors',
    text: 'Peer tutor for 7th and 8th grade students in mathematics and science, one on one and in small groups, at lunch or after school.',
    items: ['1. Find the gaps: identify lagging skills', '2. Explain step by step, with visual aids and diagrams', '3. Practise together: homework and small groups', '4. Get ready for quizzes and exams', '5. Give feedback on writing and critical thinking'],
    tint: SKY,
  },
  // (The volunteering and activity posters on the walls show everything about each one, so they
  // have no extra popups.)
  // --- Music & activities ----------------------------------------------------------------------
  {
    id: 'electric',
    station: 'music',
    pos: [4.35, 1.45, -13.85],
    label: 'Guitar',
    kicker: 'Music & activities',
    title: 'Guitar since 2021',
    text: 'He has played guitar since 2021 at Atlanta Piano Fortissimo.',
    app: { id: 'activities', label: 'Play original guitar pieces' },
    tint: ORANGE,
  },
  {
    id: 'acoustic',
    station: 'music',
    pos: [5.55, 0.95, -12.6],
    label: 'Play music',
    kicker: 'Music & activities',
    title: 'Listen',
    text: 'Original guitar pieces, generated live in your browser (not recordings of him).',
    app: { id: 'activities', label: 'Open the player' },
    tint: ORANGE,
  },
  // --- Garden: goals ---------------------------------------------------------------------------
  {
    id: 'goals',
    station: 'garden',
    pos: [6.7, 2.1, -5.4],
    label: 'His goals',
    kicker: 'Looking ahead',
    title: 'His goals',
    text: goals.education,
    items: goals.career,
    tint: '#ffd166',
  },
  // --- Volunteering (the community room's east side) -----------------------------------------
  {
    id: 'vol-tama',
    station: 'volunteer' as const,
    pos: [0.8, 1.05, -13.4] as [number, number, number],
    label: 'TAMA Medical Camp',
    kicker: 'Volunteering',
    title: 'TAMA Medical Camp',
    text: 'Student volunteer at TAMA Medical Camp.',
    app: { id: 'experience:tama', label: 'Watch and read' },
    tint: '#ff6b8a',
  },
  {
    id: 'vol-temple',
    station: 'volunteer' as const,
    pos: [2.35, 0.55, -13.55] as [number, number, number],
    label: 'Sri Shirdi Sai Temple',
    kicker: 'Volunteering',
    title: 'Sri Shirdi Sai Temple',
    text: 'Operations Volunteer at Sri Shirdi Sai Temple.',
    app: { id: 'experience:temple', label: 'Watch and read' },
    tint: '#ffb347',
  },
  // --- Sports & Fitness Pavilion --------------------------------------------------------------
  ...pavilion.zones.map((z, i) => ({
    id: `pv-${z.id}`,
    station: 'pavilion' as const,
    pos: ([
      [24.0, 0.25, -6.6],
      [24.7, 1.45, 0.7],
      [31.25, 2.0, -3.2],
      [31.25, 2.0, 0.8],
    ] as [number, number, number][])[i]!,
    label: z.title,
    kicker: pavilion.title,
    title: z.id === 'swim' ? `${z.org} · ${z.role}` : z.title,
    text: z.line,
    app: { id: `pavilion:${z.id}`, label: `Open ${z.title}` },
    tint: ['#4cc9f0', '#e0464e', '#8fd0ff', '#f4d68a'][i],
  })),
  // --- Thank you ------------------------------------------------------------------------------
  {
    id: 'thanks',
    station: 'sofa',
    pos: [-4.9, 1.3, -0.6],
    label: 'Ask the AI',
    kicker: 'Before you go',
    title: 'Any questions?',
    text: 'Ask the AI anything about Shreyas, or open his dashboard to explore every app.',
    ask: true,
    tint: '#9b6bff',
  },
];

/** The on-screen buttons for the points, so the 3D scene can move them every frame. */
export const hotspotEls = new Map<string, HTMLElement>();
