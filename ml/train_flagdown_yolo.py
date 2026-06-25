#!/usr/bin/env python3
"""Train FlagDown's own shark / marine-danger detector (YOLOv8n).

Trains on the Kaggle "underwater animal detection for YOLOv8" set already
downloaded to data/cv/kaggle/underwater-yolov8 (7 classes; shark + stingray +
jellyfish are our "danger" classes). Exports a small ONNX (~12MB) that runs
on-device in the browser via onnxruntime-web.

Usage (from repo root, inside the venv):
    data/ml/venv/bin/python ml/train_flagdown_yolo.py            # train + export
    EPOCHS=60 data/ml/venv/bin/python ml/train_flagdown_yolo.py  # override epochs
    data/ml/venv/bin/python ml/train_flagdown_yolo.py --export-only  # skip training

Outputs:
    data/ml/runs/...                       # ultralytics run dir (gitignored)
    public/models/flagdown-yolo/model.onnx # committed, served to the browser
    public/models/flagdown-yolo/metadata.json
"""

from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = REPO_ROOT / "data" / "cv" / "kaggle" / "underwater-yolov8"
WORK_DIR = REPO_ROOT / "data" / "ml"
RUN_DIR = WORK_DIR / "runs"
RESOLVED_YAML = WORK_DIR / "flagdown-data.yaml"
OUT_DIR = REPO_ROOT / "public" / "models" / "flagdown-yolo"

# Index order MUST match the label files (0..6) in the Kaggle dataset, whose
# data.yaml ships Chinese names: 鱼 水母 企鹅 角嘴海雀 鲨鱼 海星 黄貂鱼.
CLASS_NAMES = ["fish", "jellyfish", "penguin", "auk", "shark", "starfish", "stingray"]

# How each class maps onto FlagDown's beach-safety "danger" model.
#   high     -> fires the threat router (shark)
#   moderate -> caution flag (marine stingers / rays — real AU beach hazards)
#   none     -> benign marine life
DANGER_BY_CLASS = {
    "shark": "high",
    "stingray": "moderate",
    "jellyfish": "moderate",
    "fish": "none",
    "penguin": "none",
    "auk": "none",
    "starfish": "none",
}

IMG_SIZE = int(os.environ.get("IMGSZ", "640"))
EPOCHS = int(os.environ.get("EPOCHS", "100"))
BATCH = int(os.environ.get("BATCH", "16"))
PATIENCE = int(os.environ.get("PATIENCE", "25"))
OPSET = int(os.environ.get("OPSET", "12"))  # opset 12 = broad onnxruntime-web support


def pick_device() -> str:
    import torch

    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "0"
    return "cpu"


def write_resolved_yaml() -> Path:
    """Write a data.yaml with an absolute path + English names so training is
    reproducible regardless of CWD (the dataset's own yaml uses Chinese names)."""
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    yaml_text = (
        f"path: {DATASET_DIR.as_posix()}\n"
        f"train: train/images\n"
        f"val: valid/images\n"
        f"test: test/images\n\n"
        f"nc: {len(CLASS_NAMES)}\n"
        f"names: {CLASS_NAMES}\n"
    )
    RESOLVED_YAML.write_text(yaml_text)
    return RESOLVED_YAML


def export_and_publish(model) -> None:
    """Export the trained best.pt to ONNX and publish it to public/models."""
    onnx_path = model.export(
        format="onnx",
        opset=OPSET,
        imgsz=IMG_SIZE,
        dynamic=False,
        simplify=True,
        nms=False,  # we run NMS in TS so the graph stays ORT-web friendly
    )
    onnx_path = Path(onnx_path)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    dest = OUT_DIR / "model.onnx"
    shutil.copy2(onnx_path, dest)

    metadata = {
        "name": "flagdown-yolov8n",
        "task": "detection",
        "framework": "ultralytics-yolov8",
        "imgsz": IMG_SIZE,
        "opset": OPSET,
        "names": CLASS_NAMES,
        "danger": DANGER_BY_CLASS,
        "dangerClasses": [c for c, d in DANGER_BY_CLASS.items() if d != "none"],
        "trainedOn": "kaggle:cubeai/underwater-animal-detection-for-yolov8",
        "outputLayout": "[1, 4+nc, 8400] (xywh + per-class scores, transpose then NMS)",
    }
    (OUT_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")

    size_mb = dest.stat().st_size / 1e6
    print(f"\n✓ Published ONNX → {dest.relative_to(REPO_ROOT)} ({size_mb:.1f} MB)")
    print(f"✓ Metadata     → {(OUT_DIR / 'metadata.json').relative_to(REPO_ROOT)}")


def main() -> int:
    if not DATASET_DIR.exists():
        print(f"Dataset not found: {DATASET_DIR}", file=sys.stderr)
        print("Run: npm run cv:download-samples", file=sys.stderr)
        return 1

    from ultralytics import YOLO

    export_only = "--export-only" in sys.argv
    device = pick_device()
    print(f"Device: {device} · imgsz={IMG_SIZE} · epochs={EPOCHS} · batch={BATCH}")

    if export_only:
        best = RUN_DIR / "flagdown-yolov8n" / "weights" / "best.pt"
        if not best.exists():
            print(f"No trained weights at {best}; run without --export-only first.")
            return 1
        export_and_publish(YOLO(str(best)))
        return 0

    data_yaml = write_resolved_yaml()
    print(f"Resolved dataset yaml → {data_yaml.relative_to(REPO_ROOT)}")

    model = YOLO("yolov8n.pt")  # COCO-pretrained backbone, fine-tune on our classes
    model.train(
        data=str(data_yaml),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH,
        patience=PATIENCE,
        device=device,
        project=str(RUN_DIR),
        name="flagdown-yolov8n",
        exist_ok=True,
        plots=True,
        seed=0,
    )

    metrics = model.val(data=str(data_yaml), device=device)
    try:
        print(f"\nmAP50: {metrics.box.map50:.3f} · mAP50-95: {metrics.box.map:.3f}")
    except Exception:  # noqa: BLE001 - metrics shape varies by version
        pass

    export_and_publish(model)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
