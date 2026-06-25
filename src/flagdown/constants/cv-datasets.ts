/**
 * Shark / marine CV datasets researched for FlagDown (Kaggle + related).
 * Download locally: npm run cv:download-samples (requires Kaggle API credentials).
 */
export const KAGGLE_CV_DATASETS = [
  {
    id: "underwater-yolov8",
    name: "Underwater animal detection for YOLOv8",
    url: "https://www.kaggle.com/datasets/cubeai/underwater-animal-detection-for-yolov8",
    kaggleRef: "cubeai/underwater-animal-detection-for-yolov8",
    images: 1277,
    sizeMb: 70,
    sizeUnzippedMb: 70,
    format: "YOLOv8",
    classes: [
      "fish",
      "jellyfish",
      "penguin",
      "auk",
      "shark",
      "starfish",
      "stingray",
    ],
    pitchLine:
      "1,277 annotated frames — shark class included. FlagDown YOLOv8n is trained on this set.",
  },
  {
    id: "shark-species",
    name: "Shark species",
    url: "https://www.kaggle.com/datasets/larusso94/shark-species",
    kaggleRef: "larusso94/shark-species",
    images: 1529,
    sizeMb: 598,
    sizeUnzippedMb: 608,
    format: "Image classification",
    classes: ["multiple shark species"],
    pitchLine: "Species-level labels for fine-tuning confidence thresholds.",
  },
] as const;

/** Related aerial UAV datasets (Roboflow — cited in marine CV literature) */
export const RELATED_CV_DATASETS = [
  {
    name: "UAV Shark Detection",
    url: "https://universe.roboflow.com/piies-workspace/uav-shark-detection-yp282",
    images: 960,
    pitchLine: "Drone aerial footage — closest match to Manly patrol CV.",
  },
  {
    name: "marine-sharks (RF100-VL)",
    url: "https://universe.roboflow.com/rf100-vl/marine-sharks-jqnfk-skffz-iflt",
    images: 3420,
    pitchLine: "Shark, person, boat from aerial — multi-class beach context.",
  },
] as const;
