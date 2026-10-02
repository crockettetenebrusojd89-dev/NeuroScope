// 中文（简体）语言资源 — NeuroScope
// 术语规则：普通界面文字用自然中文；重要技术术语首次出现采用「中文（English）」；
// 代码标识符、API 名称、公式、变量不翻译。

export default {
  app: {
    sub: '深度学习可视化实验室',
    footer: 'NumPy 引擎',
    loadFailed: '页面加载失败：{msg}',
  },
  nav: {
    receptive: "感受野",
    normalization: "归一化",
    fundamentals: '基础知识',
    networks: '神经网络',
    training: '训练',
    convolution: '卷积',
    tensor: '张量与形状',
    activations: '激活函数',
    losses: '损失函数',
    graph: '计算图',
    playground: '神经网络实验场',
    backprop: '反向传播可视化',
    diagnostics: '梯度诊断',
    optimizers: '优化器',
    init: '参数初始化',
    lr: '学习率',
    regularization: '正则化',
    cnn: '卷积实验室',
    pooling: '池化实验室',
  },
  lang: {
    label: '界面语言',
    zh: '中文',
    bi: '中英双语',
    en: 'English',
  },
  common: {
    run: '运行',
    reset: '重置',
    compute: '计算',
    outputShape: '输出形状',
    train: '训练集',
    val: '验证集',
    epochs: '轮次（Epochs）',
    trainAcc: '训练准确率',
    valAcc: '验证准确率',
    animate: '▶ 播放窗口动画',
    stop: '⏸ 停止',
    pressAnimate: '点击「播放窗口动画」查看逐步过程。',
  },
  pages: {
    receptive: {"title": "感受野实验室", "desc": "配置卷积网络，选择任意深层特征，追踪其在输入上的精确依赖区域（Receptive Field）。"},
    normalization: {"title": "归一化实验室", "desc": "对比批归一化（BatchNorm）与层归一化（LayerNorm）的计算维度、数值、统计量与分布。"},
    tensor: {
      title: '张量与形状实验室',
      desc: '观察 reshape、transpose、matmul、广播（Broadcasting）和轴（Axis）归约如何改变张量（Tensor）的形状与数据排列。',
    },
    activations: {
      title: '激活函数实验室',
      desc: '激活函数（Activation Function）及其导数曲线，实时查看当前输入、输出与梯度（Gradient）。',
    },
    losses: {
      title: '损失函数实验室',
      desc: '改变预测值，实时观察损失函数（Loss Function）与梯度的变化。',
    },
    graph: {
      title: '计算图',
      desc: '逐步执行前向传播（Forward Pass）与反向传播（Backward Pass），观察链式法则（Chain Rule）如何逐步累积梯度。',
    },
    playground: {
      title: '神经网络实验场',
      desc: '搭建多层感知机（MLP），在二维数据集上实时训练，观察决策边界（Decision Boundary）如何形成。',
    },
    backprop: {
      title: '反向传播可视化',
      desc: '损失 → 输出梯度 → 各层 dW/db：摘要优先，可逐层深入查看细节。',
    },
    diagnostics: {
      title: '梯度诊断',
      desc: '逐层检查梯度范数（Gradient Norm），识别梯度消失（Vanishing Gradients）与梯度爆炸（Exploding Gradients）。',
    },
    optimizers: {
      title: '优化器实验室',
      desc: 'SGD、Momentum、RMSProp、Adam 在二维损失地形（Loss Landscape）上的优化路径对比。',
    },
    init: {
      title: '参数初始化实验室',
      desc: 'Zeros / Random / Xavier / He：观察深度网络中激活分布与梯度范数的差异。',
    },
    lr: {
      title: '学习率实验室',
      desc: '学习率（Learning Rate）过小、合适、过大时的损失曲线对比。',
    },
    regularization: {
      title: '正则化实验室',
      desc: 'None / L1 / L2 / Dropout：理解过拟合（Overfitting）与泛化（Generalization）。',
    },
    cnn: {
      title: '卷积实验室',
      desc: '滑动窗口演示卷积（Convolution）：输入图像、卷积核（Kernel）、逐元素相乘、求和、特征图（Feature Map）。',
    },
    pooling: {
      title: '池化实验室',
      desc: '最大值池化（Max Pooling）与平均池化（Average Pooling）的逐窗口可视化。',
    },
  },

  // ---------------------------------------------------------------- Tensor Lab
  tensor: {
    inputTensor: '输入张量',
    valuesJson: '张量数值（JSON）',
    operation: '操作',
    parameter: '参数',
    random: '随机生成 2×3',
    apply: '执行',
    before: '操作前',
    after: '操作后',
    whatHappened: '刚才发生了什么？',
    invalidJson: '张量数值不是合法的 JSON。',
    hints: {
      reshape: '新形状（逗号分隔，如 3,2）。元素总数必须一致。',
      transpose: '轴顺序（逗号分隔，如 1,0）。留空则反转全部轴。',
      matmul: '矩阵 B，按行书写，如 [[5,6],[7,8]]。内层维度必须匹配。',
      broadcast_add: '张量 B，如 [[10,20,30]]。观察 B 如何被拉伸到每一行。',
      reduce_sum: '要求和的轴（0、1、…）。留空表示对全部元素求和。',
    },
    explain: {
      reshape: 'reshape（重塑形状）不会改变元素本身，而是按照行优先顺序（row-major order）重新组织这 {size} 个元素，并得到形状 {out}。',
      transpose: 'transpose（转置）把轴重新排列为 {perm}，形状由 {in} 变为 {out}。元素本身不动，只是索引顺序改变。',
      matmul: '矩阵乘法（Matrix Multiplication）：{a} @ {b} = {out}；共享维度 {k} 被消去（contract），结果的每个元素是一次点积（dot product）。',
      broadcast: '广播（Broadcasting）对齐尾部维度：{a} + {b} → {out}。长度为 1 的维度会被拉伸；缺失的前导维度按 1 处理。',
      reduce_sum: '沿轴（Axis）{axis} 求和：形状 {in} → {out}。被求和的轴会从形状中移除。',
    },
    err: {
      empty: '张量不能为空。',
      reshape_size: '无法把包含 {size} 个元素的张量 reshape 为 {shape}：元素总数必须一致。',
      transpose_axes: '轴排列不合法：该张量只有 {ndim} 个轴。',
      matmul_2d: 'matmul 演示需要两个二维矩阵。',
      matmul_dim: '内层维度必须匹配：{a} 与 {b} 无法相乘。',
      broadcast: '形状 {a} 与 {b} 无法广播：请检查尾部维度是否兼容。',
      axis: '轴 {axis} 超出范围：该张量只有 {ndim} 个轴。',
      unknown_op: '未知的张量操作：{op}',
    },
  },

  // ---------------------------------------------------------------- Activations
  activations: {
    activation: '激活函数',
    inputX: '输入 x = ',
    outputY: '输出 f(x)',
    gradient: '梯度 f′(x)',
    chartTitle: '函数曲线与导数',
    note: '蓝线：f(x) · 橙线：f′(x) · 圆点：当前 x。Softmax 显示的是 softmax([x, 0, 0]) 的第一个分量。',
  },

  // ---------------------------------------------------------------- Losses
  losses: {
    loss: '损失函数',
    prediction: '预测值 p = ',
    target: '目标值 y',
    targetPos: '1（正类）',
    targetNeg: '0（负类）',
    lossValue: '损失值',
    gradValue: '∂loss/∂p',
    chartTitle: '损失随预测值变化的曲线',
    options: {
      mse: 'MSE（均方误差）',
      bce: '二元交叉熵（Binary Cross Entropy）',
      cross_entropy: '交叉熵（Cross Entropy，3 类）',
    },
    notes: {
      mse: 'MSE = mean((p − y)²)。梯度随误差线性增长。',
      bce: 'BCE = −[y·log p + (1−y)·log(1−p)]。自信地预测错误会受到严厉惩罚。',
      cross_entropy: 'logits 取 [4p−2, 0, 0]、真实类别为 0 的 3 类交叉熵。横轴可以看作模型的置信度。',
    },
  },

  // ---------------------------------------------------------------- Graph
  graph: {
    stepFwd: '▶ 前向一步',
    stepBwd: '◀ 反向一步',
    autoPlay: '自动播放',
    panelTitle: '计算图 — 两层神经元 + MSE 损失',
    initialHint: '每条边上标注的是局部梯度（Local Gradient）∂parent/∂child。反向步骤把路径上的局部梯度逐项相乘——这就是链式法则。',
    fwdDone: '前向传播完成——损失已计算。现在可以逐步反向。',
    bwdDone: '反向传播完成——每个输入都得到了自己的梯度。',
    fwdStep: '前向：计算 {name} = {value}',
    bwdStep: '反向：∂L/∂{name} = {value}（下游梯度 × 每条边上的局部梯度求和）',
    fwdProgress: '前向 {done}/{total}',
    bwdProgress: '反向 {done}/{total}',
  },

  // ---------------------------------------------------------------- Playground
  playground: {
    dataset: '数据集',
    samples: '样本数',
    noise: '噪声',
    testSplit: '测试集比例',
    archTitle: '网络结构 — Input(2) → 隐藏层 → Output(1)',
    addLayer: '+ 添加隐藏层',
    hiddenN: '隐藏层 {i} 神经元数',
    activation: '激活函数',
    init: '初始化',
    optimizer: '优化器',
    algorithm: '算法',
    lr: '学习率',
    momentum: '动量（Momentum）',
    build: '构建网络',
    start: '开始',
    pause: '暂停',
    notBuilt: '尚未构建',
    ready: '会话 {sid} 就绪',
    training: '会话 {sid} · 训练中…',
    paused: '会话 {sid} · 已暂停',
    boundary: '决策边界',
    loss: '损失',
    accuracy: '准确率',
    epoch: '轮次',
    trainLoss: '训练损失',
    valLoss: '验证损失',
  },

  // ---------------------------------------------------------------- Backprop
  backprop: {
    run: '执行一次反向传播',
    hint: '使用当前实验场会话（在 64 个样本的批次上计算）。请先在「神经网络实验场」构建网络——否则将自动创建一个默认网络。',
    flowTitle: '梯度流动 — 批次损失 {loss}',
    normsTitle: '各层 ‖dW‖（便于观察的量级视图）',
    layerTitle: '第 {i} 层 — Linear {shape}',
    dWStats: '‖dW‖ = {norm} · max|dW| = {max}',
    dbStats: '‖db‖ = {norm} · max|db| = {max}',
    drillDown: '展开细节',
    tooLarge: '矩阵过大，不便直接展示——请使用摘要统计与直方图。',
    dWLabel: 'dW（{shape}）：',
    dbLabel: 'db：',
  },

  // ---------------------------------------------------------------- Diagnostics
  diagnostics: {
    run: '运行诊断',
    hint: '在当前实验场会话上执行一次反向传播，并检查每一层的梯度。',
    barsTitle: '各层 ‖dW‖',
    reportTitle: '健康报告',
    colLayer: '层',
    colMean: '平均 |dW|',
    colStatus: '状态',
    footerHint: '经验法则：‖dW‖ < 1e-6 → 梯度消失；‖dW‖ > 1e3 → 梯度爆炸。在实验场中搭建一个 sigmoid + random 初始化的深层网络，可以实时看到梯度消失。',
    status: { ok: '正常', vanishing: '消失（vanishing）', exploding: '爆炸（exploding）' },
  },

  // ---------------------------------------------------------------- Optimizers
  optimizers: {
    landscape: '损失地形',
    fn: {
      quadratic: '狭长碗形（0.4x² + 4y²）',
      rosenbrock: 'Rosenbrock 山谷',
      saddle: '鞍点（x² − 2y² + 0.3xy）',
    },
    optimizer: '优化器',
    steps: '步数',
    run: '运行',
    compareAll: '对比全部 4 种',
    mapTitle: '损失地形与优化路径',
    lossTitle: '路径上的损失变化',
    clickHint: '点击地形图可以移动起点，然后重新运行。',
  },

  // ---------------------------------------------------------------- Init Lab
  init: {
    hiddenAct: '隐藏层激活函数',
    run: '运行实验',
    hint: '使用每种初始化方法各构建一个 10 层 MLP（宽度 32）：对比逐层激活方差与梯度范数。',
    varTitle: '逐层激活方差',
    varHint: '健康的初始化让方差大致平稳。Zeros → 网络死亡；过大的随机初始化 → 激活饱和。',
    gradTitle: '逐层 ‖dW‖（log₁₀ 对数轴）',
    gradHint: '消失：范数向浅层方向塌陷。爆炸：范数急剧增大。Xavier / He 能保持稳定。',
  },

  // ---------------------------------------------------------------- LR Lab
  lr: {
    listLabel: '学习率列表（逗号分隔）',
    trainAll: '全部训练',
    hint: '同一个 moons MLP，使用纯 SGD 分别以各学习率训练。',
    curvesTitle: '训练损失曲线',
    accTitle: '最终验证准确率',
    emptyErr: '请至少输入一个正的学习率。',
  },

  // ---------------------------------------------------------------- Regularization
  regularization: {
    run: '运行对比实验',
    hint: '在高噪声 moons 上训练一个明显过参数化的 ReLU MLP（24-24-24）——典型的过拟合场景。需要几秒钟。',
    trainTitle: '训练准确率（Training Accuracy）',
    valTitle: '验证准确率（Validation Accuracy）',
    cardStats: '训练 {train}% · 验证 {val}%',
  },

  // ---------------------------------------------------------------- CNN
  cnn: {
    kernelPreset: '卷积核预设',
    stride: '步长（Stride）= ',
    padding: '填充（Padding）= ',
    inputImage: '输入图像',
    kernel: '卷积核',
    featureMap: '特征图',
    detailTitle: '当前窗口的计算',
    windowAt: '窗口位于 (行 {r}, 列 {c}) → output[{i}, {j}]',
    products: '逐元素乘积：{products}',
    sum: 'Σ = ',
    formula: 'out = ⌊({H} + 2·{P} − {K}) / {S}⌋ + 1 = {out}',
  },

  // ---------------------------------------------------------------- Pooling
  pooling: {
    mode: '模式',
    windowSize: '窗口大小',
    stride: '步长',
    strideAuto: '= 窗口大小',
    inputMap: '输入特征图',
    outputMap: '池化输出',
    detailTitle: '当前窗口',
    windowDetail: '窗口 (行 {r}, 列 {c})：{region} → {mode} = {val} → output[{i}, {j}]',
  },
  p2: {"before": "操作前", "after": "操作后", "err": {"json": "请输入合法的 JSON。", "matrix": "{field}：请输入非空矩形二维矩阵（最多 1024 个元素）。", "finite": "{field}：数值必须有限且在支持范围内。", "config": "参数无效或超出范围：{field}。"}},
  normalization: {"values": "X [N, D] (JSON)", "kind": "方法", "epsilon": "ε", "gamma": "γ", "beta": "β", "scope": "使用当前批次统计量，ddof=0；γ/β 为标量，不包含运行统计量。常量组的方差为 0，ε 保证除法有限。", "batchAxis": "BatchNorm：沿 axis=0（N ↓）计算。每列特征为一组，样本共享该列的 μ/σ²。", "layerAxis": "LayerNorm：沿 axis=1（D →）计算。每行样本为一组，特征共享该行的 μ/σ²。", "group": "高亮归一化组", "feature": "特征 D={i}", "sample": "样本 N={i}", "stats": "各组统计量（总体方差）", "beforeHist": "操作前：所选组的分布（计数）", "afterHist": "操作后：所选组的分布（相同分箱）"},
  rf: {"inputSize": "输入尺寸", "depth": "层数", "kernel": "卷积核尺寸", "stride": "步长（Stride）", "padding": "填充（Padding）", "layer": "第 {i} 层", "mapSize": "特征图尺寸", "note": "使用方形卷积核、对称零填充，无空洞卷积。网格用于选择特征坐标，不代表激活值。", "feature": "选择特征坐标", "selectLayer": "查看层", "input": "精确输入依赖区域", "support": "第 {layer} 层特征 [{row},{col}] 依赖 {count} 个真实输入像素。", "boundsNote": "半开区间的理论边界可能延伸到填充区。橙色仅标记真实依赖像素；步长可能使边界框内出现空洞。"},
};
