import { StrideBottom, StrideTop } from './Stride';
import '@/features/details/style';
import './more.css';
import './stride.css';
import './pages.css';
import './viz.css';
import './motion.css';

/**
 * After the scroll film: a hero, marquee, about and bento cards, a white grid section and the work
 * gallery (Stride.tsx); then the momentum
 * band, goals, contact and the blue finale with the footer. Menu ids: cx-about, cx-wall, cx-life,
 * cx-tutoring, cx-goals, cx-contact. Oncure and the trading app open in the detail sheet.
 */
export function ClassicMore() {
  return (
    <div className="cx-wrap sd">
      <StrideTop />
      <StrideBottom />
    </div>
  );
}
