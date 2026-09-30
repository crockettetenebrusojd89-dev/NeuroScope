// Canvas plotting utilities — no external dependencies.

const COLORS = ['#4f8ff7', '#f7a24f', '#3fb96f', '#a371f7', '#e5534b', '#4fc3f7'];
const CLASS_COLORS = ['#4f8ff7', '#f7a24f'];

function setup(canvas, height = 300) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 600;
  canvas.width = w * dpr;
  canvas.height = height * dpr;
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, height);
  return { ctx, w, h: height };
}

const PAD = { l: 46, r: 14, t: 14, b: 30 };

function niceTicks(min, max, n = 5) {
  if (!isFinite(min) || !isFinite(max) || min === max) { min = (min || 0) - 1; max = (max || 1) + 1; }
  const step = (max - min) / n;
  const ticks = [];
  for (let i = 0; i <= n; i++) ticks.push(min + step * i);
  return ticks;
}

export function lineChart(canvas, series, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 280);
  const allX = series.flatMap(s => s.x);
  const allY = series.flatMap(s => s.y).filter(v => isFinite(v));
  let xMin = opts.xMin ?? Math.min(...allX), xMax = opts.xMax ?? Math.max(...allX);
  let yMin = opts.yMin ?? Math.min(...allY), yMax = opts.yMax ?? Math.max(...allY);
  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  const X = v => PAD.l + (v - xMin) / (xMax - xMin) * (w - PAD.l - PAD.r);
  const Y = v => h - PAD.b - (v - yMin) / (yMax - yMin) * (h - PAD.t - PAD.b);

  ctx.strokeStyle = '#2a3140'; ctx.fillStyle = '#8b93a3';
  ctx.font = '10.5px sans-serif'; ctx.lineWidth = 1;
  niceTicks(yMin, yMax).forEach(t => {
    ctx.beginPath(); ctx.moveTo(PAD.l, Y(t)); ctx.lineTo(w - PAD.r, Y(t)); ctx.stroke();
    ctx.fillText(fmt(t), 6, Y(t) + 3);
  });
  niceTicks(xMin, xMax, 6).forEach(t => ctx.fillText(fmt(t), X(t) - 8, h - 10));

  series.forEach((s, i) => {
    ctx.strokeStyle = s.color || COLORS[i % COLORS.length];
    ctx.lineWidth = 2; ctx.beginPath();
    let started = false;
    s.x.forEach((xv, j) => {
      const yv = s.y[j];
      if (!isFinite(yv)) return;
      const px = X(xv), py = Y(yv);
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    });
    ctx.stroke();
    if (s.marker) {
      const j = s.marker;
      ctx.fillStyle = s.color || COLORS[i % COLORS.length];
      ctx.beginPath(); ctx.arc(X(s.x[j]), Y(s.y[j]), 4.5, 0, 7); ctx.fill();
    }
  });

  if (series.some(s => s.label)) {
    ctx.font = '11px sans-serif';
    let lx = PAD.l + 6;
    series.forEach((s, i) => {
      if (!s.label) return;
      ctx.fillStyle = s.color || COLORS[i % COLORS.length];
      ctx.fillRect(lx, 6, 10, 3);
      ctx.fillStyle = '#8b93a3';
      ctx.fillText(s.label, lx + 14, 11);
      lx += 14 + ctx.measureText(s.label).width + 16;
    });
  }
  return { X, Y };
}

function fmt(v) {
  if (Math.abs(v) >= 1000) return v.toExponential(1);
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
  return (+v.toFixed(3)).toString();
}

export function scatter2D(canvas, X, y, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 320);
  const e = opts.extent || autoExtent(X);
  const X2px = v => PAD.l + (v - e[0]) / (e[1] - e[0]) * (w - PAD.l - PAD.r);
  const Y2px = v => h - PAD.b - (v - e[3]) / (e[2] - e[3]) * -1 * (h - PAD.t - PAD.b);
  X.forEach((p, i) => {
    ctx.fillStyle = CLASS_COLORS[y[i] % 2];
    ctx.beginPath(); ctx.arc(X2px(p[0]), Y2px(p[1]), 3.4, 0, 7); ctx.fill();
  });
}

function autoExtent(X, pad = 0.6) {
  const xs = X.map(p => p[0]), ys = X.map(p => p[1]);
  return [Math.min(...xs) - pad, Math.max(...xs) + pad, Math.min(...ys) - pad, Math.max(...ys) + pad];
}

export function boundaryPlot(canvas, grid, extent, X, y, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 380);
  const res = grid.length;
  const cw = w / res, ch = h / res;
  for (let i = 0; i < res; i++) {           // grid[i][j]: row = y index
    for (let j = 0; j < res; j++) {
      const p = Math.max(0, Math.min(1, grid[i][j]));
      ctx.fillStyle = mixColor(p);
      ctx.fillRect(j * cw, h - (i + 1) * ch, cw + 0.5, ch + 0.5);
    }
  }
  if (X && y) {
    const X2px = v => (v - extent[0]) / (extent[1] - extent[0]) * w;
    const Y2px = v => h - (v - extent[2]) / (extent[3] - extent[2]) * h;
    X.forEach((p, i) => {
      ctx.fillStyle = CLASS_COLORS[y[i] % 2];
      ctx.strokeStyle = 'rgba(13,17,23,.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(X2px(p[0]), Y2px(p[1]), 3.2, 0, 7); ctx.fill(); ctx.stroke();
    });
  }
}

function mixColor(p) {
  // blue (class 0) -> orange (class 1), soft background tint
  const c0 = [79, 143, 247], c1 = [247, 162, 79];
  const base = [22, 27, 34];
  const t = p, alpha = 0.16 + 0.35 * Math.abs(p - 0.5) * 2;
  const c = t < 0.5 ? c0 : c1;
  const k = alpha;
  const r = Math.round(base[0] * (1 - k) + c[0] * k);
  const g = Math.round(base[1] * (1 - k) + c[1] * k);
  const b = Math.round(base[2] * (1 - k) + c[2] * k);
  return `rgb(${r},${g},${b})`;
}

export function heatmap(canvas, matrix, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 280);
  const rows = matrix.length, cols = matrix[0].length;
  const cell = Math.min(w / cols, h / rows);
  const ox = (w - cell * cols) / 2, oy = (h - cell * rows) / 2;
  const flat = matrix.flat();
  let vMin = opts.vMin ?? Math.min(...flat), vMax = opts.vMax ?? Math.max(...flat);
  if (vMin === vMax) { vMin -= 1e-9; vMax += 1e-9; }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.fillStyle = valueColor((matrix[i][j] - vMin) / (vMax - vMin), opts.log);
      ctx.fillRect(ox + j * cell, oy + i * cell, cell - 0.5, cell - 0.5);
      if (opts.showValues && cell > 26) {
        ctx.fillStyle = '#e6e9ef'; ctx.font = `${Math.min(11, cell / 3.2)}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(fmt(matrix[i][j]), ox + (j + 0.5) * cell, oy + (i + 0.5) * cell);
      }
    }
  }
  if (opts.highlight) { // [row, col, size]
    const [r, c, k = 1] = opts.highlight;
    ctx.strokeStyle = '#f7a24f'; ctx.lineWidth = 2.5;
    ctx.strokeRect(ox + c * cell, oy + r * cell, cell * k, cell * k);
  }
  return { cell, ox, oy };
}

function valueColor(t, log = false) {
  t = Math.max(0, Math.min(1, t));
  const r = Math.round(30 + t * 220);
  const g = Math.round(60 + t * 120);
  const b = Math.round(90 + (1 - t) * 130);
  return `rgb(${r},${g},${b})`;
}

export function contourPlot(canvas, grid, extent, paths, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 380);
  const res = grid.length;
  const cw = w / res, ch = h / res;
  const flat = grid.flat().filter(isFinite);
  const vMin = Math.min(...flat), vMax = Math.max(...flat);
  const logNorm = v => (Math.log1p(Math.max(0, v - vMin)) / Math.log1p(vMax - vMin || 1));
  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      const v = grid[res - 1 - i][j];
      ctx.fillStyle = valueColor(isFinite(v) ? logNorm(v) : 1);
      ctx.fillRect(j * cw, i * ch, cw + 0.5, ch + 0.5);
    }
  }
  const X2px = v => (v - extent[0]) / (extent[1] - extent[0]) * w;
  const Y2px = v => h - (v - extent[2]) / (extent[3] - extent[2]) * h;
  (paths || []).forEach((p, idx) => {
    const color = p.color || COLORS[idx % COLORS.length];
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    p.points.forEach((pt, i) => {
      const px = X2px(pt[0]), py = Y2px(pt[1]);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();
    const s = p.points[0], e2 = p.points[p.points.length - 1];
    ctx.fillStyle = '#e6e9ef';
    ctx.beginPath(); ctx.arc(X2px(s[0]), Y2px(s[1]), 4, 0, 7); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(X2px(e2[0]), Y2px(e2[1]), 5, 0, 7); ctx.fill();
    if (p.label) { ctx.font = '11px sans-serif'; ctx.fillText(p.label, X2px(e2[0]) + 8, Y2px(e2[1])); }
  });
}

export function barChart(canvas, values, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 220);
  const max = Math.max(...values.map(v => Math.abs(v)), 1e-12);
  const bw = (w - PAD.l - PAD.r) / values.length;
  values.forEach((v, i) => {
    const bh = Math.abs(v) / max * (h - PAD.t - PAD.b - 14);
    ctx.fillStyle = (opts.colors && opts.colors[i]) || COLORS[0];
    ctx.fillRect(PAD.l + i * bw + 3, h - PAD.b - bh, bw - 6, bh);
    ctx.fillStyle = '#8b93a3'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(opts.labels ? opts.labels[i] : i, PAD.l + i * bw + bw / 2, h - 12);
    ctx.textAlign = 'left';
  });
}

export function histChart(canvas, hist, edges, opts = {}) {
  const { ctx, w, h } = setup(canvas, opts.height || 160);
  const max = Math.max(...hist, 1);
  const bw = (w - PAD.l - PAD.r) / hist.length;
  hist.forEach((v, i) => {
    const bh = v / max * (h - PAD.t - PAD.b);
    ctx.fillStyle = opts.color || COLORS[3];
    ctx.fillRect(PAD.l + i * bw + 1, h - PAD.b - bh, bw - 2, bh);
  });
  ctx.fillStyle = '#8b93a3'; ctx.font = '10px sans-serif';
  ctx.fillText(fmt(edges[0]), PAD.l, h - 10);
  ctx.fillText(fmt(edges[edges.length - 1]), w - PAD.r - 34, h - 10);
}
