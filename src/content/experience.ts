import { PHOTOS } from './photos';

/**
 * "Activities and Experience": his volunteering and his other activities, in the family's own
 * words (2026-11-23), shared by all three designs. Each item has a picture and a motion preview
 * (an animated scene over that picture). When a real video of Shreyas arrives, put its path in
 * `video` (an MP4 under public/assets/videos) and it plays instead of the preview.
 *
 * Only confirmed facts: where the family has more details to send, `pending` says so on screen.
 */

const BASE = import.meta.env.BASE_URL;
const local = (n: string) => `${BASE}assets/photos/${n}.jpg`;
const still = (n: string) => `${BASE}assets/house/stills/${n}`;

export type Motion = 'pulse' | 'lamps' | 'chalk' | 'water' | 'rings' | 'notes' | 'atom' | 'chart';

export interface Experience {
  id: string;
  group: 'volunteering' | 'activity';
  /** Short name (buttons and card titles). */
  title: string;
  /** The family's exact line. */
  line: string;
  /** Role, shown under the title. */
  role: string;
  org: string;
  when: string;
  /** What the card says (confirmed facts only). */
  detail: string;
  image: string;
  /** The picture is an illustration or a photo of the topic, not of Shreyas. */
  imageNote: string;
  motion: Motion;
  /** A real video (MP4), once provided. */
  video: string | null;
  tint: string;
  /** More details are still to come from the family. */
  pending?: boolean;
}

export const EXPERIENCE_TITLE = 'Activities and Experience';

export const EXPERIENCE: Experience[] = [
  {
    id: 'tama',
    group: 'volunteering',
    title: 'TAMA Medical Camp',
    line: 'Student volunteer at TAMA Medical Camp',
    role: 'Student volunteer',
    org: 'TAMA Medical Camp',
    when: '',
    detail: 'Shreyas is a student volunteer at the TAMA Medical Camp.',
    image: local('stethoscope'),
    imageNote: 'Topic photo, not him',
    motion: 'pulse',
    video: null,
    tint: '#ff6b8a',
    pending: true,
  },
  {
    id: 'temple',
    group: 'volunteering',
    title: 'Sri Shirdi Sai Temple',
    line: 'Operations Volunteer at Sri Shirdi Sai Temple',
    role: 'Operations volunteer',
    org: 'Sri Shirdi Sai Temple',
    when: '',
    detail: 'Shreyas is an operations volunteer at the Sri Shirdi Sai Temple.',
    image: `${BASE}assets/illustrations/temple-lamps.svg`,
    imageNote: 'Illustration',
    motion: 'lamps',
    video: null,
    tint: '#ffb347',
    pending: true,
  },
  {
    id: 'tutoring',
    group: 'volunteering',
    title: 'Peer tutoring',
    line: 'Tutored 7th and 8th grade students in Math & Science',
    role: 'Tutor · Math & Science',
    org: '7th and 8th grade students',
    when: '',
    detail: 'He has tutored 7th and 8th grade students in Math and Science, one on one and in small groups, at lunch and after school, with visual aids and step-by-step explanations.',
    image: local('chalkboard-math'),
    imageNote: 'Topic photo, not him',
    motion: 'chalk',
    video: null,
    tint: '#7ee0a1',
  },
  {
    id: 'swim',
    group: 'activity',
    title: 'Swim Atlanta',
    line: 'Member · Swim Atlanta Senior Team',
    role: 'Member · Senior Team',
    org: 'Swim Atlanta',
    when: '',
    detail: 'A member of the Swim Atlanta Senior Team.',
    image: still('pavilion-pool.jpg'),
    imageNote: '3D render',
    motion: 'water',
    video: null,
    tint: '#4cc9f0',
  },
  {
    id: 'muaythai',
    group: 'activity',
    title: 'Muay Thai',
    line: 'Muay Thai Martial Arts · Since 2025',
    role: 'Martial arts · since 2025',
    org: 'Martial arts',
    when: 'Since 2025',
    detail: 'He has trained in Muay Thai martial arts since 2025.',
    image: still('pavilion-muaythai.jpg'),
    imageNote: '3D render',
    motion: 'rings',
    video: null,
    tint: '#ff5a5f',
  },
  {
    id: 'guitar',
    group: 'activity',
    title: 'Guitar',
    line: 'Guitar · Since 2021 (Atlanta Piano Fortissimo)',
    role: 'Guitar · since 2021',
    org: 'Atlanta Piano Fortissimo',
    when: 'Since 2021',
    detail: 'He has played guitar since 2021, at Atlanta Piano Fortissimo.',
    image: local('guitar'),
    imageNote: 'Topic photo, not him',
    motion: 'notes',
    video: null,
    tint: '#f28c28',
  },
  {
    id: 'olympiad',
    group: 'activity',
    title: 'Science Olympiad',
    line: 'Science Olympiad · FSA 2024, 2025',
    role: 'Team member',
    org: 'Fulton Science Academy (FSA)',
    when: '2024, 2025',
    detail: 'He competed in Science Olympiad for Fulton Science Academy (FSA) in 2024 and 2025.',
    image: PHOTOS.beaker.src,
    imageNote: 'Topic photo, not him',
    motion: 'atom',
    video: null,
    tint: '#8fd0ff',
  },
  {
    id: 'deca',
    group: 'activity',
    title: 'DECA',
    line: 'DECA · FSA 2026',
    role: 'Member',
    org: 'Fulton Science Academy (FSA)',
    when: '2026',
    detail: 'He joined DECA at Fulton Science Academy (FSA) in 2026.',
    image: local('stock-charts'),
    imageNote: 'Topic photo, not him',
    motion: 'chart',
    video: null,
    tint: '#f4d68a',
  },
];

export const EXPERIENCE_GROUPS = [
  { id: 'volunteering' as const, title: 'Volunteering', items: EXPERIENCE.filter((x) => x.group === 'volunteering') },
  { id: 'activity' as const, title: 'Other Activities', items: EXPERIENCE.filter((x) => x.group === 'activity') },
];

export const experienceById = (id: string) => EXPERIENCE.find((x) => x.id === id);
