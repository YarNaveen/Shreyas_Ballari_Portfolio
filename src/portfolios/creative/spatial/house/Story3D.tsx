import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, VideoTexture, type Group, type Mesh } from 'three';
import { activities, courses, goals, languages, oncure, percentiles, resume, volunteering } from '@/content/portfolio';
import { TOUR } from '../story/tour';
import { spatial } from '../store';
import { B, Slab, canvasTexture, useMats } from './kit';
import { Model } from './Model';
import { Framed, Pendant, Rug } from './props';
import { SCREEN } from './Projector';

/**
 * His story, placed in the rooms: the community room (how he tutors, where he volunteers, students
 * round a table), activity posters in the music room, Oncure and the trading app in the R&D lab
 * (his video plays on the wall screen, app screens on the monitors), a score chart in the
 * gallery, a courses board in the study, his goals on a sign in the garden, and a thank-you on
 * the living-room screen at the end of the tour. Every fact comes from content/portfolio.ts;
 * the app screens are a concept design with sample data.
 */

type G = CanvasRenderingContext2D;
const FONT = 'Manrope, "Segoe UI", Helvetica, Arial, sans-serif';

function round(g: G, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Writes text wrapped to a width; returns the y after the last line. */
function wrap(g: G, text: string, x: number, y: number, w: number, lh: number, max = 99) {
  const words = text.split(' ');
  let line = '';
  let n = 0;
  for (const word of words) {
    const t = line ? `${line} ${word}` : word;
    if (g.measureText(t).width > w && line) {
      g.fillText(line, x, y);
      y += lh;
      line = word;
      if (++n >= max - 1) break;
    } else line = t;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}

const font = (g: G, size: number, weight = 600) => (g.font = `${weight} ${size}px ${FONT}`);

// --- Textures ---------------------------------------------------------------------------------

/** The tutoring whiteboard: how he tutors, in marker. */
export function tutoringTexture() {
  return canvasTexture(1600, 860, (g) => {
    g.fillStyle = '#fbfbf8';
    g.fillRect(0, 0, 1600, 860);
    g.fillStyle = '#1f3b8a';
    font(g, 64, 800);
    g.fillText('How Shreyas tutors', 70, 110);
    font(g, 30, 600);
    g.fillStyle = '#5a6577';
    g.fillText('Peer tutor · Math and Science · 7th and 8th grade', 72, 160);
    const steps = [
      ['Find the gaps', 'Identify lagging skills and weak spots'],
      ['Explain step by step', 'Visual aids, diagrams, simple words'],
      ['Practise together', 'Homework help and small group sessions'],
      ['Get ready', 'Prepare for quizzes and exams'],
      ['Give feedback', 'Writing and critical thinking'],
    ];
    const colors = ['#e0466e', '#f28c28', '#22a06b', '#3b82f6', '#9b6bff'];
    steps.forEach(([t, s], i) => {
      const x = 70 + i * 300;
      const y = 260;
      g.fillStyle = colors[i]!;
      g.beginPath();
      g.arc(x + 46, y + 46, 46, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 50, 800);
      g.fillText(String(i + 1), x + 32, y + 64);
      if (i < steps.length - 1) {
        g.strokeStyle = '#9aa3b2';
        g.lineWidth = 5;
        g.setLineDash([14, 12]);
        g.beginPath();
        g.moveTo(x + 104, y + 46);
        g.lineTo(x + 288, y + 46);
        g.stroke();
        g.setLineDash([]);
      }
      g.fillStyle = '#16213a';
      font(g, 36, 800);
      wrap(g, t!, x, y + 150, 260, 42, 2);
      g.fillStyle = '#4a5568';
      font(g, 26, 500);
      wrap(g, s!, x, y + 245, 250, 34, 3);
    });
    g.fillStyle = '#16213a';
    font(g, 30, 700);
    g.fillText('Result: better grades and stronger study habits', 70, 720);
    g.fillStyle = '#5a6577';
    font(g, 24, 500);
    g.fillText(resume.tutoring[0]!, 70, 770);
  });
}

const VOL_EMOJI = ['🩺', '🛕', '📚'];
const VOL_TINT = ['#e0466e', '#f28c28', '#3b82f6'];
/** A volunteering panel. */
export function volunteerTexture(i: number) {
  const v = volunteering[i]!;
  return canvasTexture(640, 840, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 840);
    grad.addColorStop(0, VOL_TINT[i]!);
    grad.addColorStop(1, '#141826');
    g.fillStyle = grad;
    g.fillRect(0, 0, 640, 840);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.beginPath();
    g.arc(320, 270, 170, 0, Math.PI * 2);
    g.fill();
    font(g, 190, 400);
    g.textAlign = 'center';
    g.fillText(VOL_EMOJI[i]!, 320, 335);
    g.fillStyle = '#fff';
    font(g, 26, 800);
    g.fillText('GIVING BACK', 320, 520);
    font(g, 46, 800);
    wrap(g, v.title, 320, 590, 560, 54, 2);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    font(g, 30, 500);
    wrap(g, v.role, 320, 720, 540, 38, 3);
    g.textAlign = 'left';
  });
}

const ACT_EMOJI: Record<string, string> = { 'Swim Atlanta': '🏊', 'Muay Thai': '🥊', Guitar: '🎸', 'Science Olympiad': '🔬', DECA: '💼' };
const ACT_TINT: Record<string, [string, string]> = {
  'Swim Atlanta': ['#2bb5e8', '#0b3a6b'],
  'Muay Thai': ['#ff5a6e', '#4a0d1a'],
  Guitar: ['#ffb347', '#5a2c08'],
  'Science Olympiad': ['#6c8cff', '#1a1f5c'],
  DECA: ['#2fd18b', '#0b3d2a'],
};
/** An activity poster. */
export function activityTexture(title: string) {
  const a = activities.find((x) => x.title === title)!;
  const [c0, c1] = ACT_TINT[title] ?? ['#888', '#222'];
  return canvasTexture(640, 860, (g) => {
    const grad = g.createLinearGradient(0, 0, 640, 860);
    grad.addColorStop(0, c0);
    grad.addColorStop(1, c1);
    g.fillStyle = grad;
    g.fillRect(0, 0, 640, 860);
    g.strokeStyle = 'rgba(255,255,255,0.18)';
    g.lineWidth = 3;
    for (let r = 120; r < 900; r += 70) {
      g.beginPath();
      g.arc(560, 120, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.textAlign = 'center';
    font(g, 230, 400);
    g.fillText(ACT_EMOJI[title] ?? '⭐', 320, 380);
    g.fillStyle = '#fff';
    font(g, 26, 800);
    g.fillText('BEYOND CLASS', 320, 540);
    font(g, 56, 800);
    wrap(g, a.title, 320, 615, 580, 62, 2);
    g.fillStyle = 'rgba(255,255,255,0.88)';
    font(g, 32, 600);
    wrap(g, a.role, 320, 745, 560, 40, 2);
    g.textAlign = 'left';
  });
}

/** The study whiteboard: his courses and languages. */
export function coursesTexture() {
  return canvasTexture(1600, 860, (g) => {
    g.fillStyle = '#fbfbf8';
    g.fillRect(0, 0, 1600, 860);
    g.fillStyle = '#16213a';
    font(g, 62, 800);
    g.fillText('Courses taken', 70, 110);
    const groups: [string, string, string[]][] = [
      ['Computer science and AI', '#3b82f6', courses.filter((c) => /Computer|Artificial/.test(c))],
      ['Sciences', '#22a06b', courses.filter((c) => /Biology|Chemistry|Physics/.test(c))],
      ['Languages and business', '#f28c28', courses.filter((c) => /English|Spanish|Entrepreneurship/.test(c))],
    ];
    groups.forEach(([k, c, xs], i) => {
      const x = 70 + i * 500;
      g.fillStyle = c;
      round(g, x, 160, 460, 60, 30);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 28, 800);
      g.fillText(k, x + 26, 200);
      g.fillStyle = '#16213a';
      font(g, 34, 600);
      xs.forEach((t, j) => {
        g.fillStyle = c;
        g.beginPath();
        g.arc(x + 14, 286 + j * 70, 9, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#16213a';
        g.fillText(t, x + 38, 298 + j * 70);
      });
    });
    g.fillStyle = '#16213a';
    font(g, 40, 800);
    g.fillText('Writes code in', 70, 640);
    languages.forEach((l, i) => {
      const x = 70 + i * 300;
      g.fillStyle = ['#f7df1e', '#3776ab', '#e76f00'][i] ?? '#888';
      round(g, x, 680, 270, 90, 45);
      g.fill();
      g.fillStyle = i === 0 ? '#16213a' : '#fff';
      font(g, 38, 800);
      g.fillText(l, x + 36, 740);
    });
    g.fillStyle = '#5a6577';
    font(g, 26, 500);
    g.fillText('Mathematics through AP Pre-calculus · all honours and AP', 1000, 740);
  });
}

/** Gallery: his percentile scores as a chart. */
export function scoresTexture() {
  return canvasTexture(1000, 780, (g) => {
    g.fillStyle = '#121216';
    g.fillRect(0, 0, 1000, 780);
    g.fillStyle = '#ffd770';
    font(g, 26, 800);
    g.fillText('TOP PERCENTILE SCORES', 60, 80);
    g.fillStyle = '#fff';
    font(g, 46, 800);
    g.fillText('PSAT and MAP', 60, 140);
    const base = 650;
    percentiles.forEach((p, i) => {
      const x = 80 + i * 175;
      const h = ((p.value - 90) / 10) * 380 + 40;
      const grad = g.createLinearGradient(0, base - h, 0, base);
      grad.addColorStop(0, p.test === 'PSAT' ? '#ffd770' : '#8fb4ff');
      grad.addColorStop(1, p.test === 'PSAT' ? '#b8892c' : '#3b5bdb');
      g.fillStyle = grad;
      round(g, x, base - h, 110, h, 18);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 40, 800);
      g.textAlign = 'center';
      g.fillText(`Top ${p.value}%`, x + 55, base - h - 18);
      font(g, 22, 600);
      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.fillText(p.test, x + 55, base + 40);
      g.fillText(p.grade.replace(' grade', ''), x + 55, base + 70);
      g.textAlign = 'left';
    });
    g.fillStyle = 'rgba(255,255,255,0.6)';
    font(g, 20, 500);
    g.fillText('Percentiles · PSAT 8/9 score in 8th grade: 1280 / 1440', 60, 760);
  });
}

/** R&D lab: the Oncure steps board. */
export function oncureBoardTexture() {
  return canvasTexture(1200, 860, (g) => {
    const grad = g.createLinearGradient(0, 0, 1200, 860);
    grad.addColorStop(0, '#1a0f24');
    grad.addColorStop(1, '#0b1630');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1200, 860);
    g.fillStyle = '#ff8fb0';
    font(g, 26, 800);
    g.fillText('RESEARCH CONCEPT', 60, 80);
    g.fillStyle = '#fff';
    font(g, 64, 800);
    g.fillText('Oncure', 60, 150);
    font(g, 28, 500);
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.fillText('AI-powered nanobot cancer treatment', 60, 196);
    oncure.steps.forEach((s, i) => {
      const y = 260 + i * 104;
      g.fillStyle = ['#e0466e', '#c0479a', '#9b6bff', '#5b7cfa', '#2bb5e8'][i]!;
      round(g, 60, y, 1080, 86, 24);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.beginPath();
      g.arc(110, y + 43, 28, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 32, 800);
      g.fillText(String(i + 1), 100, y + 54);
      font(g, 32, 800);
      g.fillText(s.title, 160, y + 42);
      font(g, 24, 500);
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.fillText(s.line, 160, y + 72);
    });
    g.fillStyle = 'rgba(255,255,255,0.6)';
    font(g, 20, 500);
    g.fillText('A conceptual research proposal, not a clinically validated treatment.', 60, 830);
  });
}

/** R&D lab: what the trading app does (board). */
export function tradingBoardTexture() {
  return canvasTexture(1200, 860, (g) => {
    const grad = g.createLinearGradient(0, 0, 1200, 860);
    grad.addColorStop(0, '#062a1f');
    grad.addColorStop(1, '#0b1630');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1200, 860);
    g.fillStyle = '#6be3a4';
    font(g, 26, 800);
    g.fillText('CONCEPT · PERSONAL PROJECT', 60, 80);
    g.fillStyle = '#fff';
    font(g, 60, 800);
    g.fillText('Stock Trading Application', 60, 148);
    font(g, 26, 500);
    g.fillStyle = 'rgba(255,255,255,0.82)';
    wrap(g, 'Beginner-friendly and welcoming to veterans: an AI model uses real-world data and algorithms to advise how much to buy, when to buy and an estimate of when to sell, right next to the stock graph.', 60, 200, 1080, 36, 3);
    const items = ['Dashboard', 'Current stocks', 'Your holdings', 'Buy and sell', 'Buy / sell stage', 'Pending orders', 'Progress graphs', 'Top performers', 'AI calculators'];
    items.forEach((t, i) => {
      const x = 60 + (i % 3) * 365;
      const y = 340 + Math.floor(i / 3) * 120;
      g.fillStyle = 'rgba(255,255,255,0.1)';
      round(g, x, y, 340, 96, 22);
      g.fill();
      g.fillStyle = '#2fd18b';
      g.beginPath();
      g.arc(x + 42, y + 48, 14, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 30, 700);
      g.fillText(t, x + 72, y + 58);
    });
    g.fillStyle = 'rgba(255,255,255,0.6)';
    font(g, 20, 500);
    g.fillText('Suggestions are hypothetical, not financial advice.', 60, 830);
  });
}

const SAMPLE = [
  { t: 'NOVA', n: 'Nova Labs (sample)', v: '+4.2%', up: true, stage: 'Holding' },
  { t: 'ORBT', n: 'Orbit Foods (sample)', v: '+1.8%', up: true, stage: 'Buying · 2 of 3' },
  { t: 'LUMA', n: 'Luma Energy (sample)', v: '−0.9%', up: false, stage: 'Sell window soon' },
];

function appChrome(g: G, w: number, h: number, active: string) {
  g.fillStyle = '#0d1117';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#131a24';
  g.fillRect(0, 0, 200, h);
  g.fillStyle = '#2fd18b';
  font(g, 26, 800);
  g.fillText('◆ TradeMind', 24, 52);
  ['Dashboard', 'Stocks', 'Holdings', 'Pending', 'Top picks', 'Calculator'].forEach((t, i) => {
    const on = t === active;
    if (on) {
      g.fillStyle = 'rgba(47,209,139,0.16)';
      round(g, 12, 90 + i * 56, 176, 44, 12);
      g.fill();
    }
    g.fillStyle = on ? '#2fd18b' : 'rgba(255,255,255,0.65)';
    font(g, 20, on ? 800 : 600);
    g.fillText(t, 30, 119 + i * 56);
  });
  g.fillStyle = 'rgba(255,255,255,0.35)';
  font(g, 15, 600);
  g.fillText('Concept design · sample data', 24, h - 20);
}

function spark(g: G, x: number, y: number, w: number, h: number, up: boolean, seed: number) {
  g.strokeStyle = up ? '#2fd18b' : '#ff5a6e';
  g.lineWidth = 4;
  g.beginPath();
  for (let i = 0; i <= 24; i++) {
    const v = Math.sin(i * 0.7 + seed) * 0.25 + (up ? i / 24 : 1 - i / 24) * 0.6 + 0.1;
    const px = x + (i / 24) * w;
    const py = y + h - v * h;
    if (i) g.lineTo(px, py);
    else g.moveTo(px, py);
  }
  g.stroke();
}

/** App screen 1: the dashboard (holdings with their buy/sell stage, pending orders, top picks). */
export function appDashboardTexture() {
  return canvasTexture(1280, 740, (g) => {
    appChrome(g, 1280, 740, 'Dashboard');
    g.fillStyle = '#fff';
    font(g, 34, 800);
    g.fillText('Your dashboard', 230, 62);
    // Holdings
    g.fillStyle = '#151d29';
    round(g, 230, 90, 640, 400, 22);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    font(g, 20, 700);
    g.fillText('HOLDINGS · BUY / SELL STAGE', 256, 128);
    SAMPLE.forEach((s, i) => {
      const y = 160 + i * 106;
      g.fillStyle = 'rgba(255,255,255,0.05)';
      round(g, 250, y, 600, 90, 16);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 26, 800);
      g.fillText(s.t, 272, y + 40);
      g.fillStyle = 'rgba(255,255,255,0.6)';
      font(g, 17, 500);
      g.fillText(s.n, 272, y + 68);
      spark(g, 470, y + 18, 150, 54, s.up, i * 2);
      g.fillStyle = s.up ? '#2fd18b' : '#ff5a6e';
      font(g, 22, 800);
      g.fillText(s.v, 640, y + 52);
      g.fillStyle = 'rgba(47,209,139,0.16)';
      round(g, 720, y + 28, 118, 34, 17);
      g.fill();
      g.fillStyle = '#9ff0cb';
      font(g, 14, 700);
      g.fillText(s.stage, 732, y + 50);
    });
    // Pending
    g.fillStyle = '#151d29';
    round(g, 890, 90, 360, 190, 22);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    font(g, 20, 700);
    g.fillText('PENDING ORDERS', 914, 128);
    [['Buy ORBT', '3 shares · waiting'], ['Sell LUMA', 'in sell window']].forEach(([a, b], i) => {
      g.fillStyle = '#fff';
      font(g, 22, 700);
      g.fillText(a!, 914, 172 + i * 54);
      g.fillStyle = 'rgba(255,255,255,0.55)';
      font(g, 16, 500);
      g.fillText(b!, 914, 194 + i * 54);
    });
    // Top performers
    g.fillStyle = '#151d29';
    round(g, 890, 300, 360, 190, 22);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    font(g, 20, 700);
    g.fillText('TOP PERFORMERS FOR YOU', 914, 338);
    ['NOVA  ▲', 'KITE  ▲', 'ORBT  ▲'].forEach((t, i) => {
      g.fillStyle = '#2fd18b';
      font(g, 22, 800);
      g.fillText(t, 914, 380 + i * 36);
    });
    // AI tip
    const grad = g.createLinearGradient(230, 0, 1250, 0);
    grad.addColorStop(0, 'rgba(155,107,255,0.35)');
    grad.addColorStop(1, 'rgba(47,209,139,0.25)');
    g.fillStyle = grad;
    round(g, 230, 515, 1020, 170, 22);
    g.fill();
    g.fillStyle = '#fff';
    font(g, 22, 800);
    g.fillText('✦ AI ADVISOR', 256, 556);
    font(g, 30, 700);
    g.fillText('ORBT looks steady: finish your buy within 3–5 days.', 256, 604);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    font(g, 18, 500);
    g.fillText('Based on real-world data and algorithms · hypothetical, not financial advice', 256, 646);
  });
}

/** App screen 2: a stock with the AI's advice beside the graph. */
export function appStockTexture() {
  return canvasTexture(1280, 740, (g) => {
    appChrome(g, 1280, 740, 'Stocks');
    g.fillStyle = '#fff';
    font(g, 34, 800);
    g.fillText('NOVA · Nova Labs (sample)', 230, 62);
    g.fillStyle = '#151d29';
    round(g, 230, 90, 680, 600, 22);
    g.fill();
    // Area chart (no candlesticks: the AI does the reading)
    g.beginPath();
    const pts: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const v = Math.sin(i * 0.45) * 40 + Math.sin(i * 0.17) * 30 + i * 6;
      pts.push([260 + (i / 40) * 620, 560 - v]);
    }
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = '#2fd18b';
    g.lineWidth = 5;
    g.stroke();
    g.lineTo(880, 650);
    g.lineTo(260, 650);
    g.closePath();
    const area = g.createLinearGradient(0, 300, 0, 650);
    area.addColorStop(0, 'rgba(47,209,139,0.35)');
    area.addColorStop(1, 'rgba(47,209,139,0)');
    g.fillStyle = area;
    g.fill();
    // Buy / sell markers
    const mark = (i: number, label: string, c: string) => {
      const [x, y] = pts[i]!;
      g.fillStyle = c;
      g.beginPath();
      g.arc(x, y, 12, 0, Math.PI * 2);
      g.fill();
      round(g, x - 50, y - 62, 100, 36, 18);
      g.fill();
      g.fillStyle = '#0d1117';
      font(g, 18, 800);
      g.textAlign = 'center';
      g.fillText(label, x, y - 38);
      g.textAlign = 'left';
    };
    mark(12, 'BUY', '#2fd18b');
    mark(34, 'SELL', '#ffd166');
    g.fillStyle = 'rgba(255,255,255,0.6)';
    font(g, 18, 600);
    g.fillText('Progress graph · last 6 months (sample)', 256, 128);
    // AI panel
    const grad = g.createLinearGradient(930, 90, 1250, 690);
    grad.addColorStop(0, '#2a1f55');
    grad.addColorStop(1, '#10283a');
    g.fillStyle = grad;
    round(g, 930, 90, 320, 600, 22);
    g.fill();
    g.fillStyle = '#c9b8ff';
    font(g, 20, 800);
    g.fillText('✦ AI ADVICE', 956, 132);
    const rows: [string, string][] = [
      ['How much', '12 shares'],
      ['When to buy', 'Next 3–5 days'],
      ['Estimated sell', 'In about 6 weeks'],
      ['Based on', 'Real-world data'],
    ];
    rows.forEach(([k, v], i) => {
      const y = 180 + i * 110;
      g.fillStyle = 'rgba(255,255,255,0.08)';
      round(g, 950, y, 280, 92, 16);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)';
      font(g, 17, 600);
      g.fillText(k, 970, y + 34);
      g.fillStyle = '#fff';
      font(g, 28, 800);
      g.fillText(v, 970, y + 72);
    });
    g.fillStyle = 'rgba(255,255,255,0.55)';
    font(g, 15, 500);
    g.fillText('Hypothetical · not financial advice', 956, 670);
  });
}

/** App screen 3: the AI calculator. */
export function appCalcTexture() {
  return canvasTexture(1280, 740, (g) => {
    appChrome(g, 1280, 740, 'Calculator');
    g.fillStyle = '#fff';
    font(g, 34, 800);
    g.fillText('AI amount and timing calculator', 230, 62);
    const field = (x: number, y: number, k: string, v: string) => {
      g.fillStyle = 'rgba(255,255,255,0.6)';
      font(g, 18, 600);
      g.fillText(k, x, y);
      g.fillStyle = '#151d29';
      round(g, x, y + 14, 460, 70, 16);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 30, 700);
      g.fillText(v, x + 22, y + 60);
    };
    field(230, 130, 'Stock', 'NOVA (sample)');
    field(230, 250, 'Budget', '$500');
    field(230, 370, 'Goal', 'Steady growth');
    g.fillStyle = '#2fd18b';
    round(g, 230, 500, 460, 80, 40);
    g.fill();
    g.fillStyle = '#05261a';
    font(g, 30, 800);
    g.fillText('Calculate with AI', 330, 552);
    const grad = g.createLinearGradient(740, 120, 1250, 690);
    grad.addColorStop(0, '#2a1f55');
    grad.addColorStop(1, '#0f2b22');
    g.fillStyle = grad;
    round(g, 740, 110, 510, 580, 26);
    g.fill();
    g.fillStyle = '#c9b8ff';
    font(g, 20, 800);
    g.fillText('✦ SUGGESTION', 770, 160);
    g.fillStyle = '#fff';
    font(g, 72, 800);
    g.fillText('8 shares', 770, 260);
    font(g, 26, 600);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    wrap(g, 'Buy over the next week, and review a possible sell in about two months.', 770, 320, 450, 36, 3);
    g.fillStyle = 'rgba(255,255,255,0.1)';
    round(g, 770, 450, 450, 150, 18);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    font(g, 18, 600);
    wrap(g, 'Worked out by the AI model from real-world data and algorithms, instead of reading candlesticks and equations yourself.', 790, 490, 410, 28, 4);
    g.fillStyle = 'rgba(255,255,255,0.5)';
    font(g, 15, 500);
    g.fillText('Hypothetical · not financial advice', 770, 660);
  });
}

/** The garden sign: his goals. */
export function goalsTexture() {
  return canvasTexture(1400, 860, (g) => {
    const grad = g.createLinearGradient(0, 0, 1400, 860);
    grad.addColorStop(0, '#1b2a4a');
    grad.addColorStop(1, '#3a1c3d');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1400, 860);
    g.fillStyle = '#ffd166';
    font(g, 28, 800);
    g.fillText('LOOKING AHEAD', 70, 90);
    g.fillStyle = '#fff';
    font(g, 66, 800);
    g.fillText('His goals', 70, 165);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    font(g, 34, 600);
    wrap(g, `🎓  ${goals.education}`, 70, 260, 1260, 46, 2);
    goals.career.forEach((c, i) => {
      const y = 400 + i * 135;
      g.fillStyle = 'rgba(255,255,255,0.1)';
      round(g, 70, y, 1260, 110, 26);
      g.fill();
      g.fillStyle = '#fff';
      font(g, 36, 700);
      g.fillText(`${['🧠', '🔬', '📈'][i]}  ${c}`, 100, y + 68);
    });
  });
}

/** The living-room screen at the end of the tour. */
export function thanksTexture() {
  return canvasTexture(1600, 900, (g) => {
    const grad = g.createLinearGradient(0, 0, 1600, 900);
    grad.addColorStop(0, '#1a1440');
    grad.addColorStop(0.5, '#3b1d52');
    grad.addColorStop(1, '#0b2a44');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1600, 900);
    for (let i = 0; i < 80; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.12})`;
      g.beginPath();
      g.arc((i * 197) % 1600, (i * 113) % 900, 1.5 + (i % 3), 0, Math.PI * 2);
      g.fill();
    }
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    font(g, 120, 800);
    g.fillText('Thank you for visiting', 800, 400);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    font(g, 54, 500);
    g.fillText('and for your valuable time.', 800, 490);
    g.fillStyle = '#ffd166';
    font(g, 40, 700);
    g.fillText('— Shreyas Ballari', 800, 610);
    g.textAlign = 'left';
  });
}

// --- 3D pieces ----------------------------------------------------------------------------------

/** A simple gallery-style figure (no face), standing or seated. */
function Figure({ position, rotation = 0, seated = false, color = '#d8d2c8' }: { position: [number, number, number]; rotation?: number; seated?: boolean; color?: string }) {
  const mat = useMemo(() => new MeshStandardMaterial({ color, roughness: 0.55 }), [color]);
  const hipY = seated ? 0.5 : 0.92;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Legs */}
      {[-0.09, 0.09].map((x) =>
        seated ? (
          <group key={x}>
            <mesh material={mat} position={[x, hipY, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.32, 4, 10]} />
            </mesh>
            <mesh material={mat} position={[x, hipY / 2, 0.4]} castShadow>
              <capsuleGeometry args={[0.06, hipY - 0.12, 4, 10]} />
            </mesh>
          </group>
        ) : (
          <mesh key={x} material={mat} position={[x, hipY / 2, 0]} castShadow>
            <capsuleGeometry args={[0.07, hipY - 0.14, 4, 10]} />
          </mesh>
        ),
      )}
      {/* Body, arms, head */}
      <mesh material={mat} position={[0, hipY + 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.36, 6, 14]} />
      </mesh>
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} material={mat} position={[x, hipY + 0.28, seated ? 0.12 : 0]} rotation={[seated ? -0.9 : 0, 0, x > 0 ? 0.12 : -0.12]} castShadow>
          <capsuleGeometry args={[0.05, 0.42, 4, 10]} />
        </mesh>
      ))}
      <mesh material={mat} position={[0, hipY + 0.78, 0]} castShadow>
        <sphereGeometry args={[0.12, 20, 16]} />
      </mesh>
    </group>
  );
}

/** The community room (where the kitchen was): tutoring and volunteering. */
export function CommunityRoom() {
  const m = useMats();
  const tex = useMemo(() => ({ board: tutoringTexture(), vol: [0, 1, 2].map(volunteerTexture) }), []);
  const KX0 = -5.02;
  const X1 = 3.1;
  const Z0 = -14;
  const Z1 = -9.1;
  const T = { x: -1.6, z: -11.6 };
  return (
    <group>
      <Slab p={[(KX0 + X1) / 2, -0.05, (Z0 + Z1) / 2]} s={[X1 - KX0, 0.1, Z1 - Z0 + 0.1]} m={m.oak} tile={2.4} cast={false} />
      {/* Whiteboard: how he tutors */}
      <Framed position={[-2.2, 1.6, Z0 + 0.02]} w={3.1} h={1.67} tex={tex.board} frame="#d9dadb" mat={0.02} glow={0.12} />
      <B p={[-2.2, 0.74, Z0 + 0.09]} s={[3.1, 0.04, 0.12]} m={m.white} cast={false} />
      {/* Volunteering wall */}
      {tex.vol.map((t, i) => (
        <Framed key={i} position={[0.55 + i * 0.95, 1.62, Z0 + 0.02]} w={0.78} h={1.02} tex={t} frame="#1a1a1a" mat={0.03} glow={0.15} />
      ))}
      {/* Study table with students, books and a tutor at the board */}
      <Rug position={[T.x, T.z]} w={3.4} d={2.4} color="#c9c1b4" stripe="#8a7f70" />
      <B p={[T.x, 0.74, T.z]} s={[2.2, 0.05, 1.0]} m={m.walnut} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <B key={`${sx}${sz}`} p={[T.x + sx * 1.0, 0.36, T.z + sz * 0.42]} s={[0.05, 0.72, 0.05]} m={m.black} />))}
      <Model id="dining_chair_02" position={[T.x - 0.6, 0, T.z - 0.62]} />
      <Model id="dining_chair_02" position={[T.x + 0.6, 0, T.z - 0.62]} />
      <Model id="dining_chair_02" position={[T.x - 0.6, 0, T.z + 0.62]} rotation={Math.PI} />
      <Model id="dining_chair_02" position={[T.x + 0.6, 0, T.z + 0.62]} rotation={Math.PI} />
      <Figure position={[T.x - 0.6, 0, T.z - 0.78]} seated color="#cfd8e6" />
      <Figure position={[T.x + 0.6, 0, T.z - 0.78]} seated color="#e6d6cf" />
      <Figure position={[T.x + 0.6, 0, T.z + 0.78]} rotation={Math.PI} seated color="#d6e6cf" />
      <Figure position={[-0.35, 0, Z0 + 0.75]} rotation={-0.5} color="#e8e2d6" />
      {[[-2.0, -0.05], [-1.2, 0.1], [-1.75, 0.22], [-0.9, -0.2]].map(([x, z], i) => (
        <B key={i} p={[x!, 0.785, T.z + z!]} s={[0.26, 0.03, 0.2]} m={i % 2 ? m.white : m.walnut} cast={false} />
      ))}
      <Pendant position={[T.x, 3.2, T.z]} drop={1.15} />
    </group>
  );
}

/** Activity posters on the music room's slat screen (facing into the room). */
export function ActivityPosters() {
  const list = ['Swim Atlanta', 'Muay Thai', 'Science Olympiad', 'DECA'];
  const tex = useMemo(() => list.map(activityTexture), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {tex.map((t, i) => (
        <Framed key={i} position={[3.19, 1.62, -13.15 + i * 0.98]} rotation={Math.PI / 2} w={0.76} h={1.02} tex={t} frame="#151517" mat={0.03} glow={0.15} />
      ))}
    </group>
  );
}

/** Is the camera in (or heading to) a given room right now? */
function inRoom(station: string) {
  const s = spatial.get();
  return s.tour && TOUR[s.tourIndex]?.station === station;
}

/** R&D lab: Oncure and the trading app boards, app screens, and his video on the wall screen. */
export function LabStory() {
  const tex = useMemo(() => ({ onc: oncureBoardTexture(), trade: tradingBoardTexture() }), []);
  const video = useRef<HTMLVideoElement | null>(null);
  const screen = useRef<Mesh>(null);
  const mat = useMemo(() => new MeshBasicMaterial({ color: '#ffffff', toneMapped: false, side: DoubleSide }), []);
  // The video is only loaded and played while you are in the lab.
  useFrame(() => {
    const here = inRoom('lab');
    if (here && !video.current) {
      const v = document.createElement('video');
      v.src = oncure.video;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.crossOrigin = 'anonymous';
      video.current = v;
      const t = new VideoTexture(v);
      t.colorSpace = SRGBColorSpace;
      mat.map = t;
      mat.needsUpdate = true;
    }
    const v = video.current;
    if (!v) return;
    if (here && v.paused) void v.play().catch(() => {});
    if (!here && !v.paused) v.pause();
    if (screen.current) screen.current.visible = here || !v.paused;
  });
  useEffect(
    () => () => {
      video.current?.pause();
      video.current?.removeAttribute('src');
      video.current?.load();
    },
    [],
  );
  const Z0 = -8.9;
  return (
    <group>
      {/* His video on the big wall screen */}
      <mesh ref={screen} position={[-10.1, 1.95, Z0 + 0.062]} scale={[1.8, 1.0, 1]} material={mat} visible={false}>
        <planeGeometry />
      </mesh>
      <Framed position={[-12.05, 1.95, Z0 + 0.02]} w={1.3} h={0.93} tex={tex.onc} frame="#151517" mat={0.02} glow={0.35} />
      <Framed position={[-8.2, 1.95, Z0 + 0.02]} w={1.3} h={0.93} tex={tex.trade} frame="#151517" mat={0.02} glow={0.35} />
    </group>
  );
}

/** Gallery: the scores chart between the PSAT and MAP certificates. */
export function GalleryScores() {
  const tex = useMemo(scoresTexture, []);
  return <Framed position={[-10.15, 1.65, -13.98]} w={0.95} h={0.74} tex={tex} frame="#c8a46a" mat={0.03} glow={0.3} />;
}

/** Garden: a sign with his goals. */
export function GoalsSign() {
  const tex = useMemo(goalsTexture, []);
  const m = useMats();
  return (
    <group position={[6.7, 0, -5.4]} rotation={[0, 1.15, 0]}>
      <B p={[-0.85, 0.75, -0.03]} s={[0.07, 1.5, 0.07]} m={m.walnut} />
      <B p={[0.85, 0.75, -0.03]} s={[0.07, 1.5, 0.07]} m={m.walnut} />
      <Framed position={[0, 1.45, 0]} w={1.8} h={1.1} tex={tex} frame="#2a1f17" mat={0.02} glow={0.4} />
    </group>
  );
}

/** Living room: the projector shows a thank-you at the end of the tour. */
export function ThanksScreen() {
  const tex = useMemo(thanksTexture, []);
  const mat = useMemo(() => new MeshBasicMaterial({ map: tex, toneMapped: false }), [tex]);
  const ref = useRef<Group>(null);
  useFrame(() => {
    const s = spatial.get();
    if (ref.current) ref.current.visible = s.tour && TOUR[s.tourIndex]?.station === 'sofa';
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[SCREEN.x + 0.04, SCREEN.y, SCREEN.z]} rotation={[0, Math.PI / 2, 0]} scale={[SCREEN.w, SCREEN.h, 1]} material={mat}>
        <planeGeometry />
      </mesh>
    </group>
  );
}
