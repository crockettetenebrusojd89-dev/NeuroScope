"""Tiny computational-graph engine for the interactive Graph module (P0).

A fixed example graph is provided — one tanh neuron feeding a sigmoid
output with an MSE loss — plus a slightly larger two-layer variant. The
engine records a topological forward order and a reverse backward order;
each edge stores the *local* gradient d(parent)/d(child) so the UI can
display the chain rule step by step.

Graph (example "neuron")::

    x, w1, b1 -> z1 = w1*x + b1
    z1 -> a1 = tanh(z1)
    a1, w2, b2 -> z2 = w2*a1 + b2
    z2 -> a2 = sigmoid(z2)
    a2, y -> L = 0.5 (a2 - y)^2
"""

import numpy as np

from neuroscope.core.activations import sigmoid, tanh


class GNode:
    """One node: a named scalar with parents and per-edge local gradients."""

    def __init__(self, name, kind, value=None, parents=None, local_grads=None):
        self.name = name
        self.kind = kind  # "input" | "op" | "loss"
        self.value = value
        self.parents = parents or []          # list of GNode
        self.local_grads = local_grads or []  # d(self)/d(parent_i), filled at forward
        self.grad = 0.0

    def __repr__(self):
        return f"GNode({self.name}={self.value})"


def _build_neuron_graph():
    x = GNode("x", "input", 1.5)
    w1 = GNode("w1", "input", 0.8)
    b1 = GNode("b1", "input", -0.2)
    w2 = GNode("w2", "input", 1.2)
    b2 = GNode("b2", "input", 0.1)
    y = GNode("y", "input", 1.0)

    z1 = GNode("z1 = w1·x + b1", "op", parents=[w1, x, b1])
    a1 = GNode("a1 = tanh(z1)", "op", parents=[z1])
    z2 = GNode("z2 = w2·a1 + b2", "op", parents=[w2, a1, b2])
    a2 = GNode("a2 = σ(z2)", "op", parents=[z2])
    L = GNode("L = ½(a2 − y)²", "loss", parents=[a2, y])

    return [x, w1, b1, w2, b2, y, z1, a1, z2, a2, L], L


def _forward_neuron(L):
    # resolve every node by walking parents explicitly (clearer than tricks)
    (a2_node, y_node) = L.parents
    (z2_node,) = a2_node.parents
    (w2, a1_node, b2) = z2_node.parents
    (z1_node,) = a1_node.parents
    (w1, x, b1) = z1_node.parents

    z1_node.value = w1.value * x.value + b1.value
    z1_node.local_grads = [x.value, w1.value, 1.0]  # dz1/dw1, dz1/dx, dz1/db1

    a1_node.value = tanh(z1_node.value)
    a1_node.local_grads = [1.0 - a1_node.value ** 2]

    z2_node.value = w2.value * a1_node.value + b2.value
    z2_node.local_grads = [a1_node.value, w2.value, 1.0]

    a2_node.value = sigmoid(z2_node.value)
    a2_node.local_grads = [a2_node.value * (1.0 - a2_node.value)]

    L.value = 0.5 * (a2_node.value - y_node.value) ** 2
    L.local_grads = [a2_node.value - y_node.value, 0.0]

    return [z1_node, a1_node, z2_node, a2_node, L]


def run_graph(example="neuron"):
    """Execute forward + backward, returning everything the UI needs."""
    if example != "neuron":
        raise ValueError("only the 'neuron' example is available")
    nodes, L = _build_neuron_graph()
    op_order = _forward_neuron(L)

    # forward steps: inputs first (already valued), then ops in topo order
    input_nodes = [n for n in nodes if n.kind == "input"]
    forward_steps = [n.name for n in input_nodes] + [n.name for n in op_order]

    # backward: reverse topological accumulation of gradients
    backward_steps = []
    L.grad = 1.0
    backward_steps.append(L.name)
    for node in reversed(op_order):
        for parent, local in zip(node.parents, node.local_grads):
            parent.grad += node.grad * float(local)
        for parent in node.parents:
            if parent.kind == "input" and parent.name not in backward_steps:
                backward_steps.append(parent.name)

    edges = []
    for node in nodes:
        for parent, local in zip(node.parents, node.local_grads):
            edges.append(
                {
                    "from": parent.name,
                    "to": node.name,
                    "local_grad": float(local),
                }
            )

    return {
        "nodes": [
            {
                "name": n.name,
                "kind": n.kind,
                "value": float(n.value),
                "grad": float(n.grad),
            }
            for n in nodes
        ],
        "edges": edges,
        "forward_steps": forward_steps,
        "backward_steps": backward_steps,
    }
