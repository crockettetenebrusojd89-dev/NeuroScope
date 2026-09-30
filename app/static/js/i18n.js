// NeuroScope i18n manager.
// Three UI language modes: 'zh' (中文, default), 'en' (English),
// 'bi' (中英双语 — main titles and key terms shown in both languages).
// The choice persists in localStorage and applies without a page reload.

import zhCN from './locales/zh-CN.js';
import enUS from './locales/en-US.js';

const LOCALES = { zh: zhCN, en: enUS };
const STORAGE_KEY = 'neuroscope-lang';
const MODES = ['zh', 'bi', 'en'];

let mode = loadMode();
const listeners = [];

function loadMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return MODES.includes(saved) ? saved : 'zh';
}

export function getMode() { return mode; }

export function setMode(next) {
  if (!MODES.includes(next) || next === mode) return;
  mode = next;
  localStorage.setItem(STORAGE_KEY, next);
  document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
  listeners.forEach(cb => cb());
}

export function onLanguageChange(cb) { listeners.push(cb); }

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`);
}

// Keys rendered in both languages in bilingual mode:
// page main titles (pages.*.title) and explicit term keys.
const BILINGUAL_PATTERN = /^pages\..*\.title$/;

/** Translate a dotted key with optional {param} interpolation. */
export function t(key, params) {
  const zh = lookup(zhCN, key);
  const en = lookup(enUS, key);
  let str;
  if (mode === 'en') str = en ?? zh ?? key;
  else if (mode === 'bi' && BILINGUAL_PATTERN.test(key) && zh && en) str = `${zh} ${en}`;
  else str = zh ?? en ?? key;
  return interpolate(str, params);
}

/** Both language variants of a key — for special two-line rendering. */
export function raw(key) {
  return { zh: lookup(zhCN, key) ?? key, en: lookup(enUS, key) ?? key };
}

/** Localize an API error: structured {i18n, params} details are translated,
 *  plain string details are shown as-is (they are technical messages).
 *  Array params (shapes) are rendered as [a, b]. */
export function errText(err) {
  if (err && err.i18n && err.i18n.i18n) {
    const params = {};
    for (const [k, v] of Object.entries(err.i18n.params || {})) {
      params[k] = Array.isArray(v) ? fmtShape(v) : v;
    }
    return t(err.i18n.i18n, params);
  }
  return (err && err.message) || String(err);
}

/** Format a shape array like [3, 2] for display inside sentences. */
export function fmtShape(shape) {
  return `[${shape.join(', ')}]`;
}
