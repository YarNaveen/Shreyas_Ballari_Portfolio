import { DownloadSimple, EnvelopeSimple, FileText, Phone } from '@phosphor-icons/react';
import type { MouseEvent, PointerEvent } from 'react';
import { contact } from '@/content/portfolio';
import './reach.css';

/** The public resume (redacted copy) and how to reach him; used by all three portfolios. */
export const RESUME = contact.resume;
export const RESUME_NAME = 'Shreyas_Ballari_Resume.pdf';
export const TEL = `tel:${contact.phone.replace(/[^0-9+]/g, '')}`;

/** Links that must not start a drag or open the card they sit on. */
const stop = (e: MouseEvent | PointerEvent) => e.stopPropagation();

/**
 * View resume, Download resume, Email and Call, as a row of pills. `tone` picks colours for a
 * light or dark background; `compact` shows icons with short labels.
 */
export function Reach({ tone = 'dark', compact = false, className = '', tabIndex }: { tone?: 'dark' | 'light' | 'auto'; compact?: boolean; className?: string; tabIndex?: number }) {
  const p = { onClick: stop, onPointerDown: stop, tabIndex };
  return (
    <div className={`rc is-${tone} ${compact ? 'is-compact' : ''} ${className}`} role="group" aria-label="Resume and contact">
      <a className="rc-btn is-main" href={RESUME} target="_blank" rel="noopener" data-voice="view resume" {...p}>
        <FileText weight="bold" aria-hidden="true" /> <span>View resume</span>
      </a>
      <a className="rc-btn" href={RESUME} download={RESUME_NAME} data-voice="download resume" aria-label="Download resume (PDF)" {...p}>
        <DownloadSimple weight="bold" aria-hidden="true" /> <span>Download</span>
      </a>
      <a className="rc-btn" href={`mailto:${contact.email}`} aria-label={`Email ${contact.email}`} {...p}>
        <EnvelopeSimple weight="bold" aria-hidden="true" /> <span>{compact ? 'Email' : contact.email}</span>
      </a>
      <a className="rc-btn" href={TEL} aria-label={`Call ${contact.phone}`} {...p}>
        <Phone weight="bold" aria-hidden="true" /> <span>{compact ? 'Call' : contact.phone}</span>
      </a>
    </div>
  );
}
