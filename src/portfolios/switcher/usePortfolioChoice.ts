import { useCallback, useEffect, useState } from 'react';

/**
 * The portfolio styles shown side by side for the family to choose from. Once one is
 * chosen, delete the switcher and the other folders (see README "Choosing a portfolio").
 */
export const PORTFOLIOS = [
  { id: 'creative', label: 'Creative' },
  { id: 'studio', label: 'Studio' },
  { id: 'classic', label: 'Classic' },
] as const;

export type PortfolioId = (typeof PORTFOLIOS)[number]['id'];

const DEFAULT: PortfolioId = 'creative';
const isPortfolio = (v: string | null): v is PortfolioId => PORTFOLIOS.some((p) => p.id === v);

/**
 * Which portfolio to show. Pre-rendered HTML is the default (Creative); after load the choice comes
 * from `?style=` when the link has one, else Creative.
 */
export function usePortfolioChoice() {
  const [choice, setChoice] = useState<PortfolioId>(DEFAULT);

  useEffect(() => {
    // Creative always opens first; only a link with ?style= opens another style.
    const fromUrl = new URLSearchParams(location.search).get('style');
    if (isPortfolio(fromUrl)) setChoice(fromUrl);
  }, []);

  // Each style styles the page behind it (html background, overscroll colour).
  useEffect(() => {
    document.documentElement.dataset.portfolio = choice;
  }, [choice]);

  const choose = useCallback((next: PortfolioId) => {
    setChoice(next);
    const url = new URL(location.href);
    url.searchParams.set('style', next);
    url.hash = '';
    history.replaceState(null, '', url);
    window.scrollTo(0, 0);
  }, []);

  return [choice, choose] as const;
}
