"""P2 JSON routes: validate -> real NumPy engine -> finite JSON (no clamping)."""
from fastapi import APIRouter, Body, HTTPException
from neuroscope.core.lab_utils import LabError, finite_result
from neuroscope.core.normalization import normalization_lab

router = APIRouter(prefix="/api")


def compute(fn, *args, **kwargs):
    try:
        return finite_result(fn(*args, **kwargs))
    except LabError as exc:
        raise HTTPException(400, detail={"i18n": exc.key, "params": {"field": exc.field}}) from exc


@router.post("/normalization")
def normalization(payload: dict = Body(...)):
    return compute(normalization_lab, payload.get("values"), payload.get("kind", "batch"),
                   payload.get("epsilon", 1e-5), payload.get("gamma", 1), payload.get("beta", 0))

from neuroscope.cnn.receptive_field import receptive_field


@router.post("/receptive-field")
def receptive(payload: dict = Body(...)):
    return compute(receptive_field, payload.get("input_size", 16), payload.get("layers"),
                   payload.get("selected_layer"), payload.get("row", 0), payload.get("col", 0))
