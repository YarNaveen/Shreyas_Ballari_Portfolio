import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './arc.css';

/**
 * Opening screen: a charge builds across an arc between two contacts.
 *  - At rest a dim 4 % sits over a faint red thread and a 24-tick level scale.
 *  - A spark flares on the left contact; the view pushes in and follows it along the thread as it
 *    ignites, dust streaking past, and pulls back with a flash when it reaches the right contact.
 *  - The number counts to 100 while the arc changes with the level: a thin amber filament, a
 *    jittering blue arc with side filaments, then a wild violet-white arc throwing sparks.
 *  - At 100 % it settles into a calm mint-white beam with a wide flare, and the screen fades into
 *    the portfolio. One WebGL shader draws the arc; the number and ticks are plain HTML.
 */

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uLevel, uIgn, uFlash, uBeam, uZoom, uCx;
float h(float n){ return fract(sin(n) * 43758.5453); }
float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h(i), h(i + 1.0), f) * 2.0 - 1.0; }
float fbm(float x){ return n1(x) * 0.55 + n1(x * 2.1 + 3.0) * 0.28 + n1(x * 4.3 + 7.0) * 0.17; }
vec3 levelColour(float l){
  vec3 amber = vec3(1.0, 0.55, 0.18), blue = vec3(0.35, 0.55, 1.0), violet = vec3(0.78, 0.55, 1.0), mint = vec3(0.7, 1.0, 0.88);
  vec3 c = mix(amber, blue, smoothstep(0.15, 0.45, l));
  c = mix(c, violet, smoothstep(0.55, 0.85, l));
  return mix(c, mint, uBeam);
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  p = p / uZoom + vec2(uCx, 0.0);
  float y = p.y + 0.06;
  const float L = 0.62;
  float t = uTime;
  float inside = step(abs(p.x), L);
  float head = mix(-L, L, uIgn);
  float lit = inside * step(p.x, head);
  float taper = smoothstep(L, L - 0.1, abs(p.x));
  float amp = mix(0.006, 0.075, uLevel) * (1.0 - uBeam);
  float speed = mix(2.0, 14.0, uLevel);
  float d0 = fbm(p.x * mix(6.0, 14.0, uLevel) + t * speed) * amp * taper;
  float w = mix(0.0025, 0.0042, uLevel) + uBeam * 0.004;
  float core = w / (abs(y - d0) + w * 0.5);
  float fil = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float d = fbm(p.x * 18.0 + t * (9.0 + fi * 3.0) + fi * 13.0) * amp * 1.7 * taper;
    fil += 0.0012 / (abs(y - d) + 0.002);
  }
  fil *= smoothstep(0.3, 0.6, uLevel) * (1.0 - uBeam);
  vec3 col = levelColour(uLevel);
  vec3 c = vec3(1.0, 0.16, 0.1) * inside * 0.0015 / (abs(y) + 0.0015) * 0.28 * (1.0 - uIgn * 0.8);
  c += col * (core * 0.35 + fil * 0.12) * lit;
  c += vec3(1.0) * pow(min(core * lit, 6.0) / 6.0, 3.0) * 0.6;
  float chase = step(0.001, uIgn) * step(uIgn, 0.999);
  c += vec3(1.0, 0.8, 0.5) * chase * 0.012 / (length(vec2(p.x - head, y)) + 0.004) * 0.6;
  for (int s = 0; s < 2; s++) {
    float cx = s == 0 ? -L : L;
    float cd = length(vec2(p.x - cx, y));
    c += vec3(0.9, 0.85, 1.0) * 0.004 / (cd + 0.004) * (0.35 + 0.65 * uLevel);
    c += vec3(0.55, 0.55, 0.65) * smoothstep(0.013, 0.009, cd) * 0.5;
  }
  float sparks = smoothstep(0.75, 0.98, uLevel) * (1.0 - uBeam);
  for (int k = 0; k < 16; k++) {
    float fk = float(k);
    float life = fract(t * 1.3 + h(fk) * 7.0);
    vec2 o = vec2(h(fk * 3.1) * 1.2 - 0.6, -0.06) + vec2((h(fk * 5.7) - 0.5) * 0.3, (h(fk * 2.3) - 0.5) * 0.25) * life;
    c += col * 0.0015 / (length(p - o) + 0.0015) * (1.0 - life) * sparks;
  }
  c += mix(col, vec3(1.0), 0.4) * uBeam * exp(-abs(y) * 40.0) * exp(-abs(p.x) * 1.2) * 0.6;
  c += col * uBeam * 0.002 / (abs(y) + 0.002) * 0.15 * exp(-abs(p.x) * 0.3);
  c += vec3(1.0) * uFlash * 0.04 / (length(vec2(p.x - L, y)) + 0.02);
  for (int k = 0; k < 20; k++) {
    float fk = float(k);
    vec2 dp = vec2(fract(h(fk) * 9.0 + t * 1.5) * 1.6 - 0.8, (h(fk * 7.0) - 0.5) * 0.4);
    float dd = abs(p.y - dp.y) * 80.0 + abs(p.x - dp.x) * 6.0;
    c += vec3(0.8, 0.75, 0.7) * 0.02 / (dd + 0.2) * 0.4 * chase;
  }
  c += col * 0.05 * exp(-length(p) * 2.0) * uLevel;
  c = 1.0 - exp(-c);
  gl_FragColor = vec4(c, 1.0);
}`;

// Timing (seconds).
const T = { ignite: 0.6, ignited: 1.7, flash: 1.95, count: 2.05, full: 4.5, beam: 4.95, out: 5.5, end: 6.1 };
const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const ease = (x: number) => x * x * (3 - 2 * x);

function colourAt(level: number, beam: number) {
  const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i]! - v) * k);
  const sm = (a: number, b: number, x: number) => ease(seg(x, a, b));
  let c = mix([255, 140, 46], [90, 140, 255], sm(0.15, 0.45, level));
  c = mix(c, [200, 140, 255], sm(0.55, 0.85, level));
  c = mix(c, [180, 255, 224], beam);
  return `rgb(${c.map((v) => Math.round(v)).join(',')})`;
}

export function ArcIntro() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const ticks = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const skip = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true);
      return;
    }
    // The intro always opens onto the top of the page (the hero).
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    const cv = canvas.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false });
    let raf = 0;
    let ended = false;
    // Always gives the page its scrolling back (never restores an old lock from another page).
    const finish = () => {
      if (ended) return;
      ended = true;
      html.style.overflow = '';
      window.scrollTo(0, 0);
      setDone(true);
    };
    // Phones can pause animation frames (low power, a background tab): never leave the page locked.
    const safety = window.setTimeout(finish, (T.end + 2) * 1000);
    if (!gl) {
      finish();
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      finish();
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { res: U('uRes'), time: U('uTime'), level: U('uLevel'), ign: U('uIgn'), flash: U('uFlash'), beam: U('uBeam'), zoom: U('uZoom'), cx: U('uCx') };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const tickEls = [...(ticks.current?.children ?? [])] as HTMLElement[];
    const start = performance.now();
    const frame = () => {
      let t = (performance.now() - start) / 1000;
      if (skip.current && t < T.out) t = T.out;
      const ign = ease(seg(t, T.ignite, T.ignited));
      const flash = t > T.ignited ? Math.max(0, 1 - (t - T.ignited) / 0.35) : 0;
      // Push in and follow the spark, then pull back after the flash.
      const push = Math.min(ease(seg(t, T.ignite - 0.2, T.ignite + 0.3)), 1 - ease(seg(t, T.ignited, T.flash + 0.15)));
      const head = -0.62 + 1.24 * ign;
      const zoom = 1 + push * 1.3;
      const cx = push * head * 0.85;
      const lvl = t < T.count ? 0.04 : 0.04 + 0.96 * ease(seg(t, T.count, T.full));
      const beam = ease(seg(t, T.full, T.beam));
      gl.uniform2f(u.res, cv.width, cv.height);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.level, lvl);
      gl.uniform1f(u.ign, t < T.ignite ? 0 : ign);
      gl.uniform1f(u.flash, flash);
      gl.uniform1f(u.beam, beam);
      gl.uniform1f(u.zoom, zoom);
      gl.uniform1f(u.cx, cx);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const col = colourAt(lvl, beam);
      if (num.current) {
        num.current.textContent = String(Math.round(lvl * 100));
        num.current.style.opacity = String(t < T.count ? 0.35 : 1);
        num.current.style.textShadow = `0 0 30px ${col}`;
      }
      const filled = Math.round(lvl * 24);
      tickEls.forEach((el, i) => {
        el.style.background = i < filled && t >= T.count ? col : '';
      });
      if (root.current) root.current.style.opacity = String(1 - seg(t, T.out, T.end));
      if (t >= T.end) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      window.removeEventListener('resize', resize);
      html.style.overflow = '';
    };
  }, []);

  if (done || typeof document === 'undefined') return null;
  // Rendered into <body> so it sits above everything, the site tabs included.
  return createPortal(
    <div ref={root} className="arc" role="status" aria-label="Loading the portfolio">
      <canvas ref={canvas} className="arc-canvas" aria-hidden="true" />
      <p className="arc-num">
        <span ref={num}>4</span>
        <sup>%</sup>
      </p>
      <div ref={ticks} className="arc-ticks" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <button type="button" className="arc-skip" onClick={() => (skip.current = true)}>
        Skip intro
      </button>
    </div>,
    document.body,
  );
}
