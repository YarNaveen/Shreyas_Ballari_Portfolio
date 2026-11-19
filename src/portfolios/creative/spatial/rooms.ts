/**
 * The rooms of Shreyas's home, in walking order. Each room has a camera pose (eye and target,
 * metres, inside the house model) and the phrases voice control listens for.
 *
 * Phase 2 (this build): the living room is built in full; the other rooms already appear in the
 * navigation and the camera walks to the hallway door for each, with a panel saying the room is
 * being built next. Their content (from the family's brief) is listed here so it is ready.
 */

export interface Pose {
  eye: [number, number, number];
  look: [number, number, number];
}

export interface Room {
  id: string;
  name: string;
  /** One line under the name. */
  line: string;
  built: boolean;
  pose: Pose;
  voice: string[];
}

/** Where the walk-through starts (just outside the entrance), and the living room itself. */
export const ENTRY: Pose = { eye: [0.4, 1.62, 9.5], look: [0, 1.4, 0] };
const LIVING: Pose = { eye: [-0.9, 1.72, 5.15], look: [0.7, 1.05, -1.2] };
/** The hallway door at the left of the living room: the way to every other room. */
const HALL: Pose = { eye: [-1.4, 1.62, 1.0], look: [-5.2, 1.45, 3.5] };

export const ROOMS: Room[] = [
  { id: 'living', name: 'Living Room', line: "Welcome to Shreyas's world", built: true, pose: LIVING, voice: ['living room', 'living', 'about me', 'about', 'home', 'welcome', 'start'] },
  { id: 'study', name: 'Study Room', line: 'Education and academics', built: false, pose: HALL, voice: ['study room', 'study', 'education', 'academics', 'courses', 'school'] },
  { id: 'lab', name: 'Innovation Lab', line: 'Research interests', built: false, pose: HALL, voice: ['innovation lab', 'innovation', 'laboratory', 'lab', 'research interests', 'research'] },
  { id: 'fintech', name: 'FinTech Room', line: 'Stock Trading Application (concept)', built: false, pose: HALL, voice: ['fintech room', 'fintech', 'trading', 'stock', 'finance', 'stock trading app'] },
  { id: 'oncology', name: 'Oncology Research', line: 'AI in cancer research', built: false, pose: HALL, voice: ['oncology research', 'oncology', 'cancer', 'biomedical'] },
  { id: 'music', name: 'Music Room', line: 'Guitar since 2021', built: false, pose: HALL, voice: ['music room', 'music', 'guitar', 'guitar room', 'play guitar room'] },
  { id: 'recreation', name: 'Recreation Room', line: 'Swimming, Muay Thai, Science Olympiad, DECA', built: false, pose: HALL, voice: ['recreation room', 'recreation', 'activities', 'my activities', 'sports', 'swimming', 'muay thai'] },
  { id: 'gallery', name: 'Achievement Gallery', line: 'Honors and recognition', built: false, pose: HALL, voice: ['achievement gallery', 'achievements', 'academic achievements', 'awards', 'gallery'] },
  { id: 'community', name: 'Community Room', line: 'Volunteering and tutoring', built: false, pose: HALL, voice: ['community room', 'community', 'volunteering', 'volunteer', 'tutoring'] },
  { id: 'vision', name: 'Future Vision', line: 'Goals and ambitions', built: false, pose: HALL, voice: ['future vision', 'future', 'vision', 'goals', 'ambitions', 'dreams'] },
];

export const roomIndex = (id: string) => Math.max(0, ROOMS.findIndex((r) => r.id === id));
