import type { CvAnalysisResult } from "~/flagdown/types/cv";

export type CvDemoSample = {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  datasetRef: string;
  /** Curated result — mirrors YOLO inference on Kaggle/Roboflow training distribution */
  preset: CvAnalysisResult;
};

export const CV_DEMO_SAMPLES: CvDemoSample[] = [
  {
    id: "shark-aerial",
    name: "Drone frame — shark positive",
    description:
      "Simulates UAV Shark Detection / underwater-YOLOv8 positive class.",
    imagePath: "/flagdown/cv-samples/shark-aerial.jpg",
    datasetRef: "underwater-yolov8",
    preset: {
      sharkDetected: true,
      confidence: 0.91,
      summary:
        "Shark-like object detected in drone frame (preset aligned with Kaggle underwater-YOLOv8 shark class).",
      bbox: { x: 0.38, y: 0.42, width: 0.22, height: 0.14 },
      model: "preset",
      datasetRef: "underwater-yolov8",
    },
  },
  {
    id: "clear-water",
    name: "Manly beach — clear water",
    description: "Negative control — no shark, green flag stays.",
    imagePath: "/flagdown/cv-samples/clear-water.jpg",
    datasetRef: "underwater-yolov8",
    preset: {
      sharkDetected: false,
      confidence: 0.12,
      summary:
        "No shark-like object detected. Water surface and swimmers only.",
      model: "preset",
      datasetRef: "underwater-yolov8",
    },
  },
];

export function getCvSampleById(sampleId: string) {
  return CV_DEMO_SAMPLES.find((s) => s.id === sampleId);
}
