import { t } from '../i18n.js';

// Only links to existing labs. Ordering and metadata contain no translated UI text.
export const LEARNING_STEPS = [["tensor", "beginner", "fundamentals"], ["activations", "beginner", "fundamentals"], ["losses", "beginner", "fundamentals"], ["graph", "beginner", "fundamentals"], ["backprop", "intermediate", "training"], ["init", "intermediate", "training"], ["optimizers", "intermediate", "training"], ["regularization", "intermediate", "training"], ["cnn", "intermediate", "cnn"], ["pooling", "beginner", "cnn"], ["receptive", "intermediate", "cnn"], ["residual", "advanced", "modern"], ["normalization", "intermediate", "modern"], ["attention", "advanced", "modern"], ["multihead", "advanced", "modern"]];

export function render(root) {
  root.innerHTML = `
    <section class="home-hero" aria-labelledby="home-brand">
      <div><p class="home-eyebrow">${t('home.eyebrow')}</p>
        <h2 id="home-brand">NeuroScope</h2>
        <p class="home-intro">${t('home.intro')}</p>
        <div class="home-actions"><a class="home-primary" href="#tensor">${t('home.start')} →</a>
          <button class="secondary" id="home-browse">${t('home.browse')}</button></div>
      </div><div class="home-equation" aria-hidden="true">X → f(X) → L<br><span>∂L/∂W → W′</span></div>
    </section>
    <section id="home-path" aria-labelledby="home-path-title">
      <div class="home-section-heading"><h2 id="home-path-title">${t('home.fullPath')}</h2>
        <p>${t('home.orderNote')}</p></div>
      <ol class="learning-grid">${LEARNING_STEPS.map(([id, level, topic], i) => `
        <li><a class="learning-node" href="#${id}">
          <span class="learning-number">${String(i + 1).padStart(2, '0')}</span>
          <span class="learning-detail"><strong>${t(`nav.${id}`)}</strong>
            <span class="learning-description">${t(`home.steps.${id}`)}</span>
            <span class="learning-tags"><span>${t(`home.level.${level}`)}</span><span>${t(`home.topic.${topic}`)}</span></span>
          </span><span class="learning-arrow" aria-hidden="true">→</span></a></li>`).join('')}</ol>
    </section>
    <section class="panel home-practice"><h3>${t('home.practice')}</h3><p class="hint">${t('home.practiceNote')}</p>
      <div class="home-actions">${['playground','diagnostics','lr'].map(id=>`<a href="#${id}">${t(`nav.${id}`)} →</a>`).join('')}</div>
    </section>`;
  root.querySelector('#home-browse').onclick = () => {
    const section = root.querySelector('#home-path');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section.querySelector('a').focus({ preventScroll: true });
  };
}
