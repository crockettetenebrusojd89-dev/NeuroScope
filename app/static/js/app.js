// NeuroScope SPA shell: sidebar routing, page lazy-loading, language switching.

import { t, raw, getMode, setMode, onLanguageChange } from './i18n.js';

const PAGE_ORDER = [
  { group: 'fundamentals', pages: ['tensor', 'activations', 'losses', 'graph'] },
  { group: 'networks', pages: ['playground', 'backprop', 'diagnostics', 'residual'] },
  { group: 'training', pages: ['optimizers', 'init', 'lr', 'regularization', 'normalization'] },
  { group: 'convolution', pages: ['cnn', 'pooling', 'receptive'] },
  { group: 'attention', pages: ['attention', 'multihead'] },
];

const PAGE_MODS = {
  home: 'home',
  tensor: 'tensor', activations: 'activations', losses: 'losses', graph: 'graph',
  playground: 'playground', backprop: 'backprop', diagnostics: 'diagnostics',
  optimizers: 'optimizers', init: 'init', lr: 'lr', regularization: 'regularization',
  cnn: 'cnn', pooling: 'pooling', normalization: 'normalization', receptive: 'receptive', residual: 'residual', attention: 'attention', multihead: 'multihead',
};

const loaded = {};
let currentKey = null;
let pageVersion = 0;
let disposePage = null;

function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = `<a href="#home" data-page="home" class="nav-item">${t('nav.home')}</a>` + PAGE_ORDER.map(({ group, pages }) => `
    <div class="nav-group">${t(`nav.${group}`)}</div>
    ${pages.map(p => `<a href="#${p}" data-page="${p}" class="nav-item">${t(`nav.${p}`)}</a>`).join('')}
  `).join('') + `
    <div class="nav-group">${t('lang.label')}</div>
    <div class="lang-switch" id="lang-switch">
      <button data-mode="zh">中文</button>
      <button data-mode="bi">中英双语</button>
      <button data-mode="en">English</button>
    </div>`;
  document.getElementById('nav-toggle').textContent = t('app.browseLabs');
  document.getElementById('brand-sub').textContent = t('app.sub');
  document.getElementById('sidebar-footer').textContent = `v0.3.0 · ${t('app.footer')}`;
  markActive();
  markLang();
}

function markActive() {
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.page === currentKey));
}

function markLang() {
  document.querySelectorAll('#lang-switch button').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === getMode()));
}

async function showPage(key) {
  if (!PAGE_MODS[key]) key = 'home';
  const version = ++pageVersion;
  if (disposePage) disposePage();
  disposePage = null;
  if (currentKey !== key) window.scrollTo({ top: 0, behavior: 'instant' });
  currentKey = key;
  markActive();

  // main title: bilingual mode renders 中文 + English on two lines
  const titleEl = document.getElementById('page-title');
  if (getMode() === 'bi') {
    const both = raw(`pages.${key}.title`);
    titleEl.innerHTML = `${both.zh}<span class="title-en">${both.en}</span>`;
  } else {
    titleEl.textContent = t(`pages.${key}.title`);
  }
  document.getElementById('page-desc').textContent = t(`pages.${key}.desc`);

  const container = document.getElementById('page-content');
  const pageRoot = document.createElement('div');
  container.replaceChildren(pageRoot);
  try {
    const mod = PAGE_MODS[key];
    if (!loaded[mod]) loaded[mod] = await import(`./pages/${mod}.js`);
    if (version !== pageVersion) return;
    const dispose = await loaded[mod].render(pageRoot);
    if (version === pageVersion) disposePage = typeof dispose === 'function' ? dispose : null;
    else if (typeof dispose === 'function') dispose();
  } catch (err) {
    if (version !== pageVersion) return;
    pageRoot.innerHTML = `<div class="error-box">${t('app.loadFailed', { msg: err.message })}</div>`;
    console.error(err);
  }
}

document.getElementById('nav-toggle').addEventListener('click', () => {
  const expanded = document.getElementById('sidebar').classList.toggle('nav-open');
  document.getElementById('nav-toggle').setAttribute('aria-expanded', String(expanded));
});

document.getElementById('nav').addEventListener('click', e => {
  const item = e.target.closest('.nav-item');
  if (item) {
    document.getElementById('sidebar').classList.remove('nav-open');
    document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
    location.hash = item.dataset.page; return;
  }
  const langBtn = e.target.closest('#lang-switch button');
  if (langBtn) setMode(langBtn.dataset.mode);
});
window.addEventListener('hashchange', () => showPage(location.hash.slice(1)));
onLanguageChange(() => { renderNav(); showPage(currentKey || 'home'); });

document.documentElement.lang = getMode() === 'en' ? 'en' : 'zh-CN';
renderNav();
showPage(location.hash.slice(1) || 'home');
