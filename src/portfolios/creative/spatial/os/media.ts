import { achievements, activities, profile, volunteering } from '@/content/portfolio';
import { PHOTOS } from '@/content/photos';

/**
 * Cards for the spatial home: stories on the dashboard (draggable onto the pinboard), the awards
 * carousel and the AI chat's attachments. Images are Shreyas's own photos or real public-domain
 * photographs of the topic (none of them show him).
 */

/** Real photographs (public/assets/photos, see CREDITS.md there). None of them show Shreyas. */
const PHOTO: Record<string, string> = { oncure: 'microscope', trading: 'stock-charts', trophy: 'trophy', academy: 'classroom', arrow: 'archery-target', writing: 'writing', medical: 'stethoscope', tutor: 'chalkboard-math' };
export const J = (name: string) => `${import.meta.env.BASE_URL}assets/photos/${PHOTO[name] ?? name}.jpg`;
export const PORTRAIT_STUDIO = `${import.meta.env.BASE_URL}assets/shreyas/portrait-studio.jpg`;
/** Stills of rooms in his 3D home (original renders of this site), and the games artwork. */
export const STILL = (name: string) => `${import.meta.env.BASE_URL}assets/house/stills/${name}`;

export interface Card {
  id: string;
  title: string;
  sub: string;
  image: string;
  /** App opened by the card. */
  app: string;
  /** One line shown on the card / read by the chat. */
  line: string;
  illustrative?: boolean;
}

export const STORIES: Card[] = [
  { id: 'profile', title: profile.name, sub: 'Profile', image: profile.portrait, app: 'profile', line: `${profile.grade} at ${profile.school}, ${profile.schoolTown}.` },
  { id: 'oncure', title: 'Oncure', sub: 'Research concept', image: J('oncure'), app: 'oncure', line: 'AI-guided nanobots that could deliver cancer therapy to tumour cells and spare healthy tissue (a concept).', illustrative: true },
  { id: 'finance', title: 'Stock Trading Application', sub: 'Concept', image: J('trading'), app: 'finance', line: 'A beginner-friendly stock trading website where an AI model suggests when and how much to buy and sell.', illustrative: true },
  { id: 'awards', title: 'Awards', sub: `${achievements.length} achievements`, image: J('trophy'), app: 'awards', line: 'PSAT and MAP top 99%, Principal’s Honors List, College Board National Recognition Program and more.' },
  { id: 'guitar', title: 'Guitar', sub: 'Since 2021', image: J('guitar'), app: 'activities', line: 'Guitar at Atlanta Piano Fortissimo since 2021. Play an original generated piece.' },
  { id: 'code', title: 'Code', sub: 'JavaScript · Python · Java', image: PHOTOS.code.src, app: 'profile', line: 'He writes code in JavaScript, Python and Java.', illustrative: true },
  { id: 'games', title: 'Games', sub: 'Four games', image: J('game-controllers'), app: 'games', line: 'Four games from his story: Cell Defender, Market Sense, String Rhythm and Award Match.' },
  { id: 'school', title: 'Fulton Science Academy', sub: profile.grade, image: J('academy'), app: 'profile', line: 'AP Computer Science A and Principles, AP Biology, AP Chemistry, AP Physics C, AI, English Literature and Spanish Honors, Entrepreneurship.', illustrative: true },
];

export const storyById = (id: string) => STORIES.find((s) => s.id === id);

/** Awards for the carousel: every achievement in the brief, with an image and where it is from. */
const AWARD_IMAGES: Record<string, string> = {
  cbnrp: J('trophy'),
  honors: J('academy'),
  psat: PHOTOS.notes.src,
  map: PHOTOS.mathBoard.src,
  arrow: J('arrow'),
  authors: J('writing'),
  minimed: J('medical'),
};
export const AWARDS = achievements.map((a) => ({
  ...a,
  image: AWARD_IMAGES[a.id] ?? J('trophy'),
  issuer:
    a.id === 'cbnrp'
      ? 'College Board'
      : a.id === 'honors'
        ? 'Fulton Science Academy'
        : a.id === 'arrow' || a.id === 'authors'
          ? 'Indian Prairie School District 204'
          : a.id === 'minimed'
            ? 'Mini-Medical School'
            : a.title,
}));

export const ACTIVITY_CARDS = [
  ...activities.map((a) => ({ title: a.title, sub: a.role })),
  ...volunteering.map((v) => ({ title: v.title, sub: v.role })),
];
