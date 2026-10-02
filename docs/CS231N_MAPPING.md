# CS231n topic companions

NeuroScope is an independent educational project, not affiliated with Stanford.
This is our topic-level mapping to help choose experiments while reading a
course. It does not reproduce lecture slides or claim full course coverage.

Sources checked on 2026-10-02: the [official Spring 2026 schedule](https://cs231n.stanford.edu/schedule.html)
and [official course notes](https://cs231n.github.io/). We use topic names
rather than lecture numbers because schedules and coverage vary by year.

| Related topic | Existing NeuroScope labs | What to explore / scope |
|---|---|---|
| NumPy arrays | Tensor & Shape | Shapes, axes, broadcasting, matrix multiplication; see the [NumPy tutorial](https://cs231n.github.io/python-numpy-tutorial/). |
| Linear classifiers / softmax loss | Loss, Activations | Softmax and its loss/derivatives; not a complete classification assignment. [Linear classification](https://cs231n.github.io/linear-classify/) |
| Backpropagation | Graph, Backprop, Gradient Diagnostics | Chain rule, local derivatives and layer gradient norms. [Backprop notes](https://cs231n.github.io/optimization-2/) |
| Neural networks | Activations, Playground | Nonlinearity, small MLP architecture, live 2D classification. [Neural networks](https://cs231n.github.io/neural-networks-1/) |
| Training neural networks | Initialization, Learning Rate | Activation/gradient scales and step-size effects. [Training notes](https://cs231n.github.io/neural-networks-2/) |
| Optimization / regularization | Optimization, Regularization, Learning Rate | Real optimizer paths and train/validation comparisons. [Learning and evaluation](https://cs231n.github.io/neural-networks-3/) |
| Convolutional networks | Convolution, Pooling, Receptive Field | Sliding windows, output shapes, exact input dependencies. [CNN notes](https://cs231n.github.io/convolutional-networks/) |
| CNN architectures | Residual, Normalization | Shared-weight gradient transport and 2D training-batch statistics; not full ResNet training. [Official topic schedule](https://cs231n.stanford.edu/schedule.html) |
| Self-attention | Self-Attention, Multi-Head Attention | Q/K/V, score scaling, softmax, concat/projection; untrained numeric embeddings, not a complete Transformer. [Official topic schedule](https://cs231n.stanford.edu/schedule.html) |

LayerNorm is a related companion to attention; the mapping does not claim a
specific lecture teaches every option in a lab. Use the original course for
assignments, detailed derivations, and assessment.
