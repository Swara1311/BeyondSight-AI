import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";

type OcrStatus = "idle" | "processing" | "success" | "error";

interface UseOcrResult {
  status: OcrStatus;
  extractedText: string;
  errorMessage: string | null;
  runOcr: (imageData: string) => Promise<void>;
  reset: () => void;
}

export function useOcr(): UseOcrResult {
  const [status, setStatus] = useState<OcrStatus>("idle");
  const [extractedText, setExtractedText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runOcr = useCallback(async (imageData: string) => {
    setStatus("processing");
    setErrorMessage(null);
    setExtractedText("");

    try {
      const worker = await createWorker("eng");
      const result = await worker.recognize(imageData);
      await worker.terminate();

      const text = result.data.text.trim();

      if (!text) {
        setStatus("error");
        setErrorMessage("No text was found in the image. Try pointing more directly at the text.");
        return;
      }

      setExtractedText(text);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong while reading the text. Please try again.");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setExtractedText("");
    setErrorMessage(null);
  }, []);

  return { status, extractedText, errorMessage, runOcr, reset };
}