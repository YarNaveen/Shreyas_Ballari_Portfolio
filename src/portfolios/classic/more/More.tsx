import { OncureFull, TradingFull } from './Projects';
import { StrideBottom, StrideTop } from './Stride';
import '@/features/details/style';
import './more.css';
import './projects.css';
import './stride.css';

/**
 * After the scroll film: a hero, marquee, about and bento cards, a white grid section and the work
 * gallery (Stride.tsx); then Oncure and the trading app in full (Projects.tsx); then the momentum
 * band, goals, contact and the blue finale with the footer. Menu ids: cx-about, cx-wall, cx-life,
 * cx-tutoring, cx-goals, cx-contact, cx-oncure, cx-trading.
 */
export function ClassicMore() {
  return (
    <div className="cx-wrap sd">
      <StrideTop />
      <OncureFull />
      <TradingFull />
      <StrideBottom />
    </div>
  );
}
