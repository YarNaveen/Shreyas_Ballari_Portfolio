import { useState, type FormEvent } from 'react';
import { ChalkboardTeacher, ChartLineUp, CheckCircle, Dna, PaperPlaneTilt, Sparkle } from '@phosphor-icons/react';
import { profile } from '@/content/portfolio';
import { env } from '@/lib/env';
import { Reach } from './Reach';

/**
 * The contact panel: his photo, what to write about (tap a topic) and a short form. Used inside the
 * Studio phone, over Classic, and on /contact.
 *
 * Messages go to VITE_CONTACT_ENDPOINT: the contact API in api/contact (Google Apps Script), which
 * emails them to the inbox saved in its Script Properties. Until that is set the panel says plainly that nothing was sent. No email
 * address, phone number or home address is ever shown.
 */

const PHOTO = `${import.meta.env.BASE_URL}assets/shreyas/portrait-studio.jpg`;
const TOPICS = [
  { id: 'Oncure', icon: Dna },
  { id: 'AI trading app', icon: ChartLineUp },
  { id: 'Tutoring', icon: ChalkboardTeacher },
  { id: 'Something else', icon: Sparkle },
];

export function ContactPanel({ reachTone = 'auto' }: { reachTone?: 'dark' | 'light' | 'auto' }) {
  const [topic, setTopic] = useState('Oncure');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'offline' | 'failed' | 'busy'>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data: Record<string, string> = { ...(Object.fromEntries(new FormData(form)) as Record<string, string>), topic, page: window.location.href };
    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = 'Please add your name.';
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? '')) next.email = 'Please add an email address we can reply to.';
    if ((data.message ?? '').trim().length < 10) next.message = 'Please write a little more (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!env.VITE_CONTACT_ENDPOINT) {
      setState('offline');
      return;
    }
    setState('sending');
    try {
      // FormSubmit (formsubmit.co/ajax/…) emails the message; the extra fields set the subject,
      // the reply address, a tidy table layout and its bot trap.
      const payload = {
        name: data.name,
        email: data.email,
        topic: data.topic,
        message: data.message,
        page: data.page,
        _subject: `Portfolio message: ${data.topic} from ${data.name}`,
        _replyto: data.email,
        _template: 'table',
        _captcha: 'false',
        _honey: data.website ?? '',
      };
      const res = await fetch(env.VITE_CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      const reply = (await res.json().catch(() => ({ ok: true }))) as { ok?: boolean; success?: boolean | string; error?: string; fields?: Record<string, string> };
      if (reply.success === false || reply.success === 'false') throw new Error('not sent');
      if (reply.ok === false) {
        if (reply.fields) {
          setErrors(reply.fields);
          setState('idle');
          return;
        }
        setState(reply.error === 'rate_limited' ? 'busy' : 'failed');
        return;
      }
      setState('sent');
      form.reset();
    } catch {
      setState('failed');
    }
  };
  const field = (name: string) => ({ name, 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': errors[name] ? `ct-${name}-err` : undefined });

  return (
    <div className="dt-body ct">
      <header className="ct-head">
        <img className="ct-photo" src={PHOTO} alt={`${profile.name}`} />
        <div>
          <p className="dt-kicker">Contact</p>
          <h2 className="dt-title">Say hello to {profile.firstName}</h2>
          <p className="dt-lede">Questions about his research, his app or tutoring are welcome. Email, call, or write below.</p>
        </div>
      </header>

      <div className="ct-reach">
        <p className="dt-kicker">Resume and direct contact</p>
        <Reach tone={reachTone} />
      </div>

      {state === 'sent' ? (
        <p className="ct-done" role="status">
          <CheckCircle weight="fill" aria-hidden="true" /> Thank you. Your message was sent, and the family will reply by email.
        </p>
      ) : (
        <form className="dt-form ct-form" noValidate onSubmit={submit}>
          <fieldset className="ct-topics">
            <legend>What is it about?</legend>
            {TOPICS.map(({ id, icon: I }) => (
              <button key={id} type="button" className={`ct-topic ${topic === id ? 'is-on' : ''}`} aria-pressed={topic === id} onClick={() => setTopic(id)}>
                <I weight="duotone" aria-hidden="true" /> {id}
              </button>
            ))}
          </fieldset>
          <div className="ct-row">
            <label>
              Your name
              <input type="text" autoComplete="name" {...field('name')} />
              {errors.name && (
                <span id="ct-name-err" className="dt-err">
                  {errors.name}
                </span>
              )}
            </label>
            <label>
              Your email
              <input type="email" autoComplete="email" {...field('email')} />
              {errors.email && (
                <span id="ct-email-err" className="dt-err">
                  {errors.email}
                </span>
              )}
            </label>
          </div>
          <label>
            Message
            <textarea rows={5} placeholder={`Hi ${profile.firstName}, I would like to ask about ${topic === 'Something else' ? '…' : topic}.`} {...field('message')} />
            {errors.message && (
              <span id="ct-message-err" className="dt-err">
                {errors.message}
              </span>
            )}
          </label>
          {/* Hidden from people; bots that fill every field are ignored by the API. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="ct-hp" />
          <button type="submit" className="dt-send" disabled={state === 'sending'}>
            <PaperPlaneTilt weight="fill" aria-hidden="true" /> {state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          {state === 'offline' && (
            <p className="dt-status" role="status">
              The contact form is not connected yet, so this message was not sent. Please try again later.
            </p>
          )}
          {state === 'busy' && (
            <p className="dt-status" role="alert">
              Too many messages were sent just now. Please try again in an hour.
            </p>
          )}
          {state === 'failed' && (
            <p className="dt-status" role="alert">
              Sending failed. Please check your connection and try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
