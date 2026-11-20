import { useEffect, useState } from 'react';
import { Microphone, MicrophoneSlash, Question, X } from '@phosphor-icons/react';

/**
 * Voice mode, set up like hand mode: the visitor first reads what it does and agrees, then a
 * status panel shows that the site is listening, what it heard and what it did. The browser's own
 * speech recognition is used; the microphone only starts after "Turn on the microphone", and
 * stops with the close button, the mic button or by saying "stop listening".
 */

export interface VoiceState {
  supported: boolean;
  listening: boolean;
  heard: string;
  error: string;
  start: () => void;
  stop: () => void;
}

/** What can be said, grouped for the guide. Every phrase here is handled in commands.ts. */
export const VOICE_GUIDE: { title: string; items: string[] }[] = [
  { title: 'Open', items: ['“Open profile”', '“Open the Oncure project”', '“Show the trading app”', '“Show his awards”', '“Open games”', '“Dashboard”'] },
  { title: 'Click anything', items: ['“Click on profile card”', '“Click on games card”', '“Click on explore button”', '“Click play”', '“Click card 2”', '“Download resume”'] },
  { title: 'Move around', items: ['“Next / Show me the next one”', '“Previous project”', '“Go back”', '“Close”', '“Scroll down / Scroll up”', '“Scroll to the top”'] },
  { title: 'The house', items: ['“Start the house tour”', '“Next room”', '“360 view / Done”', '“Night mode / Daylight”', '“Squeeze / Bring back”', '“Full screen”'] },
  { title: 'Ask and more', items: ['“Ask who is Shreyas”', '“Watch the video”', '“Next award / Shuffle”', '“Hand control on”', '“What can I say”', '“Stop listening”'] },
];

export function VoiceControl({ on, voice, result, onOff }: { on: boolean; voice: VoiceState; result: string; onOff: () => void }) {
  const [consent, setConsent] = useState(false);
  const [guide, setGuide] = useState(false);

  // Turning the mode off stops the microphone and asks again next time.
  useEffect(() => {
    if (!on) {
      if (voice.listening) voice.stop();
      setConsent(false);
      setGuide(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // "What can I say" opens the guide.
  useEffect(() => {
    const open = () => setGuide(true);
    window.addEventListener('sp-voice-guide', open);
    return () => window.removeEventListener('sp-voice-guide', open);
  }, []);

  if (!on) return null;

  const close = () => {
    voice.stop();
    onOff();
  };

  const list = (
    <div className="sp-voice-guide">
      {VOICE_GUIDE.map((g) => (
        <section key={g.title}>
          <h3>{g.title}</h3>
          <ul>
            {g.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

  if (!voice.supported) {
    return (
      <div className="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-voice-h">
        <div className="sp-modal-glass sp-voice-modal">
          <h2 id="sp-voice-h">Voice control is not available here</h2>
          <p>This browser does not offer speech recognition. Open the site in Chrome, Edge or Safari to move through the home by voice. Touch, mouse and keyboard work as usual.</p>
          <div className="sp-modal-actions">
            <button type="button" className="sp-btn is-primary" onClick={onOff}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!consent) {
    return (
      <div className="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-voice-h">
        <div className="sp-modal-glass sp-voice-modal">
          <span className="sp-voice-badge" aria-hidden="true">
            <Microphone weight="fill" />
          </span>
          <h2 id="sp-voice-h">Use your voice</h2>
          <p>Say what you want to see and the home does it. Your browser turns speech into text; nothing is recorded or saved by this site. You can turn it off at any time.</p>
          {list}
          <p className="sp-modal-tip">Tip: speak normally, one command at a time. Your browser will ask for permission to use the microphone.</p>
          <div className="sp-modal-actions">
            <button type="button" className="sp-btn" onClick={onOff}>
              Not now
            </button>
            <button
              type="button"
              className="sp-btn is-primary"
              onClick={() => {
                setConsent(true);
                voice.start();
              }}
            >
              Turn on the microphone
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`sp-voice-panel ${voice.listening ? 'is-live' : ''}`} role="status" aria-live="polite">
        <span className="sp-orb" aria-hidden="true" />
        <span className="sp-voice-text">
          <b>{voice.error ? 'Microphone off' : voice.listening ? (voice.heard ? `“${voice.heard}”` : 'Listening…') : 'Starting the microphone…'}</b>
          <small>{voice.error || result || 'Try “click on profile card”, “scroll down” or “go back”'}</small>
        </span>
        <button type="button" className="os-round is-sm" aria-label="Voice commands list" data-voice="what can i say" onClick={() => setGuide(!guide)}>
          <Question weight="bold" />
        </button>
        {voice.error ? (
          <button type="button" className="os-round is-sm" aria-label="Try the microphone again" onClick={voice.start}>
            <Microphone weight="bold" />
          </button>
        ) : null}
        <button type="button" className="os-round is-sm" aria-label="Stop voice control" onClick={close}>
          <MicrophoneSlash weight="bold" />
        </button>
      </div>
      {guide && (
        <div className="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-voice-g" onClick={(e) => e.target === e.currentTarget && setGuide(false)}>
          <div className="sp-modal-glass sp-voice-modal">
            <button type="button" className="os-round is-sm sp-voice-x" aria-label="Close the commands list" data-voice="close" onClick={() => setGuide(false)}>
              <X weight="bold" />
            </button>
            <h2 id="sp-voice-g">What you can say</h2>
            {list}
          </div>
        </div>
      )}
    </>
  );
}
