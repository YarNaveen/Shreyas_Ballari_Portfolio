/**
 * Camera stations for the house tour (metres, same frame as layout.ts). `eye` is where the camera
 * stands, `look` what it looks at. `via` lists the waypoints the camera passes through when it
 * comes from the PREVIOUS station in tour order, so the walk goes through doorways and never
 * through a wall: entry → living → sofa → bedroom → study → lab → gallery → kitchen → music →
 * garden → pavilion → return. (Going backwards, reverse the via list of the station you are leaving.)
 */

export interface Station {
  eye: [number, number, number];
  look: [number, number, number];
  via?: [number, number, number][];
}

export type StationName = 'entry' | 'living' | 'sofa' | 'bedroom' | 'study' | 'lab' | 'gallery' | 'kitchen' | 'volunteer' | 'music' | 'garden' | 'pavilion' | 'return';

export const STATION_ORDER: StationName[] = ['entry', 'living', 'sofa', 'bedroom', 'study', 'lab', 'gallery', 'kitchen', 'volunteer', 'music', 'garden', 'pavilion', 'return'];

/** From the garden back in through the open slider in the living room's glass wall. */
export const SLIDER: [number, number, number][] = [[6.0, 1.66, -4.6], [1.25, 1.64, -4.4], [1.25, 1.64, -3.6]];
/** From the pavilion back through the gap in the hedge to the garden. */
export const PAVILION_BACK: [number, number, number][] = [[18.3, 1.85, -6.4], [17.0, 1.75, -3.25], [13.6, 1.72, -3.3]];

export const STATIONS: Record<StationName, Station> = {
  // Outside the front door, looking in through the entrance.
  entry: { eye: [0.4, 1.62, 9.5], look: [0, 1.4, 0] },
  // Just inside the entrance: the whole living room, the glass wall and the garden beyond.
  living: { eye: [-0.9, 1.72, 5.15], look: [0.7, 1.05, -1.2], via: [[0.25, 1.66, 6.6]] },
  // Seated on the sofa, looking at the projector screen above the fireplace.
  sofa: { eye: [3.0, 1.15, 0.05], look: [-4.97, 2.25, -0.6], via: [[1.4, 1.62, 3.0], [2.45, 1.45, 1.45]] },
  // Through the hallway door, across the hall, into the bedroom.
  bedroom: {
    eye: [-8.05, 1.62, 4.1],
    look: [-11.2, 1.0, 1.4],
    via: [[1.2, 1.55, 2.4], [-2.5, 1.6, 3.3], [-4.6, 1.6, 3.3], [-5.6, 1.6, 3.4], [-6.25, 1.6, 3.85], [-7.3, 1.6, 3.88]],
  },
  study: {
    eye: [-7.75, 1.62, -1.85],
    look: [-11.2, 1.45, -3.9],
    via: [[-7.3, 1.6, 3.88], [-6.25, 1.6, 3.3], [-6.25, 1.6, -1.85], [-7.3, 1.6, -1.85]],
  },
  lab: {
    eye: [-7.9, 1.65, -4.75],
    look: [-10.2, 1.25, -8.7],
    via: [[-7.3, 1.6, -1.85], [-6.25, 1.6, -2.2], [-6.25, 1.6, -6.62], [-7.3, 1.6, -6.62], [-7.7, 1.62, -6.0]],
  },
  gallery: {
    eye: [-7.8, 1.62, -11.5],
    look: [-12.4, 1.45, -11.55],
    via: [[-7.6, 1.6, -6.62], [-6.25, 1.6, -7.0], [-6.25, 1.6, -11.5], [-7.3, 1.6, -11.5]],
  },
  kitchen: {
    eye: [-4.5, 1.65, -9.6],
    look: [-0.9, 1.45, -13.9],
    via: [[-7.3, 1.6, -11.5], [-6.25, 1.6, -11.3], [-5.1, 1.6, -11.3]],
  },
  // The same room, turned to its east side: the volunteering corner.
  volunteer: { eye: [1.05, 1.6, -10.0], look: [2.05, 0.95, -13.6], via: [[-2.2, 1.62, -9.8], [-0.6, 1.62, -9.85]] },
  music: { eye: [5.65, 1.62, -9.75], look: [3.3, 1.4, -12.1], via: [[1.0, 1.62, -9.7], [2.6, 1.62, -9.65]] },
  // Out through the music room's slider, across the lawn.
  garden: {
    eye: [12.4, 1.7, -3.2],
    look: [3.0, 0.9, -8.6],
    via: [[4.7, 1.62, -9.7], [4.7, 1.62, -8.4], [5.6, 1.65, -6.8], [8.0, 1.68, -3.8]],
  },
  // Through the gap in the east hedge, along stepping stones, into the Sports & Fitness Pavilion:
  // the pool on the left, the Muay Thai area on the right, the boards on the far wall.
  pavilion: { eye: [19.0, 1.95, -9.3], look: [25.2, 0.75, -1.4], via: [[14.6, 1.72, -3.25], [17.0, 1.75, -3.25], [18.3, 1.85, -6.4]] },
  // Back to the garden, then in through the open slider in the living room's glass wall.
  return: {
    eye: [2.2, 1.7, -2.5],
    look: [-3.2, 1.45, 1.6],
    via: [...PAVILION_BACK, ...SLIDER],
  },
};
