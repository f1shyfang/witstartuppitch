#!/usr/bin/env bash
# Optional: download the OWL-ViT ONNX model + config for offline local dev.
# In production the model is served from Vercel Blob (NEXT_PUBLIC_OWLVIT_MODEL_BASE).
# In dev the app fetches from Hugging Face by default; this script is only needed
# if you want a local copy under data/models (gitignored).
set -euo pipefail

DEST="${1:-data/models/owlvit-base-patch32}"
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

echo "Done. Local model ready under $DEST/ (gitignored)."

