import { Seo } from '@/components/seo/Seo';
import { stockApp } from '@/content/portfolio';
import { FinanceDetails } from '@/features/details/Details';

/** /projects/stock-trading-app: the AI trading app concept, in full. */
export function Component() {
  return (
    <>
      <Seo title="Stock Trading Application" description={stockApp.summary} />
      <div className="dt dt--page is-static">
        <FinanceDetails />
      </div>
    </>
  );
}
