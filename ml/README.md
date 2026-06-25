# FlagDown — our own shark / marine-danger detector

A custom **YOLOv8n** object detector trained on real marine imagery, exported to
ONNX (~12 MB), and run **on-device in the browser** via `onnxruntime-web`. This is
FlagDown's own model — unlike the generic OWL-ViT zero-shot detector it sits
alongside, it is fine-tuned on shark + danger classes and ships in the repo.

## Classes & danger mapping

Trained on [`cubeai/underwater-animal-detection-for-yolov8`](https://www.kaggle.com/datasets/cubeai/underwater-animal-detection-for-yolov8)
(448 train / 127 val / 63 test). Class index order matches the dataset labels:

| idx | class    | danger    | beach meaning                          |
| --- | -------- | --------- | -------------------------------------- |
| 0   | fish     | none      | benign marine life                     |
| 1   | jellyfish| moderate  | marine stingers / bluebottles          |
| 2   | penguin  | none      | benign                                 |
| 3   | auk      | none      | benign                                 |
| 4   | shark    | **high**  | fires the threat router → coordination |
| 5   | starfish | none      | benign                                 |
| 6   | stingray | moderate  | ray hazard                             |

## Train + export

```bash
# one-time: create the venv and install (Python 3.12)
python3.12 -m venv data/ml/venv
data/ml/venv/bin/pip install -r ml/requirements.txt

# download the dataset if you don't have it
npm run cv:download-samples

# train (uses MPS on Apple Silicon, CUDA if present, else CPU) + export ONNX
npm run ml:train
# or override:  EPOCHS=60 BATCH=16 data/ml/venv/bin/python ml/train_flagdown_yolo.py

# re-export from existing weights without retraining
data/ml/venv/bin/python ml/train_flagdown_yolo.py --export-only
```

Outputs:

- `data/ml/runs/flagdown-yolov8n/…` — checkpoints, curves, confusion matrix (gitignored).
- `public/models/flagdown-yolo/model.onnx` — committed; served statically to the browser.
- `public/models/flagdown-yolo/metadata.json` — class names + danger map consumed by the app.

## Browser inference

`src/flagdown/services/cv-yolo-on-device.ts` loads `model.onnx` with
`onnxruntime-web`, letterboxes the frame to 640×640, runs the model, decodes the
`[1, 4+nc, 8400]` output, and applies NMS — all client-side. The app exposes it as
a selectable on-device model next to OWL-ViT in the CV scanner.
