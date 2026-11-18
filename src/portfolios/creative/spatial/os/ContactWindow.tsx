import { ContactPanel } from '@/features/details/Contact';
import '@/features/details/style';
import { spatial } from '../store';
import { OSWindow } from './Window';

/** The contact form as a glass app window (the same form as Studio and Classic). */
export function ContactWindow() {
  const close = () => spatial.closeWindow('contact');
  return (
    <OSWindow id="contact" title="Contact" className="os-contact" onClose={close}>
      <div className="dt os-contact-body" data-lenis-prevent>
        <ContactPanel />
      </div>
    </OSWindow>
  );
}
