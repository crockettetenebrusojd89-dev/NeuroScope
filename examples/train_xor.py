"""Train a small MLP on XOR using only the NeuroScope engine.

Run from the project root:  python examples/train_xor.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from neuroscope.core.network import MLP
from neuroscope.datasets.datasets import make_dataset
from neuroscope.optimizers.optimizers import Adam


def main():
    X, y = make_dataset("xor", n_samples=600, noise=0.05, seed=42)
    net = MLP([2, 8, 8, 1], hidden_activation="tanh", output_mode="binary", seed=0)
    opt = Adam(lr=0.02)

    for epoch in range(1, 601):
        loss = net.step(opt, X, y)
        if epoch % 100 == 0:
            print(f"epoch {epoch:4d}  loss {loss:.4f}  acc {net.accuracy(X, y):.3f}")


if __name__ == "__main__":
    main()
