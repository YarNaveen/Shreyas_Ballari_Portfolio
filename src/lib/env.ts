import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  VITE_SITE_URL: z.string().url().default('http://localhost:5173'),
  VITE_TURNSTILE_SITE_KEY: z.string().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ANALYTICS_DOMAIN: z.string().optional(),
  /** Where the contact form posts: FormSubmit, which emails each message to the inbox in the URL.
   *  Works the same locally and on any GitHub Pages copy; set VITE_CONTACT_ENDPOINT to override. */
  VITE_CONTACT_ENDPOINT: z.preprocess((v) => (v === '' || v == null ? 'https://formsubmit.co/ajax/naveenymsd@gmail.com' : v), z.string().url()),
});

export const env = schema.parse(import.meta.env);
