import { achievements, activities, courses, goals, languages, oncure, pavilion, profile, researchInterests, resume, stockApp, subjects, volunteering } from '@/content/portfolio';
import { PHOTOS } from '@/content/photos';
import type { StationName } from '../house/stations';

/**
 * The house tour: scroll (or swipe, or use the arrow keys) and the camera walks from room to
 * room; in each room you can drag to look around and tap glowing points on things, and a card
 * explains one part of Shreyas's story. Every fact comes from content/portfolio.ts (his details,
 * his Oncure proposal and his résumé).
 */

export interface TourStop {
  station: StationName;
  room: string;
  title: string;
  text: string;
  items?: string[];
  /** A picture that belongs to this topic, and which part of it to keep in view. */
  image?: string;
  focus?: string;
  /** The app that goes deeper on this room's topic. */
  app?: string;
}

const A = (p: string) => `${import.meta.env.BASE_URL}assets/${p}`;
const and = (xs: readonly string[]) => xs.join(', ').replace(/, ([^,]*)$/, ' and $1');

export const TOUR: TourStop[] = [
  {
    station: 'entry',
    room: 'Welcome',
    title: `${profile.firstName}’s home`,
    text: `${profile.name} is a ${profile.grade.toLowerCase()} at ${profile.school} (${profile.schoolShort}) in ${profile.schoolTown}. This house tells his story, one room at a time. Scroll to walk in, drag to look around, and tap the glowing points.`,
    image: A('shreyas/portrait-studio.jpg'),
    focus: '50% 18%',
  },
  {
    station: 'living',
    room: 'The living room',
    title: 'Who he is',
    text: `${resume.summary} He is most drawn to ${and(subjects)}, and his research interests are ${researchInterests.map((r) => r.title.toLowerCase()).join(' and ')}.`,
    items: [...subjects],
    image: A('shreyas/portrait-studio.jpg'),
    focus: '50% 18%',
  },
  {
    station: 'bedroom',
    room: 'His room',
    title: 'Code and guitar',
    text: `On the desk: he writes code in ${and(languages)}. Beside it: his guitar, which he has played since 2021 at Atlanta Piano Fortissimo.`,
    items: [...languages, 'Guitar since 2021'],
    image: PHOTOS.code.src,
  },
  {
    station: 'study',
    room: 'The study',
    title: 'School and courses',
    text: `At ${profile.school} he has always taken advanced courses: all honours and AP, with mathematics through AP Pre-calculus. The board on the wall shows them all.`,
    items: courses,
    image: A('photos/classroom.jpg'),
  },
  {
    station: 'lab',
    room: 'Research & Development',
    title: 'Oncure and the trading app',
    text: `Two projects live here. Oncure: ${oncure.summary.charAt(0).toLowerCase()}${oncure.summary.slice(1)} His video plays on the wall screen. And his stock trading application: ${stockApp.summary.charAt(0).toLowerCase()}${stockApp.summary.slice(1)} Its screens are on the monitors.`,
    items: ['Oncure: 5 steps', 'Watch the video', 'Stock Trading Application (concept)'],
    image: A('photos/microscope.jpg'),
    app: 'oncure',
  },
  {
    station: 'gallery',
    room: 'The gallery',
    title: 'Awards and honours',
    text: 'Certificates, honours and top scores, from Project Arrow in second grade to the College Board National Recognition Program. On the PSAT 8/9 he scored 1280 out of 1440 in 8th grade, and on the Grade 11 PSAT he placed in the 99th percentile and above, qualifying for National Merit Scholarship recognition.',
    items: achievements.map((a) => `${a.title} · ${a.value}`),
    image: A('house/stills/gallery.jpg'),
    app: 'awards',
  },
  {
    station: 'kitchen',
    room: 'Volunteering & tutoring',
    title: 'Volunteering and tutoring',
    text: 'The whiteboard shows how he tutors 7th and 8th graders in mathematics and science, step by step; the wall beside it shows where he volunteers: as an operations volunteer at the Sri Shirdi Sai Temple and a student volunteer at the TAMA Medical Camp.',
    items: volunteering.map((v) => `${v.title} · ${v.role}`),
    image: A('photos/chalkboard-math.jpg'),
  },
  {
    station: 'music',
    room: 'Music & activities',
    title: 'Beyond class',
    text: 'His guitars, and a wall of everything else he does: sport, martial arts, science competition and business.',
    items: activities.map((a) => `${a.title} · ${a.role}`),
    image: A('house/stills/music.jpg'),
    app: 'activities',
  },
  {
    station: 'garden',
    room: 'The garden',
    title: 'Looking ahead',
    text: `The sign in the garden holds his goals: ${goals.education.replace(/^A /, 'a ').replace(/\.$/, '')}, then a career in AI, research and finance.`,
    items: goals.career.map((g) => g.replace(/\.$/, '')),
    image: A('house/stills/garden.jpg'),
  },
  {
    station: 'pavilion',
    room: pavilion.title,
    title: 'Sport, discipline and teamwork',
    text: `${pavilion.intro} In front, the pool for his swimming with the Swim Atlanta Senior Team; beyond it, the Muay Thai training area, where he has trained since 2025. The boards on the far wall show Science Olympiad and DECA.`,
    items: pavilion.zones.map((z) => `${z.title} · ${z.org}${z.when ? `, ${z.when}` : ''}`),
    image: A('house/stills/pavilion.jpg'),
    app: 'pavilion',
  },
  {
    station: 'sofa',
    room: 'Thank you',
    title: 'Thank you for visiting',
    text: `And for your valuable time. You can explore any of ${profile.firstName}’s apps from his dashboard, ask the AI about him, or take the tour again.`,
    app: 'home',
  },
];
