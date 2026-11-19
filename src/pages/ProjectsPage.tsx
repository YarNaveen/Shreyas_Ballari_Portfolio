import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import '@/features/details/style';
import { oncure, stockApp } from '@/content/portfolio';

/** /projects: what he is building. */
export function Component() {
  return (
    <>
      <Seo title="Projects" description="Projects by Shreyas Ballari: a stock trading application and the Oncure research concept." />
      <div className="dt dt--page is-static">
        <div className="dt-body">
          <header className="dt-head">
            <p className="dt-kicker">Projects</p>
            <h1 className="dt-title">What he is building</h1>
          </header>
          <Link to="/projects/stock-trading-app" className="dt-end dt-link">
            <span className="dt-kicker">FinTech · {stockApp.status.toLowerCase()}</span>
            <b className="dt-h">Stock Trading Application</b>
            <p>{stockApp.summary}</p>
            <span className="dt-note">Hypothetical concept. Not financial advice.</span>
            <span className="dt-go">See the full concept →</span>
          </Link>
          <Link to="/research/oncure" className="dt-end dt-link">
            <span className="dt-kicker">Research concept</span>
            <b className="dt-h">{oncure.name}</b>
            <p>{oncure.pitch}</p>
            <span className="dt-go">Read the full concept and watch the film →</span>
          </Link>
        </div>
      </div>
    </>
  );
}
