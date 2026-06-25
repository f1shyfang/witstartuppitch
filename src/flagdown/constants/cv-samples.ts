import type { CvAnalysisResult } from "~/flagdown/types/cv";

export type CvDemoSample = {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  datasetRef: string;
  /** Curated result — mirrors on-device OWL-ViT / Kaggle YOLO inference distribution */
  preset: CvAnalysisResult;
};

export const CV_DEMO_SAMPLES: CvDemoSample[] = [
  {
    id: "shark-aerial",
    name: "Drone frame — shark positive",
    description:
      "Simulates UAV Shark Detection / on-device OWL-ViT positive detection.",
    imagePath: "/flagdown/cv-samples/shark-aerial.jpg",
    datasetRef: "owlvit-zero-shot-marine",
    preset: {
      sharkDetected: true,
      confidence: 0.78,
      summary:
        "Shark-like object detected in drone frame (curated preset aligned with on-device OWL-ViT shark query).",
      bbox: { x: 0.38, y: 0.42, width: 0.22, height: 0.14 },
      detections: [
        {
          label: "shark in water",
          score: 0.78,
          bbox: { x: 0.38, y: 0.42, width: 0.22, height: 0.14 },
        },
        {
          label: "person swimming in water",
          score: 0.41,
          bbox: { x: 0.12, y: 0.55, width: 0.08, height: 0.12 },
        },
        {
          label: "surfer on surfboard",
          score: 0.33,
          bbox: { x: 0.7, y: 0.5, width: 0.1, height: 0.14 },
        },
      ],
      model: "preset",
      datasetRef: "owlvit-zero-shot-marine",
    },
  },
  {
    id: "clear-water",
    name: "Manly beach — clear water",
    description: "Negative control — no shark, green flag stays.",
    imagePath: "/flagdown/cv-samples/clear-water.jpg",
    datasetRef: "owlvit-zero-shot-marine",
    preset: {
      sharkDetected: false,
      confidence: 0.62,
      summary:
        "No shark-like object detected. Swimmers and surfers only — threat router stays idle.",
      detections: [
        {
          label: "person swimming in water",
          score: 0.38,
          bbox: { x: 0.3, y: 0.5, width: 0.07, height: 0.1 },
        },
        {
          label: "surfer on surfboard",
          score: 0.31,
          bbox: { x: 0.6, y: 0.45, width: 0.09, height: 0.12 },
        },
      ],
      model: "preset",
      datasetRef: "owlvit-zero-shot-marine",
    },
  },
];

export function getCvSampleById(sampleId: string) {
  return CV_DEMO_SAMPLES.find((s) => s.id === sampleId);
}
