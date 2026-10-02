// English (US) language resources — NeuroScope
// Keys must mirror zh-CN.js exactly.

export default {
  app: {
    sub: 'DL visualization lab',
    footer: 'NumPy engine',
    loadFailed: 'Failed to load page: {msg}',
  },
  nav: {
    normalization: "Normalization",
    fundamentals: 'Fundamentals',
    networks: 'Networks',
    training: 'Training',
    convolution: 'Convolution',
    tensor: 'Tensor & Shape',
    activations: 'Activations',
    losses: 'Loss',
    graph: 'Computational Graph',
    playground: 'Network Playground',
    backprop: 'Backprop Visualizer',
    diagnostics: 'Gradient Diagnostics',
    optimizers: 'Optimization',
    init: 'Initialization',
    lr: 'Learning Rate',
    regularization: 'Regularization',
    cnn: 'Convolution Lab',
    pooling: 'Pooling Lab',
  },
  lang: {
    label: 'Language',
    zh: '中文',
    bi: '中英双语',
    en: 'English',
  },
  common: {
    run: 'Run',
    reset: 'Reset',
    compute: 'Compute',
    outputShape: 'output shape',
    train: 'train',
    val: 'val',
    epochs: 'Epochs',
    trainAcc: 'Training accuracy',
    valAcc: 'Validation accuracy',
    animate: '▶ Animate window',
    stop: '⏸ Stop',
    pressAnimate: 'Press “Animate window”.',
  },
  pages: {
    normalization: {"title": "Normalization Lab", "desc": "Compare BatchNorm and LayerNorm axes, values, statistics and distributions."},
    tensor: {
      title: 'Tensor & Shape Lab',
      desc: 'See how reshape, transpose, matmul, broadcasting and axis reductions transform tensor shapes.',
    },
    activations: {
      title: 'Activations Lab',
      desc: 'Activation functions, their derivatives, and live value/gradient readouts.',
    },
    losses: {
      title: 'Loss Lab',
      desc: 'Change a prediction and watch the loss respond in real time.',
    },
    graph: {
      title: 'Computational Graph',
      desc: 'Step through a forward pass, then a backward pass, watching the chain rule accumulate gradients.',
    },
    playground: {
      title: 'Neural Network Playground',
      desc: 'Build an MLP, train it live on 2D datasets, and watch the decision boundary form.',
    },
    backprop: {
      title: 'Backpropagation Visualizer',
      desc: 'Loss → output gradient → per-layer dW/db, summary first with drill-down.',
    },
    diagnostics: {
      title: 'Gradient Diagnostics',
      desc: 'Per-layer gradient norms with vanishing/exploding detection.',
    },
    optimizers: {
      title: 'Optimization Lab',
      desc: 'SGD, Momentum, RMSProp and Adam racing across 2D loss landscapes.',
    },
    init: {
      title: 'Initialization Lab',
      desc: 'Zeros / Random / Xavier / He: activation variance and gradient norms through a deep network.',
    },
    lr: {
      title: 'Learning Rate Lab',
      desc: 'Too small, just right, too large — compare loss curves at different learning rates.',
    },
    regularization: {
      title: 'Regularization Lab',
      desc: 'None vs L1 vs L2 vs Dropout: overfitting, generalization and boundary complexity.',
    },
    cnn: {
      title: 'Convolution Lab',
      desc: 'Sliding-window convolution: kernel, element-wise products, summation, feature map.',
    },
    pooling: {
      title: 'Pooling Lab',
      desc: 'Max and average pooling visualized window by window.',
    },
  },

  // ---------------------------------------------------------------- Tensor Lab
  tensor: {
    inputTensor: 'Input tensor',
    valuesJson: 'Values (JSON)',
    operation: 'Operation',
    parameter: 'Parameter',
    random: 'Random 2×3',
    apply: 'Apply',
    before: 'Before',
    after: 'After',
    whatHappened: 'What just happened?',
    invalidJson: 'Invalid JSON for tensor values.',
    hints: {
      reshape: 'New shape (comma separated, e.g. 3,2). Element count must match.',
      transpose: 'Axis order (comma separated, e.g. 1,0). Leave empty to reverse.',
      matmul: 'Matrix B as rows, e.g. [[5,6],[7,8]]. Inner dims must match.',
      broadcast_add: 'Tensor B, e.g. [[10,20,30]]. Watch B stretch across rows.',
      reduce_sum: 'Axis to sum over (0, 1, ...). Empty = sum everything.',
    },
    explain: {
      reshape: 'reshape keeps the {size} elements in row-major order and re-groups them as {out}.',
      transpose: 'transpose permutes the axes to {perm}, shape {in} → {out}. The elements themselves do not move — only the indexing order changes.',
      matmul: 'Matrix multiplication: {a} @ {b} = {out}; the shared dimension {k} is contracted, and every output element is one dot product.',
      broadcast: 'Broadcasting aligns trailing dimensions: {a} + {b} → {out}. Dimensions of size 1 are stretched; missing leading dims are treated as 1.',
      reduce_sum: 'Sum over axis {axis}: shape {in} → {out}. Reducing an axis removes it.',
    },
    err: {
      empty: 'Tensor must not be empty.',
      reshape_size: 'Cannot reshape a size-{size} tensor into shape {shape}: element counts must match.',
      transpose_axes: 'Invalid axis permutation: this tensor only has {ndim} axes.',
      matmul_2d: 'The matmul demo expects two 2D matrices.',
      matmul_dim: 'Inner dimensions must match: {a} and {b} cannot be multiplied.',
      broadcast: 'Shapes {a} and {b} cannot broadcast: check trailing-dimension compatibility.',
      axis: 'Axis {axis} is out of range: this tensor only has {ndim} axes.',
      unknown_op: 'Unknown tensor op: {op}',
    },
  },

  // ---------------------------------------------------------------- Activations
  activations: {
    activation: 'Activation',
    inputX: 'Input x = ',
    outputY: 'output f(x)',
    gradient: 'gradient f′(x)',
    chartTitle: 'Function & derivative',
    note: 'Blue: f(x) · Orange: f′(x) · Dot: current x. Softmax is shown as the first component of softmax([x, 0, 0]).',
  },

  // ---------------------------------------------------------------- Losses
  losses: {
    loss: 'Loss',
    prediction: 'Prediction p = ',
    target: 'Target y',
    targetPos: '1 (positive)',
    targetNeg: '0 (negative)',
    lossValue: 'loss',
    gradValue: '∂loss/∂p',
    chartTitle: 'Loss as a function of the prediction',
    options: {
      mse: 'MSE',
      bce: 'Binary Cross Entropy',
      cross_entropy: 'Cross Entropy (3-class)',
    },
    notes: {
      mse: 'MSE = mean((p − y)²). Gradient grows linearly with the error.',
      bce: 'BCE = −[y·log p + (1−y)·log(1−p)]. Confident wrong predictions are punished harshly.',
      cross_entropy: '3-class CE with logits [4p−2, 0, 0], true class 0. The x-axis acts as the model\'s confidence.',
    },
  },

  // ---------------------------------------------------------------- Graph
  graph: {
    stepFwd: '▶ Step forward',
    stepBwd: '◀ Step backward',
    autoPlay: 'Auto-play',
    panelTitle: 'Graph — two-layer neuron with MSE loss',
    initialHint: 'Each edge shows the local gradient ∂parent/∂child. Backward steps multiply local gradients along the path — that is the chain rule.',
    fwdDone: 'Forward pass complete — loss computed. Now step backward.',
    bwdDone: 'Backward pass complete — every input has its gradient.',
    fwdStep: 'Forward: computed {name} = {value}',
    bwdStep: 'Backward: ∂L/∂{name} = {value} (sum of downstream gradient × local gradient on each edge)',
    fwdProgress: 'forward {done}/{total}',
    bwdProgress: 'backward {done}/{total}',
  },

  // ---------------------------------------------------------------- Playground
  playground: {
    dataset: 'Dataset',
    samples: 'Samples',
    noise: 'Noise',
    testSplit: 'Test split',
    archTitle: 'Architecture — Input(2) → hidden layers → Output(1)',
    addLayer: '+ hidden layer',
    hiddenN: 'Hidden {i} neurons',
    activation: 'Activation',
    init: 'Init',
    optimizer: 'Optimizer',
    algorithm: 'Algorithm',
    lr: 'Learning rate',
    momentum: 'Momentum',
    build: 'Build network',
    start: 'Start',
    pause: 'Pause',
    notBuilt: 'not built',
    ready: 'session {sid} ready',
    training: 'session {sid} · training…',
    paused: 'session {sid} · paused',
    boundary: 'Decision boundary',
    loss: 'Loss',
    accuracy: 'Accuracy',
    epoch: 'epoch',
    trainLoss: 'train loss',
    valLoss: 'val loss',
  },

  // ---------------------------------------------------------------- Backprop
  backprop: {
    run: 'Compute one backward pass',
    hint: 'Uses the current Playground session (trains on a batch of 64). Create/train a network in the Playground first — or one will be built automatically.',
    flowTitle: 'Gradient flow — batch loss {loss}',
    normsTitle: '‖dW‖ per layer (log-friendly view)',
    layerTitle: 'Layer {i} — Linear {shape}',
    dWStats: '‖dW‖ = {norm} · max|dW| = {max}',
    dbStats: '‖db‖ = {norm} · max|db| = {max}',
    drillDown: 'Drill down',
    tooLarge: 'Matrix too large to display — use the summary statistics and histograms instead.',
    dWLabel: 'dW ({shape}):',
    dbLabel: 'db:',
  },

  // ---------------------------------------------------------------- Diagnostics
  diagnostics: {
    run: 'Run diagnostics',
    hint: 'Performs one backward pass on the current Playground session and inspects every layer\'s gradient.',
    barsTitle: '‖dW‖ per layer',
    reportTitle: 'Health report',
    colLayer: 'Layer',
    colMean: 'mean |dW|',
    colStatus: 'status',
    footerHint: 'Rules of thumb: ‖dW‖ < 1e-6 → vanishing; ‖dW‖ > 1e3 → exploding. Try a deep sigmoid network with random init in the Playground to see vanishing gradients live.',
    status: { ok: 'ok', vanishing: 'vanishing', exploding: 'exploding' },
  },

  // ---------------------------------------------------------------- Optimizers
  optimizers: {
    landscape: 'Landscape',
    fn: {
      quadratic: 'Elongated bowl (0.4x² + 4y²)',
      rosenbrock: 'Rosenbrock valley',
      saddle: 'Saddle (x² − 2y² + 0.3xy)',
    },
    optimizer: 'Optimizer',
    steps: 'Steps',
    run: 'Run',
    compareAll: 'Compare all 4',
    mapTitle: 'Loss landscape & optimization path',
    lossTitle: 'Loss along the path',
    clickHint: 'Click the landscape to move the start point, then Run again.',
  },

  // ---------------------------------------------------------------- Init Lab
  init: {
    hiddenAct: 'Hidden activation',
    run: 'Run experiment',
    hint: 'A 10-layer MLP (width 32) with each initializer: activation variance + gradient norm per layer.',
    varTitle: 'Activation variance per layer',
    varHint: 'Healthy init keeps variance roughly flat. Zeros → dead network; too-large random → saturation.',
    gradTitle: '‖dW‖ per layer (log₁₀ scale)',
    gradHint: 'Vanishing: norms collapse toward early layers. Exploding: they blow up. Xavier/He keep them stable.',
  },

  // ---------------------------------------------------------------- LR Lab
  lr: {
    listLabel: 'Learning rates (comma separated)',
    trainAll: 'Train all',
    hint: 'Same moons MLP trained with plain SGD at each learning rate.',
    curvesTitle: 'Training loss curves',
    accTitle: 'Final validation accuracy',
    emptyErr: 'Enter at least one positive learning rate.',
  },

  // ---------------------------------------------------------------- Regularization
  regularization: {
    run: 'Run comparison',
    hint: 'An over-parameterized ReLU MLP (24-24-24) on very noisy moons — perfect overfitting conditions. Takes a few seconds.',
    trainTitle: 'Training accuracy',
    valTitle: 'Validation accuracy',
    cardStats: 'train {train}% · val {val}%',
  },

  // ---------------------------------------------------------------- CNN
  cnn: {
    kernelPreset: 'Kernel preset',
    stride: 'Stride = ',
    padding: 'Padding = ',
    inputImage: 'Input image',
    kernel: 'Kernel',
    featureMap: 'Feature map',
    detailTitle: 'Current window computation',
    windowAt: 'Window at (row {r}, col {c}) → output[{i}, {j}]',
    products: 'element-wise products: {products}',
    sum: 'Σ = ',
    formula: 'out = ⌊({H} + 2·{P} − {K}) / {S}⌋ + 1 = {out}',
  },

  // ---------------------------------------------------------------- Pooling
  pooling: {
    mode: 'Mode',
    windowSize: 'Window size',
    stride: 'Stride',
    strideAuto: '= size',
    inputMap: 'Input feature map',
    outputMap: 'Pooled output',
    detailTitle: 'Current window',
    windowDetail: 'Window (row {r}, col {c}): {region} → {mode} = {val} → output[{i}, {j}]',
  },
  p2: {"before": "Before", "after": "After", "err": {"json": "Enter valid JSON.", "matrix": "{field}: enter a nonempty rectangular 2D matrix (at most 1024 elements).", "finite": "{field}: values must be finite and within the supported range.", "config": "Invalid or out-of-range parameter: {field}."}},
  normalization: {"values": "X [N, D] (JSON)", "kind": "Method", "epsilon": "ε", "gamma": "γ", "beta": "β", "scope": "Training-batch statistics, ddof=0. Scalar γ/β; no running statistics. Constant groups have variance 0; ε keeps division finite.", "batchAxis": "BatchNorm: axis=0 (N ↓). Each column/feature is a separate group; samples share its μ/σ².", "layerAxis": "LayerNorm: axis=1 (D →). Each row/sample is a separate group; features share its μ/σ².", "group": "Highlight normalization group", "feature": "Feature D={i}", "sample": "Sample N={i}", "stats": "Statistics for every group (population variance)", "beforeHist": "Before: selected group distribution (counts)", "afterHist": "After: selected group distribution (same bins)"},
};
