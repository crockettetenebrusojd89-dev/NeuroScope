# Math Notes

Derivations for everything NeuroScope computes. Notation: `x` input row-batch,
`W, b` layer parameters, `z = xW + b` pre-activation, `a = f(z)` activation.

## 1. Linear layer

Forward: `z = x W + b`

Given upstream gradient `G = ∂L/∂z`:

- `∂L/∂W = xᵀ G`
- `∂L/∂b = Σ_rows G`
- `∂L/∂x = G Wᵀ`

(`layers/linear.py`)

## 2. Activations

| name | f(x) | f′(x) |
|---|---|---|
| ReLU | max(0, x) | 1 if x>0 else 0 |
| Sigmoid | 1/(1+e⁻ˣ) | σ(x)(1−σ(x)) |
| Tanh | tanh(x) | 1−tanh²(x) |
| Leaky ReLU | x if x>0 else αx | 1 if x>0 else α |
| GELU (tanh approx) | 0.5x(1+tanh(√(2/π)(x+0.044715x³))) | 0.5(1+t) + 0.5x(1−t²)√(2/π)(1+3·0.044715x²), t = tanh(·) |
| Softmax | eˣⁱ/Σeˣʲ | Jacobian: sᵢ(δᵢⱼ−sⱼ); diagonal: sᵢ(1−sᵢ) |

(`core/activations.py`)

## 3. Losses and the fused-output trick

**MSE**: `L = mean((p−y)²)`, `∂L/∂p = 2(p−y)/N`.

**Binary cross entropy** on probabilities: `L = −mean(y log p + (1−y) log(1−p))`.

**Fused sigmoid + BCE** — with `p = σ(z)`:

```
∂L/∂z = ∂L/∂p · ∂p/∂z = (−y/p + (1−y)/(1−p)) · p(1−p) = p − y   (÷ n for the mean)
```

This avoids `log(0)` and one full elementwise division — used in
`network.MLP.backward` for binary tasks.

**Fused softmax + cross entropy** — with `p = softmax(z)` and one-hot `y`:

```
∂L/∂z = p − y_onehot   (÷ n)
```

(`losses/losses.py`)

## 4. MLP backward pass

For layers `l = L…1` with hidden activation `f`:

```
G_L = (p − y)/n                      # fused output gradient
for l = L−1 … 1:  G = G ⊙ f′(z_l)    # through the activation
dW_l = a_{l−1}ᵀ G,  db_l = Σ G,  G ← G W_lᵀ
```

L2 adds `λW` to `dW`; L1 adds `λ·sign(W)`. Dropout multiplies both the
forward activation and the backward `G` by the same mask.

## 5. Optimizers

```
SGD:       p ← p − η g
Momentum:  v ← μv − η g;            p ← p + v
RMSProp:   s ← βs + (1−β)g²;        p ← p − η g / (√s + ε)
Adam:      m ← β₁m + (1−β₁)g;  v ← β₂v + (1−β₂)g²
           m̂ = m/(1−β₁ᵗ);  v̂ = v/(1−β₂ᵗ)
           p ← p − η m̂ / (√v̂ + ε)
```

(`optimizers/optimizers.py`)

## 6. Initialization

Variance of activations through a layer stays roughly constant when

```
Var(W) = 2/(fan_in + fan_out)   (Xavier, for tanh/sigmoid)
Var(W) = 2/fan_in               (He, for ReLU)
```

Zeros: every neuron in a layer computes the same thing forever (symmetry).
Too large: pre-activations saturate tanh/sigmoid → gradients vanish.

## 7. Convolution & pooling

Cross-correlation (what deep learning calls "convolution"):

```
out[i,j] = Σ_{u,v} x[i·S+u, j·S+v] · K[u,v]
out_size = ⌊(H + 2P − K)/S⌋ + 1
```

Max pooling keeps the strongest feature in each window; average pooling
smooths. Both are computed with explicit loops and the window coordinates
are returned for UI animation (`cnn/conv.py`).

## 8. Normalization

For X[N,D], BatchNorm reduces axis=0; LayerNorm reduces axis=1.
Population variance (ddof=0): μ=mean(x), σ²=mean((x−μ)²).
`y = γ (x−μ) / sqrt(σ²+ε) + β`. After affine normalization,
mean is β and variance is `γ²σ²/(σ²+ε)`, including zero for constant groups.
This lab uses current-batch statistics and scalar γ/β; inference running
statistics and convolutional BatchNorm are outside its scope.
