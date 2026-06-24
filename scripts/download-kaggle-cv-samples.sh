#!/usr/bin/env bash
# Download Kaggle datasets for FlagDown CV training / local sample frames.
#
# Setup (one-time):
#   1. Create API token: Kaggle → Account → Create New Token
#   2. mkdir -p ~/.kaggle && mv ~/Downloads/kaggle.json ~/.kaggle/
#   3. chmod 600 ~/.kaggle/kaggle.json
#   4. pip install kaggle   OR   brew install kaggle
#
# Usage:
#   npm run cv:download-samples

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/data/cv/kaggle"

if ! command -v kaggle >/dev/null 2>&1; then
  echo "kaggle CLI not found. Install: pip install kaggle"
  exit 1
fi

mkdir -p "$OUT"

echo "→ cubeai/underwater-animal-detection-for-yolov8"
kaggle datasets download -d cubeai/underwater-animal-detection-for-yolov8 -p "$OUT/underwater-yolov8" --unzip

echo "→ larusso94/shark-species (optional classification set)"
kaggle datasets download -d larusso94/shark-species -p "$OUT/shark-species" --unzip || true

echo ""
echo "Done. Datasets in: $OUT"
echo "Copy shark-positive frames to public/flagdown/cv-samples/ for demo, or train YOLOv8:"
echo "  yolo detect train data=$OUT/underwater-yolov8/data.yaml model=yolov8n.pt epochs=50"
