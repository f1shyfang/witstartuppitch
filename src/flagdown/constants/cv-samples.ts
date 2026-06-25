import type { CvAnalysisResult } from "~/flagdown/types/cv";

export type CvDemoSample = {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  datasetRef: string;
  /** Curated result — mirrors FlagDown YOLO / on-device inference distribution */
  preset: CvAnalysisResult;
};

export const CV_DEMO_SAMPLES: CvDemoSample[] = [
  {
    id: "reef-shark",
    name: "Reef cam — shark",
    description:
      "Real marine frame from our training distribution — FlagDown YOLO detects multiple sharks.",
    imagePath: "/flagdown/cv-samples/reef-shark.jpg",
    datasetRef: "kaggle/underwater-yolov8",
    preset: {
      sharkDetected: true,
      confidence: 0.92,
      summary:
        "FlagDown YOLO: SHARK detected — multiple sharks + a stingray in frame.",
      bbox: { x: 0.575, y: 0.525, width: 0.27, height: 0.146 },
      detections: [
        {
          label: "shark",
          score: 0.92,
          bbox: { x: 0.575, y: 0.525, width: 0.27, height: 0.146 },
          danger: "high",
        },
        {
          label: "shark",
          score: 0.74,
          bbox: { x: 0.195, y: 0.171, width: 0.155, height: 0.117 },
          danger: "high",
        },
        {
          label: "stingray",
          score: 0.55,
          bbox: { x: 0.818, y: 0.846, width: 0.098, height: 0.067 },
          danger: "moderate",
        },
        {
          label: "fish",
          score: 0.41,
          bbox: { x: 0.608, y: 0.067, width: 0.086, height: 0.1 },
          danger: "none",
        },
      ],
      model: "preset",
      datasetRef: "kaggle/underwater-yolov8",
      topDanger: "high",
    },
  },
  {
    id: "reef-jellyfish",
    name: "Reef cam — jellyfish",
    description:
      "Marine stingers, no shark — FlagDown YOLO flags a moderate hazard (caution).",
    imagePath: "/flagdown/cv-samples/reef-jellyfish.jpg",
    datasetRef: "kaggle/underwater-yolov8",
    preset: {
      sharkDetected: false,
      confidence: 0.62,
      summary:
        "FlagDown YOLO: no shark, but a bloom of jellyfish (marine stingers) — caution.",
      detections: [
        {
          label: "jellyfish",
          score: 0.62,
          bbox: { x: 0.561, y: 0.0, width: 0.23, height: 0.317 },
          danger: "moderate",
        },
        {
          label: "jellyfish",
          score: 0.54,
          bbox: { x: 0.402, y: 0.046, width: 0.21, height: 0.225 },
          danger: "moderate",
        },
        {
          label: "jellyfish",
          score: 0.48,
          bbox: { x: 0.721, y: 0.204, width: 0.161, height: 0.217 },
          danger: "moderate",
        },
      ],
      model: "preset",
      datasetRef: "kaggle/underwater-yolov8",
      topDanger: "moderate",
    },
  },
  {
    id: "reef-clear",
    name: "Reef cam — clear",
    description: "Benign marine life only — negative control, green flag stays.",
    imagePath: "/flagdown/cv-samples/reef-clear.jpg",
    datasetRef: "kaggle/underwater-yolov8",
    preset: {
      sharkDetected: false,
      confidence: 0.5,
      summary:
        "FlagDown YOLO: only fish detected — no shark or marine hazard. Threat router idle.",
      detections: [
        {
          label: "fish",
          score: 0.5,
          bbox: { x: 0.406, y: 0.332, width: 0.349, height: 0.177 },
          danger: "none",
        },
        {
          label: "fish",
          score: 0.44,
          bbox: { x: 0.753, y: 0.142, width: 0.245, height: 0.2 },
          danger: "none",
        },
      ],
      model: "preset",
      datasetRef: "kaggle/underwater-yolov8",
      topDanger: "none",
    },
  },
  {
    id: "shark-aerial",
    name: "Drone aerial — shark",
    description:
      "Aerial drone frame — best read by the OWL-ViT zero-shot model or preset.",
    imagePath: "/flagdown/cv-samples/shark-aerial.jpg",
    datasetRef: "owlvit-zero-shot-marine",
    preset: {
      sharkDetected: true,
      confidence: 0.78,
      summary:
        "Shark detected in drone frame (curated preset aligned with FlagDown YOLO danger classes).",
      bbox: { x: 0.38, y: 0.42, width: 0.22, height: 0.14 },
      detections: [
        {
          label: "shark",
          score: 0.78,
          bbox: { x: 0.38, y: 0.42, width: 0.22, height: 0.14 },
          danger: "high",
        },
        {
          label: "stingray",
          score: 0.44,
          bbox: { x: 0.12, y: 0.55, width: 0.1, height: 0.09 },
          danger: "moderate",
        },
        {
          label: "fish",
          score: 0.33,
          bbox: { x: 0.7, y: 0.5, width: 0.1, height: 0.08 },
          danger: "none",
        },
      ],
      model: "preset",
      datasetRef: "kaggle/underwater-yolov8",
      topDanger: "high",
    },
  },
  {
    id: "clear-water",
    name: "Drone aerial — clear",
    description: "Aerial negative control — no shark, green flag stays.",
    imagePath: "/flagdown/cv-samples/clear-water.jpg",
    datasetRef: "owlvit-zero-shot-marine",
    preset: {
      sharkDetected: false,
      confidence: 0.62,
      summary:
        "No shark or marine hazard detected. Benign marine life only — threat router stays idle.",
      detections: [
        {
          label: "fish",
          score: 0.38,
          bbox: { x: 0.3, y: 0.5, width: 0.07, height: 0.1 },
          danger: "none",
        },
        {
          label: "penguin",
          score: 0.31,
          bbox: { x: 0.6, y: 0.45, width: 0.09, height: 0.12 },
          danger: "none",
        },
      ],
      model: "preset",
      datasetRef: "kaggle/underwater-yolov8",
      topDanger: "none",
    },
  },
];

export function getCvSampleById(sampleId: string) {
  return CV_DEMO_SAMPLES.find((s) => s.id === sampleId);
}
