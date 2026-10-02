import { useState, useRef, useCallback, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

type ModelStatus = "loading" | "ready" | "error";

interface UseObjectDetectionResult {
  modelStatus: ModelStatus;
  detectedObjects: DetectedObject[];
  startDetection: (videoElement: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function useObjectDetection(): UseObjectDetectionResult {
  const [modelStatus, setModelStatus] = useState<ModelStatus>("loading");
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        await tf.ready();
        const model = await cocoSsd.load();
        if (isMounted) {
          modelRef.current = model;
          setModelStatus("ready");
        }
      } catch {
        if (isMounted) setModelStatus("error");
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      if (!modelRef.current || videoElement.readyState !== 4) return;

      try {
        const predictions = await modelRef.current.detect(videoElement);
        const filtered = predictions
          .filter((p) => p.score > 0.6)
          .map((p) => ({
            class: p.class,
            score: p.score,
            bbox: p.bbox as [number, number, number, number],
          }));
        setDetectedObjects(filtered);
      } catch {
        // ignore individual frame errors
      }
    }, 1000);
  }, []);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDetectedObjects([]);
  }, []);

  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  return { modelStatus, detectedObjects, startDetection, stopDetection };
}