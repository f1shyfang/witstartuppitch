#!/usr/bin/env python3
"""Build demo frames for the FlagDown CV scanner from real dataset images.

The scanner shows frames in a 16:10 box with object-cover, and overlays boxes
using normalized coords. Portrait dataset photos would be cropped/misaligned, so
we pre-crop a 16:10 window centered on the hazard(s) and resize to 1024×640.

Also prints the in-frame normalized detections so the curated presets in
src/flagdown/constants/cv-samples.ts can match what the model sees.

Run: data/ml/venv/bin/python ml/make_demo_frames.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[1]
VAL = REPO / "data" / "cv" / "kaggle" / "underwater-yolov8" / "valid"
OUT = REPO / "public" / "flagdown" / "cv-samples"

NAMES = ["fish", "jellyfish", "penguin", "auk", "shark", "starfish", "stingray"]
DANGER = {"shark": "high", "stingray": "moderate", "jellyfish": "moderate"}
HAZARD_CLS = {1, 4, 6}  # jellyfish, shark, stingray
TARGET_AR = 16 / 10
OUT_W, OUT_H = 1024, 640

# (val image stem, output filename)
FRAMES = [
    ("IMG_2492_jpeg_jpg.rf.7fdeedc3c5005ba50a3295f08f0b54d5", "reef-shark.jpg"),
    ("IMG_2464_jpeg_jpg.rf.0121fe35073ca26afded76a7a51c9951", "reef-jellyfish.jpg"),
    ("IMG_2277_jpeg_jpg.rf.86c72d6192da48d941ffa957f4780665", "reef-clear.jpg"),
]


def parse_label(path: Path):
    boxes = []
    if not path.exists():
        return boxes
    for line in path.read_text().splitlines():
        parts = line.split()
        if len(parts) != 5:
            continue
        cls = int(parts[0])
        cx, cy, w, h = (float(v) for v in parts[1:])
        boxes.append((cls, cx, cy, w, h))
    return boxes


def crop_window(W, H, boxes):
    """16:10 window, max area, centered on hazard centroid (or image center)."""
    if W / H > TARGET_AR:
        cw, ch = int(H * TARGET_AR), H
    else:
        cw, ch = W, int(W / TARGET_AR)

    hz = [b for b in boxes if b[0] in HAZARD_CLS]
    ref = hz or boxes
    if ref:
        cx = sum(b[1] for b in ref) / len(ref) * W
        cy = sum(b[2] for b in ref) / len(ref) * H
    else:
        cx, cy = W / 2, H / 2

    x0 = int(min(max(0, cx - cw / 2), W - cw))
    y0 = int(min(max(0, cy - ch / 2), H - ch))
    return x0, y0, cw, ch


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for stem, out_name in FRAMES:
        img_path = VAL / "images" / f"{stem}.jpg"
        if not img_path.exists():
            print(f"skip (missing): {img_path}")
            continue
        img = Image.open(img_path).convert("RGB")
        W, H = img.size
        boxes = parse_label(VAL / "labels" / f"{stem}.txt")
        x0, y0, cw, ch = crop_window(W, H, boxes)
        crop = img.crop((x0, y0, x0 + cw, y0 + ch)).resize((OUT_W, OUT_H))
        crop.save(OUT / out_name, quality=88)

        dets = []
        for cls, bcx, bcy, bw, bh in boxes:
            px, py = bcx * W, bcy * H
            pw, ph = bw * W, bh * H
            nx = (px - x0) / cw
            ny = (py - y0) / ch
            nw, nh = pw / cw, ph / ch
            if nx < 0 or nx > 1 or ny < 0 or ny > 1:
                continue  # center outside crop
            label = NAMES[cls] if 0 <= cls < len(NAMES) else f"class_{cls}"
            dets.append(
                {
                    "label": label,
                    "danger": DANGER.get(label, "none"),
                    "bbox": {
                        "x": round(max(0, nx - nw / 2), 3),
                        "y": round(max(0, ny - nh / 2), 3),
                        "width": round(nw, 3),
                        "height": round(nh, 3),
                    },
                }
            )
        print(f"\n=== {out_name} ({W}x{H} -> {OUT_W}x{OUT_H}) ===")
        print(json.dumps(dets, indent=2))
    print(f"\nSaved frames to {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
