# Learning Path

The home page is the default route (`/` or `/#home`). It links to the existing
18 labs; it adds navigation, not a new deep learning model.

## Recommended routes

- **A — Deep Learning Foundations:** Tensor → Activations → Loss → Graph → Backprop → Optimization.
- **B — Computer Vision Foundations:** Tensor → Backprop → Convolution → Pooling → Receptive Field → Residual → Normalization.
- **C — Attention Foundations:** Tensor → Activations → Loss → Normalization → Self-Attention → Multi-Head Attention.

Route C includes Activations because its existing softmax calculation supplies
an important prerequisite. Loss connects softmax to a learning objective.

## Complete concept sequence

Tensor → Activations → Loss → Computational Graph → Backprop → Initialization
→ Optimization → Regularization → Convolution → Pooling → Receptive Field
→ Residual → Normalization → Self-Attention → Multi-Head Attention.

We keep the requested concept order: see the chain rule before parameter
updates, local CNN windows before deeper dependencies, then skip paths and
normalization before attention. Playground, Gradient Diagnostics, and Learning
Rate are companion experiments rather than extra stops in the main chain.
The numbered cards read left to right, then top to bottom, and become one
column on narrow screens. Difficulty labels describe the math assumed, not
an assessment or measured learning outcome.

All new labels use the existing locale dictionaries. Buttons select a route;
ordinary links open the lab. There is no account, database, progress tracker,
or fabricated completion score.
