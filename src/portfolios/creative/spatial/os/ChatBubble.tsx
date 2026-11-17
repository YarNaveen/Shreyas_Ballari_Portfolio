import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowSquareOut, ArrowUp, Sparkle, X } from '@phosphor-icons/react';
import { profile } from '@/content/portfolio';
import { CHAPTERS } from '../story/chapters';
import { speak } from '../story/narrator';
import { spatial, useSpatial } from '../store';
import { ask, SUGGESTIONS } from './assistant';
import { openApp } from './Dashboard';

/**
 * The AI, always one tap away: a glowing button in the bottom right corner that opens a small
 * chat over whatever you are looking at. Same answers as the full AI Chat app (only from his
 * portfolio), with a link to open the full app.
 */

interface Msg {
  id: number;
  me: boolean;
  text: string;
  open?: { app: string; label: string };
}

export function ChatBubble() {
  const open = useSpatial((s) => s.bubble);
  const chapter = useSpatial((s) => s.chapter);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, me: false, text: `Hi! Ask me anything about ${profile.firstName}.` }]);
  const [q, setQ] = useState('');
  const [thinking, setThinking] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const n = useRef(1);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, thinking]);
  useEffect(() => {
    if (open) window.setTimeout(() => input.current?.focus(), 250);
  }, [open]);

  // The full chat app is open: the bubble steps aside.
  if (CHAPTERS[chapter]?.id === 'chat') return null;

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setQ('');
    setMsgs((m) => [...m, { id: n.current++, me: true, text: t }]);
    setThinking(true);
    window.setTimeout(() => {
      const a = ask(t);
      setThinking(false);
      setMsgs((m) => [...m, { id: n.current++, me: false, text: a.text, open: a.open }]);
      if (spatial.get().narrate) speak(a.text);
    }, 450);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(q);
  };

  return (
    <div className={`cb ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="cb-panel" role="dialog" aria-label="Ask about Shreyas">
          <header className="cb-head">
            <span className="cb-orb is-small" aria-hidden="true" />
            <span>
              <b>Shreyas AI</b>
              <small>Answers from his portfolio</small>
            </span>
            <button type="button" className="os-round is-sm" aria-label="Open the full chat" onClick={() => (spatial.set({ bubble: false }), spatial.get().tour ? spatial.endTour('chat') : spatial.goChapter('chat'))}>
              <ArrowSquareOut weight="bold" />
            </button>
            <button type="button" className="os-round is-sm" aria-label="Close" onClick={() => spatial.set({ bubble: false })}>
              <X weight="bold" />
            </button>
          </header>
          <div ref={list} className="cb-list" aria-live="polite">
            {msgs.map((m) => (
              <div key={m.id} className={`cb-msg ${m.me ? 'is-me' : ''}`}>
                <p>{m.text}</p>
                {m.open && (
                  <button type="button" className="os-chip is-soft" onClick={() => (spatial.set({ bubble: false }), openApp(m.open!.app))}>
                    {m.open.label}
                  </button>
                )}
              </div>
            ))}
            {thinking && (
              <div className="cb-msg">
                <p className="ch-dots" aria-label="Thinking">
                  <i />
                  <i />
                  <i />
                </p>
              </div>
            )}
            {msgs.length === 1 && (
              <div className="cb-sugg">
                {SUGGESTIONS.slice(0, 5).map((s) => (
                  <button key={s} type="button" className="os-chip is-soft" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form className="cb-input" onSubmit={submit}>
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about his research, awards…" aria-label="Your question" />
            <button type="submit" aria-label="Send">
              <ArrowUp weight="bold" />
            </button>
          </form>
        </section>
      )}
      <button type="button" className="cb-fab" aria-label={open ? 'Close the AI chat' : 'Ask the AI about Shreyas'} aria-expanded={open} data-voice="ask ai" onClick={() => spatial.set({ bubble: !open })}>
        <span className="cb-orb" aria-hidden="true" />
        {open ? <X weight="bold" /> : <Sparkle weight="fill" />}
        <span className="sp-cap" aria-hidden="true">
          {open ? 'Close' : 'Ask AI'}
        </span>
      </button>
    </div>
  );
}
