"""Square CNN receptive-field geometry, including exact (possibly sparse) support.

n' = floor((n + 2p - k)/s) + 1; j' = j*s;
r' = r + (k-1)*j; offset' = offset - p*j.
Theoretical box includes padding. Exact support walks valid intermediate
feature coordinates backwards, excluding zero padding at every layer.
"""
from neuroscope.core.lab_utils import LabError, integer


def receptive_field(input_size, layers, selected_layer=None, row=0, col=0):
    n = integer(input_size, "input_size", 1, 32)
    if not isinstance(layers, list) or not 1 <= len(layers) <= 8:
        raise LabError("p2.err.config", "layers")
    states = [{"size": n, "jump": 1, "rf": 1, "offset": 0}]
    configs = []
    for layer in layers:
        if not isinstance(layer, dict):
            raise LabError("p2.err.config", "layers")
        k = integer(layer.get("kernel", 3), "kernel", 1, 7)
        s = integer(layer.get("stride", 1), "stride", 1, 4)
        p = integer(layer.get("padding", 0), "padding", 0, 3)
        prev = states[-1]
        size = (prev['size'] + 2*p - k)//s + 1
        if not 1 <= size <= 64:
            raise LabError("p2.err.config", "feature_map_size")
        configs.append({"kernel": k, "stride": s, "padding": p})
        states.append({"size": size, "jump": prev['jump']*s,
                       "rf": prev['rf']+(k-1)*prev['jump'],
                       "offset": prev['offset']-p*prev['jump']})
    selected = len(layers) if selected_layer is None else integer(selected_layer, "selected_layer", 1, len(layers))
    state = states[selected]
    row = integer(row, "row", 0, state['size']-1)
    col = integer(col, "col", 0, state['size']-1)

    def dependencies(index):
        coords = {index}
        for i in range(selected-1, -1, -1):
            cfg = configs[i]
            coords = {q*cfg['stride'] - cfg['padding'] + u for q in coords for u in range(cfg['kernel'])
                      if 0 <= q*cfg['stride'] - cfg['padding'] + u < states[i]['size']}
        return sorted(coords)

    rows, cols = dependencies(row), dependencies(col)
    mask = [[int(r in rows and c in cols) for c in range(n)] for r in range(n)]
    top, left = state['offset']+row*state['jump'], state['offset']+col*state['jump']
    return {"input_size": n, "layers": configs, "states": states,
            "selected_layer": selected, "row": row, "col": col,
            "bounds": [top, left, top+state['rf'], left+state['rf']],
            "rows": rows, "cols": cols, "mask": mask,
            "covered_pixels": len(rows)*len(cols)}
