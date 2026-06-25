#!/usr/bin/env bash
# Download the quantized OWL-ViT ONNX model for local dev.
# In production the model is served from Vercel Blob (NEXT_PUBLIC_OWLVIT_MODEL_BASE)
# because the 156MB file exceeds Vercel's 100MB deploy limit.
set -euo pipefail

DEST="public/models/owlvit-base-patch32"
BASE="https://huggingface.co/onnx-community/owlvit-base-patch32-ONNX/resolve/main"

mkdir -p "$DEST/onnx"

echo "Downloading OWL-ViT config + tokenizer to $DEST/ ..."
for f in config.json preprocessor_config.json tokenizer_config.json special_tokens_map.json merges.txt vocab.json tokenizer.json; do
  [ -f "$DEST/$f" ] || curl -fsSL "$BASE/$f" -o "$DEST/$f"
done

echo "Downloading quantized ONNX model (~156MB) to $DEST/onnx/ ..."
if [ ! -f "$DEST/onnx/model_quantized.onnx" ]; then
  curl -fL "$BASE/onnx/model_quantized.onnx" -o "$DEST/onnx/model_quantized.onnx"
fi

echo "Done. Model ready for local dev under $DEST/."
