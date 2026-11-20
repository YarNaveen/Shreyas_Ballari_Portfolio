import { X } from '@phosphor-icons/react';
import { ContactPanel } from '@/features/details/Contact';
import '@/features/details/style';
import { spatial } from '../store';
import { OSWindow } from './Window';

/** The contact form as a glass app window (the same form as Studio and Classic). */
export function ContactWindow() {
  const close = () => spatial.closeWindow('contact');
  return (
    <OSWindow id="contact" title="Contact" className="os-contact" onClose={close}>
      <button type="button" className="os-inclose" aria-label="Close the contact form" data-voice="close" onClick={close}>
        <X weight="bold" />
      </button>
      <div className="dt os-contact-body" data-lenis-prevent>
        <ContactPanel />
      </div>
    </OSWindow>
  );
}
