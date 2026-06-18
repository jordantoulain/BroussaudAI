"use client"

// ── Animations de base injectées nativement dans le composant ─────────────────
const BASE_STYLES = `
  @keyframes dm-fade-o   { 0%{opacity:.12} 50%{opacity:1} 100%{opacity:.12} }
  
  @keyframes dm-pulse-t  { 0%{transform:scale(.5)} 50%{transform:scale(1)} 100%{transform:scale(.5)} }
  @keyframes dm-pulse-o  { 0%{opacity:.15} 50%{opacity:1} 100%{opacity:.15} }

  @keyframes dm-blink-o  { 0%,49%{opacity:.12} 50%,100%{opacity:1} }

  @keyframes dm-bounce-t { 0%{transform:translateY(0)} 50%{transform:translateY(-70%)} 100%{transform:translateY(0)} }
  @keyframes dm-bounce-o { 0%{opacity:.2} 50%{opacity:1} 100%{opacity:.2} }

  @keyframes dm-spin-t   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes dm-spin-o   { 0%{opacity:1} 100%{opacity:.12} }
`;

// ── Geometry helpers ──────────────────────────────────────────────────────────
const sizeToPixels = (size) => size * 4;

const grid = (rows, cols, fn) =>
  Array.from({ length: rows * cols }, (_, i) => fn(Math.floor(i / cols), i % cols, i));

const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 5;
const BASE = 80;

function spiralOrder(rows, cols) {
  const total = rows * cols;
  const order = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  while (order.length < total) {
    for (let c = left; c <= right && order.length < total; c++) order.push(top * cols + c);
    top++;
    for (let r = top; r <= bottom && order.length < total; r++) order.push(r * cols + right);
    right--;
    for (let c = right; c >= left && order.length < total; c--) order.push(bottom * cols + c);
    bottom--;
    for (let r = bottom; r >= top && order.length < total; r--) order.push(r * cols + left);
    left++;
  }
  return order;
}

// ── Pattern generators ────────────────────────────────────────────────────────
export function generatePatterns(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  const total = rows * cols;
  const cr = (rows - 1) / 2;
  const cc = (cols - 1) / 2;
  const g = (fn) => grid(rows, cols, fn);
  const order = spiralOrder(rows, cols);

  const delayPatterns = {
    "row-sweep": g((r) => r * BASE * 2),
    "col-sweep": g((r, c) => c * BASE * 2),
    "diagonal": g((r, c) => (r + c) * BASE),
    "ring-pulse": g((r, c) => Math.max(Math.abs(r - cr), Math.abs(c - cc)) * BASE * 2),
    "spiral": (() => {
      const delays = Array(total).fill(0);
      order.forEach((idx, step) => { delays[idx] = step * BASE; });
      return delays;
    })(),
    "snake": g((r, c) => { const col = r % 2 === 0 ? c : cols - 1 - c; return (r * cols + col) * BASE; }),
    "checker": g((r, c) => ((r + c) % 2 === 0 ? 0 : BASE * 3)),
    "scatter": (() => {
      const delays = Array.from({ length: total }, (_, i) => i * BASE);
      for (let i = delays.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [delays[i], delays[j]] = [delays[j], delays[i]];
      }
      return delays;
    })(),
    "heartbeat": g((r, c) => Math.round(Math.sqrt((r - cr) ** 2 + (c - cc) ** 2) * BASE * 1.5)),
    "sound-bars": g((r, c) => {
      const wave = [0, 1, 2, 1, 0];
      const t = cols > 1 ? (c / (cols - 1)) * (wave.length - 1) : 0;
      return r * BASE + wave[Math.round(t)] * BASE;
    }),
    "corner-bounce": (() => {
      const rMid = Math.round(cr), cMid = Math.round(cc);
      const pts = [
        [0, 0], [0, cols - 1], [rows - 1, 0], [rows - 1, cols - 1],
        [0, cMid], [rMid, 0], [rMid, cols - 1], [rows - 1, cMid], [rMid, cMid],
      ];
      const seen = new Set();
      const order2 = [];
      pts.forEach(([r, c]) => {
        const idx = r * cols + c;
        if (!seen.has(idx)) { seen.add(idx); order2.push(idx); }
      });
      const delays = Array(total).fill(null);
      order2.forEach((idx, i) => { delays[idx] = i * BASE * 1.5; });
      return delays;
    })(),
    "radar": g((r, c) => {
      const angle = Math.atan2(c - cc, -(r - cr));
      return Math.round(((angle + Math.PI) / (2 * Math.PI)) * BASE * 12);
    }),
    "twin-orbit": (() => {
      const delays = Array(total).fill(null);
      const half = Math.ceil(order.length / 2);
      const path1 = order.slice(0, half);
      const path2 = order.slice(half).reverse();
      path1.forEach((idx, s) => { delays[idx] = s * BASE; });
      path2.forEach((idx, s) => { if (delays[idx] === null) delays[idx] = s * BASE; });
      return delays;
    })(),
    "oblique": g((r, c) => (r - c + cols - 1) * BASE),
    "tri-up": g((r, c) => (r >= rows - 1 - c && r >= c) ? (rows - 1 - r) * BASE * 2 : null),
    "tri-down": g((r, c) => (r <= c && r <= rows - 1 - c) ? r * BASE * 2 : null),
    "tri-left": g((r, c) => (c <= r && c <= rows - 1 - r) ? (cols - 1 - c) * BASE * 2 : null),
    "tri-right": g((r, c) => (c >= r && c >= rows - 1 - r) ? c * BASE * 2 : null),
    "tri-fill-up": g((r, c) => c <= r ? (rows - 1 - r) * BASE * 2 : null),
    "tri-fill-down": g((r, c) => c >= r ? r * BASE * 2 : null),
    "tri-wave-up": g((r, c) => Math.abs(c - cc) <= r ? r * BASE * 2 : null),
    "tri-wave-down": g((r, c) => { const inv = rows - 1 - r; return Math.abs(c - cc) <= inv ? inv * BASE * 2 : null; }),
    "hourglass": g((r, c) => {
      const inTop = Math.abs(c - cc) <= r;
      const inBottom = Math.abs(c - cc) <= (rows - 1 - r);
      if (!inTop || !inBottom) return null;
      return Math.round(Math.abs(r - cr) * BASE * 2.5);
    }),
    "custom": Array(total).fill(0),
  };

  const coloredPatterns = {
    "aurora": { delays: g((r, c) => (r + c) * BASE), colors: g((r, c) => { const span = (rows + cols - 2) || 1; const t = (r + c) / span; const stops = ["rgb(168, 85, 247)", "rgb(99, 102, 241)", "rgb(34, 211, 238)", "rgb(52, 211, 153)"]; return stops[Math.min(Math.floor(t * (stops.length - 1)), stops.length - 2)]; }), },
    "ember": { delays: g((r, c) => Math.max(Math.abs(r - cr), Math.abs(c - cc)) * BASE * 2), colors: g((r, c) => { const dist = Math.round(Math.max(Math.abs(r - cr), Math.abs(c - cc))); const stops = ["rgb(253, 224, 71)", "rgb(251, 146, 60)", "rgb(249, 115, 22)", "rgb(239, 68, 68)", "rgb(185, 28, 28)"]; return stops[Math.min(dist, stops.length - 1)]; }), },
    "neon-check": { delays: g((r, c) => ((r + c) % 2 === 0 ? 0 : BASE * 3)), colors: g((r, c) => (r + c) % 2 === 0 ? "rgb(240, 171, 252)" : "rgb(103, 232, 249)"), },
    "sunrise": { delays: g((r) => r * BASE * 2), colors: g((r) => { const stops = ["rgb(251, 191, 36)", "rgb(249, 115, 22)", "rgb(239, 68, 68)", "rgb(236, 72, 153)", "rgb(168, 85, 247)"]; const idx = rows > 1 ? Math.round((r / (rows - 1)) * (stops.length - 1)) : 0; return stops[idx]; }), },
    "ocean": { delays: g((r, c) => c * BASE * 2), colors: g((r, c) => { const stops = ["rgb(191, 219, 254)", "rgb(96, 165, 250)", "rgb(59, 130, 246)", "rgb(29, 78, 216)", "rgb(30, 58, 138)"]; const idx = cols > 1 ? Math.round((c / (cols - 1)) * (stops.length - 1)) : 0; return stops[idx]; }), },
    "matrix": { delays: g((r, c) => { const col = r % 2 === 0 ? c : cols - 1 - c; return (r * cols + col) * BASE; }), colors: g((r, c) => { const greens = ["rgb(187, 247, 208)", "rgb(74, 222, 128)", "rgb(34, 197, 94)", "rgb(22, 163, 74)", "rgb(20, 83, 45)"]; return greens[(r * 3 + c * 2) % greens.length]; }), },
    "candy": { delays: (() => { const delays = Array(total).fill(0); order.forEach((idx, step) => { delays[idx] = step * BASE; }); return delays; })(), colors: (() => { const hues = [0, 30, 60, 120, 180, 210, 270, 300, 330]; return Array.from({ length: total }, (_, i) => `hsl(${hues[i % hues.length]}, 90%, 65%)`); })(), },
    "ice": { delays: g((r, c) => { const angle = Math.atan2(c - cc, -(r - cr)); return Math.round(((angle + Math.PI) / (2 * Math.PI)) * BASE * 12); }), colors: g((r, c) => { const angle = Math.atan2(c - cc, -(r - cr)); const norm = (angle + Math.PI) / (2 * Math.PI); const stops = ["rgb(224, 242, 254)", "rgb(186, 230, 253)", "rgb(125, 211, 252)", "rgb(56, 189, 248)", "rgb(14, 165, 233)"]; return stops[Math.min(Math.floor(norm * stops.length), stops.length - 1)]; }), },
  };

  return { delayPatterns, coloredPatterns, all: { ...delayPatterns, ...coloredPatterns } };
}

export function generateStaticPatterns(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  const g = (fn) => grid(rows, cols, fn);
  const out = {};

  if (rows === 5 && cols === 5) {
    out["smiley"] = (() => { const Y = "rgb(253, 224, 71)", _ = null; return [_, Y, Y, Y, _, Y, _, Y, _, Y, Y, _, _, _, Y, Y, Y, _, Y, Y, _, Y, Y, Y, _]; })();
    out["heart"] = (() => { const R = "rgb(244, 63, 94)", P = "rgb(253, 164, 175)", _ = null; return [_, R, _, R, _, R, P, R, P, R, R, P, P, P, R, _, R, P, R, _, _, _, R, _, _]; })();
  }

  out["rainbow"] = g((r) => { const stops = ["rgb(239, 68, 68)", "rgb(249, 115, 22)", "rgb(253, 224, 71)", "rgb(74, 222, 128)", "rgb(96, 165, 250)"]; const idx = rows > 1 ? Math.round((r / (rows - 1)) * (stops.length - 1)) : 0; return stops[idx]; });
  out["gradient-diagonal"] = g((r, c) => { const stops = ["rgb(168, 85, 247)", "rgb(192, 38, 211)", "rgb(236, 72, 153)", "rgb(244, 63, 94)", "rgb(249, 115, 22)"]; return stops[Math.min(r + c, stops.length - 1)]; });
  out["chess"] = g((r, c) => (r + c) % 2 === 0 ? "rgb(30, 41, 59)" : "rgb(248, 250, 252)");

  return out;
}

export const PATTERNS = generatePatterns(DEFAULT_ROWS, DEFAULT_COLS).all;
export const STATIC_PATTERNS = generateStaticPatterns(DEFAULT_ROWS, DEFAULT_COLS);

export const ANIMATIONS = {
  fade:   { opacityKf: "dm-fade-o",   transformKf: null,          transformType: null,     duration: 1200 },
  pulse:  { opacityKf: "dm-pulse-o",  transformKf: "dm-pulse-t",  transformType: "pulse",  duration: 1000 },
  blink:  { opacityKf: "dm-blink-o",  transformKf: null,          transformType: null,     duration: 800  },
  bounce: { opacityKf: "dm-bounce-o", transformKf: "dm-bounce-t", transformType: "bounce", duration: 900  },
  spin:   { opacityKf: "dm-fade-o",   transformKf: "dm-spin-t",   transformType: "spin",   duration: 1400 },
};

// ── Générateurs de CSS Pures (sans accès au DOM) ─────────────────────────────

function getOpacityKeyframe(r, o, f, off, isBlink) {
  const total = r + o + f + off;
  const pRise = ((r           / total) * 100).toFixed(2);
  const pOn   = (((r + o)     / total) * 100).toFixed(2);
  const pFall = (((r + o + f) / total) * 100).toFixed(2);
  const name  = `dm-c-${isBlink ? 'b' : 'f'}-${r}-${o}-${f}-${off}`;

  let css;
  if (isBlink) {
    css = `@keyframes ${name} {
      0%, ${pRise}% { opacity:.12 }
      ${(parseFloat(pRise) + 0.01).toFixed(2)}%, ${pOn}% { opacity:1 }
      ${(parseFloat(pOn) + 0.01).toFixed(2)}%, 100% { opacity:.12 }
    }`;
  } else {
    css = `@keyframes ${name} {
      0%        { opacity:.12 }
      ${pRise}% { opacity:1   }
      ${pOn}%   { opacity:1   }
      ${pFall}% { opacity:.12 }
      100%      { opacity:.12 }
    }`;
  }
  return { name, css };
}

function getTransformKeyframe(r, o, f, off, type) {
  const total = r + o + f + off;
  const pRise = ((r           / total) * 100).toFixed(2);
  const pOn   = (((r + o)     / total) * 100).toFixed(2);
  const pFall = (((r + o + f) / total) * 100).toFixed(2);
  const name  = `dm-t-${type}-${r}-${o}-${f}-${off}`;

  if (type === "spin") {
    return {
      name,
      css: `@keyframes ${name} { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }`
    };
  }

  let baseT, peakT;
  if (type === "pulse") {
    baseT = "scale(.5)";
    peakT = "scale(1)";
  } else if (type === "bounce") {
    baseT = "translateY(0)";
    peakT = "translateY(-70%)";
  } else {
    return null;
  }

  const css = `@keyframes ${name} {
    0%        { transform:${baseT} }
    ${pRise}% { transform:${peakT} }
    ${pOn}%   { transform:${peakT} }
    ${pFall}% { transform:${baseT} }
    100%      { transform:${baseT} }
  }`;
  return { name, css };
}

function makeAnimStr({ opacityKf, transformKf, transformType, dur, delay, easing, loop, customR, customO, customF, customOff, safeSpeed, isBlink, dynamicStyles }) {
  const loopStr = loop ? "infinite" : "1";
  const delayMs = delay / safeSpeed;

  if (customR === null) {
    const parts = [`${opacityKf} ${dur}ms ${easing} ${delayMs}ms ${loopStr} both`];
    if (transformKf) parts.push(`${transformKf} ${dur}ms ${easing} ${delayMs}ms ${loopStr} both`);
    return parts.join(", ");
  }

  const cycleDur = (customR + customO + customF + customOff) / safeSpeed;
  
  // Génère la clé d'opacité et l'enregistre dans le dictionnaire pour le style tag
  const opKf = getOpacityKeyframe(customR, customO, customF, customOff, isBlink);
  dynamicStyles.set(opKf.name, opKf.css);
  
  const parts = [`${opKf.name} ${cycleDur}ms ${easing} ${delayMs}ms ${loopStr} both`];

  // Fait pareil pour la transformation
  if (transformType) {
    const trKf = getTransformKeyframe(customR, customO, customF, customOff, transformType);
    if (trKf) {
      dynamicStyles.set(trKf.name, trKf.css);
      parts.push(`${trKf.name} ${cycleDur}ms ${easing} ${delayMs}ms ${loopStr} both`);
    }
  } else if (transformKf) {
    parts.push(`${transformKf} ${cycleDur}ms ${easing} ${delayMs}ms ${loopStr} both`);
  }

  return parts.join(", ");
}

/**
 * DotMatrixLoader — unified component
 */
export function DotMatrixLoader({
  size,
  dotSize: dotSizeProp = 8,
  gap = 6,
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
  shape = "circle",
  staticColors,
  mixedDots,
  pattern,
  animation = "fade",
  duration,
  speed = 1,
  color = "currentColor",
  easing = "ease-in-out",
  loop = true,
  riseMs,
  onMs,
  fallMs,
  offMs,
}) {
  const dotSize = size !== undefined ? sizeToPixels(size) : dotSizeProp;
  const dotPx = Math.round(dotSize);
  const gapPx = Math.round(gap);
  const totalDots = rows * cols;
  const borderRadius = shape === "square" ? "0px" : "50%";
  const safeSpeed = speed > 0 ? speed : 1;

  const anim = ANIMATIONS[animation] ?? ANIMATIONS.fade;
  const baseDuration = (duration ?? anim.duration) / safeSpeed;
  const isBlink = animation === "blink";

  const hasGlobalCustomTiming = riseMs !== undefined || onMs !== undefined || fallMs !== undefined || offMs !== undefined;

  const globalR   = hasGlobalCustomTiming ? Math.round(riseMs ?? baseDuration * 0.25) : null;
  const globalO   = hasGlobalCustomTiming ? Math.round(onMs   ?? globalR) : null;
  const globalF   = hasGlobalCustomTiming ? Math.round(fallMs ?? globalR) : null;
  const globalOff = hasGlobalCustomTiming ? Math.round(offMs  ?? 0)       : null;

  // Dictionnaire qui va récolter toutes les définitions CSS nécessaires pendant la génération de la grille
  const dynamicStyles = new Map();

  const animString = (delay) => makeAnimStr({
    opacityKf: anim.opacityKf,
    transformKf: anim.transformKf,
    transformType: anim.transformType,
    dur: baseDuration,
    delay,
    easing,
    loop,
    customR: globalR,
    customO: globalO,
    customF: globalF,
    customOff: globalOff,
    safeSpeed,
    isBlink,
    dynamicStyles,
  });

  const resolvePerDotAnim = (dot, fallbackDelay = 0) => {
    const dRise = dot.riseMs ?? riseMs;
    const dOn   = dot.onMs   ?? onMs;
    const dFall = dot.fallMs ?? fallMs;
    const dOff  = dot.offMs  ?? offMs;
    const hasCustom = dRise !== undefined || dOn !== undefined || dFall !== undefined || dOff !== undefined;

    const delay = dot.delay ?? fallbackDelay;
    if (!hasCustom) return animString(delay);

    const r   = Math.round(dRise ?? baseDuration * 0.25);
    const o   = Math.round(dOn   ?? r);
    const f   = Math.round(dFall ?? r);
    const off = Math.round(dOff  ?? 0);

    return makeAnimStr({
      opacityKf: anim.opacityKf,
      transformKf: anim.transformKf,
      transformType: anim.transformType,
      dur: baseDuration,
      delay,
      easing,
      loop,
      customR: r,
      customO: o,
      customF: f,
      customOff: off,
      safeSpeed,
      isBlink,
      dynamicStyles,
    });
  };

  const containerStyle = {
    display: "inline-grid",
    gridTemplateColumns: `repeat(${cols}, ${dotPx}px)`,
    gap: `${gapPx}px`,
  };

  let dotsContent = null;

  if (staticColors) {
    dotsContent = Array.from({ length: totalDots }, (_, i) => {
      const dotColor = staticColors[i] ?? null;
      if (!dotColor) return <span key={i} style={{ width: dotPx, height: dotPx }} />;
      return (
        <span key={i} style={{ display: "block", width: dotPx, height: dotPx, borderRadius, background: dotColor }} />
      );
    });
  } else if (mixedDots) {
    dotsContent = Array.from({ length: totalDots }, (_, i) => {
      const dot = mixedDots[i] ?? null;
      if (!dot) return <span key={i} style={{ width: dotPx, height: dotPx }} />;
      if (dot.type === "static") {
        return (
          <span key={i} style={{ display: "block", width: dotPx, height: dotPx, borderRadius, background: dot.color ?? color }} />
        );
      }
      return (
        <span key={i} style={{ display: "block", width: dotPx, height: dotPx, borderRadius, background: dot.color ?? color, opacity: 0.12, animation: resolvePerDotAnim(dot), willChange: "opacity, transform" }} />
      );
    });
  } else {
    const effectivePattern = pattern ?? generatePatterns(rows, cols).all["ring-pulse"];
    const isColored = effectivePattern && !Array.isArray(effectivePattern) && effectivePattern.delays;
    const delays = isColored ? effectivePattern.delays : effectivePattern;
    const perDotColors = isColored ? effectivePattern.colors : null;

    dotsContent = Array.from({ length: totalDots }, (_, i) => {
      const delay = delays[i] ?? null;
      if (delay === null) return <span key={i} style={{ width: dotPx, height: dotPx }} />;
      const dotColor = perDotColors?.[i] ?? color;
      return (
        <span key={i} style={{ display: "block", width: dotPx, height: dotPx, borderRadius, background: dotColor, opacity: 0.12, animation: animString(delay), willChange: "opacity, transform" }} />
      );
    });
  }

  // Concatène toutes les frames générées
  const generatedCSS = Array.from(dynamicStyles.values()).join("\n");

  return (
    <div role="status" aria-label="loading" style={containerStyle}>
      {/* Injection inline robuste gérée nativement par React (compatible SSR) */}
      <style>{BASE_STYLES + "\n" + generatedCSS}</style>
      {dotsContent}
    </div>
  );
}