/**
 * Contact API for Shreyas Ballari's portfolio (Google Apps Script, JavaScript).
 *
 * The website's contact form sends a POST request here. This script checks the message and
 * emails it to the inbox saved in the Script Property CONTACT_TO, sent from the Google account
 * that deployed it. The visitor's address is set as Reply-To, so pressing Reply answers them.
 *
 * The destination address is NOT written in this file (the file is in a public repository):
 * it lives in Project Settings → Script properties → CONTACT_TO.
 *
 * Setup and deployment: see README.md next to this file.
 */

/** Hard limits, so nobody can send huge or empty messages. */
var LIMITS = { name: 100, email: 200, topic: 60, message: 5000, page: 200 };
/** At most this many messages per sender address per hour, and per hour for the whole form. */
var PER_SENDER_PER_HOUR = 5;
var TOTAL_PER_HOUR = 40;

function doPost(e) {
  try {
    var data = parseBody_(e);

    // A hidden field real people never see. Bots fill it in; pretend it worked and drop it.
    if (data.website) return json_({ ok: true });

    var name = clean_(data.name, LIMITS.name);
    var email = clean_(data.email, LIMITS.email).toLowerCase();
    var topic = clean_(data.topic, LIMITS.topic) || 'General';
    var message = String(data.message || '').trim().slice(0, LIMITS.message);
    var page = clean_(data.page, LIMITS.page);

    var errors = {};
    if (!name) errors.name = 'Please add your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please add a valid email address.';
    if (message.length < 10) errors.message = 'Please write a little more (at least 10 characters).';
    if (Object.keys(errors).length) return json_({ ok: false, error: 'invalid', fields: errors });

    if (!allowed_(email)) return json_({ ok: false, error: 'rate_limited', message: 'Too many messages. Please try again in an hour.' });

    var to = PropertiesService.getScriptProperties().getProperty('CONTACT_TO');
    if (!to) return json_({ ok: false, error: 'not_configured' });

    var subject = 'Portfolio message: ' + topic + ' from ' + name;
    var sent = Utilities.formatDate(new Date(), 'America/New_York', 'EEE d MMM yyyy, h:mm a z');
    var plain =
      'New message from the portfolio contact form\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Topic: ' + topic + '\n' +
      'Sent: ' + sent + '\n' +
      (page ? 'Page: ' + page + '\n' : '') +
      '\n' + message + '\n\n' +
      '— Reply to this email to answer ' + name + ' directly.';

    MailApp.sendEmail({
      to: to,
      replyTo: email,
      name: 'Shreyas Ballari Portfolio',
      subject: subject,
      body: plain,
      htmlBody: html_(name, email, topic, sent, page, message),
    });

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

/** Opening the URL in a browser shows that the API is running (it sends nothing). */
function doGet() {
  return json_({ ok: true, service: 'portfolio-contact', method: 'POST JSON {name, email, topic, message}' });
}

/** Run this once from the editor to check that sending works (it emails CONTACT_TO). */
function sendTestEmail() {
  var result = doPost({
    postData: { contents: JSON.stringify({ name: 'Test Visitor', email: 'test@example.com', topic: 'Test', message: 'This is a test message from sendTestEmail().' }) },
  });
  console.log(result.getContent());
}

// --- helpers ---------------------------------------------------------------------------------

function parseBody_(e) {
  var raw = (e && e.postData && e.postData.contents) || '';
  try {
    return JSON.parse(raw);
  } catch (_) {
    return (e && e.parameter) || {};
  }
}

function clean_(v, max) {
  return String(v || '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function allowed_(email) {
  var cache = CacheService.getScriptCache();
  var keyAll = 'all';
  var keyOne = 'from:' + email;
  var all = Number(cache.get(keyAll) || 0);
  var one = Number(cache.get(keyOne) || 0);
  if (all >= TOTAL_PER_HOUR || one >= PER_SENDER_PER_HOUR) return false;
  cache.put(keyAll, String(all + 1), 3600);
  cache.put(keyOne, String(one + 1), 3600);
  return true;
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function html_(name, email, topic, sent, page, message) {
  var row = function (k, v) {
    return '<tr><td style="padding:6px 16px 6px 0;color:#6b7280;white-space:nowrap">' + k + '</td><td style="padding:6px 0;color:#111827">' + v + '</td></tr>';
  };
  return (
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff">' +
    '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#1f4dff;font-weight:600">Portfolio contact form</div>' +
    '<h2 style="margin:8px 0 16px;font-size:22px;color:#111827">New message from ' + esc_(name) + '</h2>' +
    '<table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">' +
    row('Name', esc_(name)) +
    row('Email', '<a href="mailto:' + esc_(email) + '" style="color:#1f4dff">' + esc_(email) + '</a>') +
    row('Topic', esc_(topic)) +
    row('Sent', esc_(sent)) +
    (page ? row('Page', esc_(page)) : '') +
    '</table>' +
    '<div style="white-space:pre-wrap;font-size:15px;line-height:1.6;color:#111827;padding:16px;border-radius:12px;background:#f3f4f7">' + esc_(message) + '</div>' +
    '<p style="font-size:12px;color:#6b7280;margin-top:16px">Press Reply to answer ' + esc_(name) + ' directly.</p>' +
    '</div>'
  );
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
