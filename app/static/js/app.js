// NeuroScope SPA shell: sidebar routing + page lazy-loading.

const PAGES = {
  tensor:        { title: 'Tensor & Shape Lab',      desc: 'See how reshape, transpose, matmul, broadcasting and axis reductions transform tensor shapes.', mod: 'tensor' },
  activations:   { title: 'Activations Lab',         desc: 'Activation functions, their derivatives, and live value/gradient readouts.', mod: 'activations' },
  losses:        { title: 'Loss Lab',                desc: 'Change a prediction and watch the loss respond in real time.', mod: 'losses' },
  graph:         { title: 'Computational Graph',     desc: 'Step through a forward pass, then a backward pass, watching the chain rule accumulate gradients.', mod: 'graph' },
  playground:    { title: 'Neural Network Playground', desc: 'Build an MLP, train it live on 2D datasets, and watch the decision boundary form.', mod: 'playground' },
  backprop:      { title: 'Backpropagation Visualizer', desc: 'Loss → output gradient → per-layer dW/db, summary first with drill-down.', mod: 'backprop' },
  diagnostics:   { title: 'Gradient Diagnostics',    desc: 'Per-layer gradient norms with vanishing/exploding detection.', mod: 'diagnostics' },
  optimizers:    { title: 'Optimization Lab',        desc: 'SGD, Momentum, RMSProp and Adam racing across 2D loss landscapes.', mod: 'optimizers' },
  init:          { title: 'Initialization Lab',      desc: 'Zeros / Random / Xavier / He: activation variance and gradient norms through a deep network.', mod: 'init' },
  lr:            { title: 'Learning Rate Lab',       desc: 'Too small, just right, too large — compare loss curves at different learning rates.', mod: 'lr' },
  regularization:{ title: 'Regularization Lab',      desc: 'None vs L1 vs L2 vs Dropout: overfitting, generalization and boundary complexity.', mod: 'regularization' },
  cnn:           { title: 'Convolution Lab',         desc: 'Sliding-window convolution: kernel, element-wise products, summation, feature map.', mod: 'cnn' },
  pooling:       { title: 'Pooling Lab',             desc: 'Max and average pooling visualized window by window.', mod: 'pooling' },
};

const loaded = {};

async function showPage(key) {
  const page = PAGES[key] || PAGES.tensor;
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.page === key));
  document.getElementById('page-title').textContent = page.title;
  document.getElementById('page-desc').textContent = page.desc;
  const container = document.getElementById('page-content');
  container.innerHTML = '';
  try {
    if (!loaded[page.mod]) loaded[page.mod] = await import(`./pages/${page.mod}.js`);
    await loaded[page.mod].render(container);
  } catch (err) {
    container.innerHTML = `<div class="error-box">Failed to load page: ${err.message}</div>`;
    console.error(err);
  }
}

document.getElementById('nav').addEventListener('click', e => {
  const item = e.target.closest('.nav-item');
  if (item) { location.hash = item.dataset.page; }
});
window.addEventListener('hashchange', () => showPage(location.hash.slice(1)));
showPage(location.hash.slice(1) || 'tensor');
