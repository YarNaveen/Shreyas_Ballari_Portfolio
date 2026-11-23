import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { EXPERIENCE_GROUPS, type Experience } from '@/content/experience';
import { MotionMedia } from './MotionMedia';
import './grid.css';

/**
 * Activities and Experience as two groups of cards (Volunteering, then Other Activities), each
 * card with its looping motion preview and the family's exact line. Used by Classic and Studio
 * (Creative has its own spatial window). The previews pause while the grid is off screen.
 * On narrow screens each group becomes a swipeable row.
 */
export function ExperienceGrid({ tone = 'light', onOpen }: { tone?: 'light' | 'dark'; onOpen?: (x: Experience) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = !!e?.isIntersecting;
        setOn(v);
        if (v) setSeen(true);
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  let k = 0;
  return (
    <div ref={ref} className={`xg is-${tone} ${on ? 'is-on' : 'is-off'} ${seen ? 'is-seen' : ''}`}>
      {EXPERIENCE_GROUPS.map((g) => (
        <section key={g.id} className={`xg-group is-${g.id}`} aria-label={g.title}>
          <p className="xg-h">
            <span>{g.title}</span>
            <small>{g.items.length}</small>
          </p>
          <div className="xg-cards">
            {g.items.map((x) => {
              const Tag = onOpen ? 'button' : 'article';
              return (
                <Tag
                  key={x.id}
                  {...(onOpen ? { type: 'button' as const, onClick: () => onOpen(x) } : {})}
                  className="xg-card"
                  style={{ '--tint': x.tint, '--i': k++ } as CSSProperties}
                >
                  <MotionMedia item={x} className="xg-media" controls={false} />
                  <span className="xg-body">
                    <span className="xg-tag">{g.id === 'volunteering' ? 'Volunteering' : 'Activity'}</span>
                    <b className="xg-title">{x.title}</b>
                    <span className="xg-line">{x.line}</span>
                    {x.pending && <span className="xg-pending">More details · to be added</span>}
                  </span>
                </Tag>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
