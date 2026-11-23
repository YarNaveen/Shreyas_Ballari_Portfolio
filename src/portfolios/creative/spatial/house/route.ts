import { CatmullRomCurve3, Vector3 } from 'three';
import { PAVILION_BACK, SLIDER, STATION_ORDER, STATIONS, type StationName } from './stations';

/**
 * Walking routes between story stations. Every station lists the waypoints from the station before
 * it in tour order, so a route chains those lists (forwards) or reverses them (backwards). The
 * living-room stations (entry, living, sofa, return) are all in one open room, so moving between
 * them is a straight glide, and the west wing and pavilion are reached from the living room.
 */

const LIVING_ROOM = new Set<StationName>(['entry', 'living', 'sofa', 'return']);
const idx = (s: StationName) => STATION_ORDER.indexOf(s);

/** Waypoints walking forwards from a to b (a before b in tour order), excluding both eyes. */
function forward(a: StationName, b: StationName) {
  const pts: [number, number, number][] = [];
  for (let i = idx(a) + 1; i <= idx(b); i++) pts.push(...(STATIONS[STATION_ORDER[i]!].via ?? []));
  return pts;
}

export function waypoints(from: StationName, to: StationName): [number, number, number][] {
  if (from === to) return [];
  const a = LIVING_ROOM.has(from);
  const b = LIVING_ROOM.has(to);
  if (a && b) return [];
  // The garden opens straight into the living room through the glass slider, and the pavilion
  // is reached from the garden through the gap in the hedge.
  if (from === 'garden' && b) return SLIDER;
  if (a && to === 'garden') return [...SLIDER].reverse();
  if (from === 'pavilion' && b) return [...PAVILION_BACK, ...SLIDER];
  if (a && to === 'pavilion') return [...SLIDER].reverse().concat([...PAVILION_BACK].reverse());
  if (a) return forward('living', to);
  if (b) return forward('living', from).reverse();
  return idx(from) < idx(to) ? forward(from, to) : forward(to, from).reverse();
}

/** A smooth path from one eye position to a station, through the doorways in between. */
export function walkPath(fromEye: Vector3, from: StationName, to: StationName) {
  const pts = [fromEye.clone(), ...waypoints(from, to).map((p) => new Vector3(...p)), new Vector3(...STATIONS[to].eye)];
  // Drop waypoints that sit on top of each other (a curve through duplicates kinks).
  const clean = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]!) > 0.05);
  if (clean.length < 2) clean.push(clean[0]!.clone());
  const curve = new CatmullRomCurve3(clean, false, 'centripetal', 0.5);
  return { curve, length: curve.getLength() };
}
