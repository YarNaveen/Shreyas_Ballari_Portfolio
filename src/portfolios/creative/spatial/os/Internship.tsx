import type { CSSProperties, ReactNode } from 'react';
import { AppleLogo, Buildings, CalendarBlank, Certificate, IdentificationBadge, Lightbulb, ListChecks, SpeakerHigh, X } from '@phosphor-icons/react';
import { internship } from '@/content/portfolio';
import { speak } from '../story/narrator';
import { spatial } from '../store';
import { OSWindow } from './Window';

/**
 * Internship & Industry Experience: the summer internship with the company behind an AI-enabled
 * play mat. Only what the family has confirmed is shown as fact; every missing detail (company,
 * product name, dates, role, contributions, App Store link, certificate) shows a clearly marked
 * "to be added" label, filled in from content/portfolio.ts (`internship`) when it arrives.
 */

const st = (i: number) => ({ '--i': i }) as CSSProperties;

function Pending({ what }: { what: string }) {
  return <span className="in-pending">{what} · to be added</span>;
}

function Field({ icon, k, v, i }: { icon: ReactNode; k: string; v: ReactNode; i: number }) {
  return (
    <div className="in-field" style={st(i)}>
      <span className="in-field-ico">{icon}</span>
      <span>
        <small>{k}</small>
        <b>{v}</b>
      </span>
    </div>
  );
}

/** An illustration of a play mat (not the real product), until the product photo arrives. */
function MatArt() {
  return (
    <span className="in-mat" aria-hidden="true">
      <span className="in-mat-pad">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={st(i)} />
        ))}
      </span>
    </span>
  );
}

export function InternshipWindow() {
  const x = internship;
  const close = () => spatial.closeWindow('internship');
  return (
    <OSWindow id="internship" title={x.heading} className="os-internship" onClose={close}>
      <button type="button" className="os-inclose" aria-label="Close the internship" data-voice="close" onClick={close}>
        <X weight="bold" />
      </button>
      <div className="in os-scroll" data-lenis-prevent>
        <section className="in-product">
          {x.image ? <img src={x.image} alt={x.productName ?? x.product} /> : <MatArt />}
          <p className="in-product-note">{x.image ? (x.productName ?? x.product) : 'Illustration · product photo to be added'}</p>
          {x.appStoreUrl ? (
            <a className="in-store" href={x.appStoreUrl} target="_blank" rel="noreferrer">
              <AppleLogo weight="fill" aria-hidden="true" /> View on the App Store
            </a>
          ) : (
            <span className="in-store is-pending">
              <AppleLogo weight="fill" aria-hidden="true" /> App Store link · to be added
            </span>
          )}
        </section>

        <section className="in-main">
          <p className="in-kicker">{x.kind}</p>
          <h2>{x.heading}</h2>
          <p className="in-summary">{x.summary}</p>
          <button type="button" className="os-chip" data-voice="listen" onClick={() => speak(`${x.heading}. ${x.summary}`)}>
            <SpeakerHigh weight="bold" aria-hidden="true" /> Listen
          </button>

          <div className="in-fields">
            <Field i={0} icon={<Buildings weight="duotone" />} k="Company" v={x.company ? (x.companyUrl ? <a href={x.companyUrl} target="_blank" rel="noreferrer">{x.company}</a> : x.company) : <Pending what="Company name" />} />
            <Field i={1} icon={<Lightbulb weight="duotone" />} k="Product" v={x.productName ? `${x.productName} · ${x.product}` : <>{x.product} <Pending what="name" /></>} />
            <Field i={2} icon={<CalendarBlank weight="duotone" />} k="Period" v={x.period ?? <>Summer <Pending what="dates" /></>} />
            <Field i={3} icon={<IdentificationBadge weight="duotone" />} k="Role" v={x.role ?? <Pending what="Role" />} />
          </div>

          <div className="in-block">
            <p className="in-block-h">
              <ListChecks weight="bold" aria-hidden="true" /> His contributions
            </p>
            {x.contributions.length ? (
              <ul>
                {x.contributions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="in-empty">His own contributions will be listed here once confirmed.</p>
            )}
          </div>
          {x.learning.length > 0 && (
            <div className="in-block">
              <p className="in-block-h">What he learned</p>
              <ul>
                {x.learning.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <div className={`in-cert ${x.certificate ? '' : 'is-pending'}`}>
            <Certificate weight="duotone" aria-hidden="true" />
            {x.certificate ? (
              <a href={x.certificate} target="_blank" rel="noreferrer">
                View the internship certificate
              </a>
            ) : (
              <span>Internship certificate · to be added when received</span>
            )}
          </div>
        </section>
      </div>
    </OSWindow>
  );
}
