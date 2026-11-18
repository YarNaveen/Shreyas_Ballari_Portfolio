# Contact API

The portfolio is a static website on GitHub Pages, so it cannot send email by itself. This small API
receives the contact form and emails each message to one inbox.

- **Language:** JavaScript, running on **Google Apps Script** (Google's free server for small scripts).
- **Why this choice:** free, no server to run, no API keys in the website, and the email is sent
  through Gmail, so it lands in the inbox reliably. Changing the receiving address later takes one
  setting, no code change.
- **Limits:** a free Google account can send about 100 emails a day, far more than a portfolio needs.
  The script also allows at most 5 messages an hour from one sender and 40 an hour in total.

## How it works

1. A visitor fills in the form (name, email, topic, message) and presses Send.
2. The website sends the details to the API URL (`VITE_CONTACT_ENDPOINT`).
3. `Code.gs` checks the details, ignores bots (a hidden field) and limits how often one person can send.
4. It emails the message to the address in the Script Property `CONTACT_TO`. The visitor's email is
   the Reply-To, so pressing **Reply** answers them directly.
5. The website shows "Thank you. Your message was sent".

## Set it up (about 5 minutes, once)

Do this signed in to the Google account that should send the emails.

1. Go to [script.google.com](https://script.google.com) and click **New project**. Name it
   `Portfolio contact`.
2. Delete what is in `Code.gs` and paste in everything from `api/contact/Code.gs`. Save.
3. **Project Settings** (gear icon) → **Script properties** → **Add script property**:
   - Property: `CONTACT_TO`
   - Value: the inbox that should receive messages (for testing: `naveenymsd@gmail.com`)
   
   Save.
4. Back in the editor, choose the function `sendTestEmail` and click **Run**. Google asks for
   permission to send email as you: review and allow it. A test email should arrive at `CONTACT_TO`.
5. **Deploy** → **New deployment** → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   
   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. In GitHub: the repository → **Settings** → **Secrets and variables** → **Actions** → **Variables**
   → **New repository variable**:
   - Name: `VITE_CONTACT_ENDPOINT`
   - Value: the Web app URL
7. Re-run the latest **Deploy to GitHub Pages** workflow (Actions tab), or push any change. The form
   is now live.

For local testing, put the same line in a `.env` file: `VITE_CONTACT_ENDPOINT=https://script.google.com/macros/s/…/exec`.

## Switch to Shreyas's email later

Change the Script Property `CONTACT_TO` to his address. Nothing else changes: no new deployment, no
website change.

## Updating the script

After editing `Code.gs` in the Apps Script editor: **Deploy** → **Manage deployments** → edit the
web app → Version: **New version** → **Deploy**. The URL stays the same.

## Responses

| Response | Meaning |
| --- | --- |
| `{"ok": true}` | Sent |
| `{"ok": false, "error": "invalid", "fields": {...}}` | A field is missing or wrong; the form shows the message under it |
| `{"ok": false, "error": "rate_limited"}` | Too many messages in the last hour |
| `{"ok": false, "error": "not_configured"}` | `CONTACT_TO` is not set |
| `{"ok": false, "error": "server_error"}` | Something else went wrong; see **Executions** in Apps Script |
