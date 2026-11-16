import { Seo } from '@/components/seo/Seo';
import { HEADSET_CREDIT } from '@/content/credits';
import '@/features/details/style';

/** /privacy: what this site does and does not do with visitors' data, and the credits. */
export function Component() {
  const items = [
    { title: 'No tracking', line: 'The site uses no advertising, no tracking cookies and no analytics that follow you.' },
    { title: 'Your preferences stay on your device', line: 'Your last tab, the dashboard order and similar settings are saved in your own browser only. Clearing your browser data removes them.' },
    { title: 'Camera (hand control)', line: 'Only starts after you agree. Your hand is tracked inside your browser; no video is recorded, saved or sent anywhere.' },
    { title: 'Microphone (voice control)', line: 'Only starts after you agree. Your browser turns speech into text to run the command; this site records and saves nothing.' },
    { title: 'AI voice', line: 'Muted until you turn it on. The voice is made by your own browser.' },
    { title: 'Contact form', line: 'Your name, email and message are used only to reply to you, and are read by Shreyas’s family first.' },
  ];
  return (
    <>
      <Seo title="Privacy" description="How this site treats visitors’ data: no tracking, camera and microphone only after you agree, and nothing recorded." />
      <div className="dt dt--page is-static">
        <div className="dt-body">
          <header className="dt-head">
            <p className="dt-kicker">Privacy</p>
            <h1 className="dt-title">Your privacy on this site</h1>
          </header>
          <ul className="dt-grid">
            {items.map((x) => (
              <li key={x.title}>
                <b>{x.title}</b>
                <p>{x.line}</p>
              </li>
            ))}
          </ul>
          <section className="dt-end" aria-labelledby="credits-h">
            <b id="credits-h" className="dt-h">
              Credits
            </b>
            <p>
              “{HEADSET_CREDIT.title}” 3D model by{' '}
              <a className="dt-go" href={HEADSET_CREDIT.url} target="_blank" rel="noreferrer">
                {HEADSET_CREDIT.author}
              </a>
              , licensed {HEADSET_CREDIT.license}. House furniture, textures and sky from Poly Haven (CC0). Illustrations are marked as illustrations.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
