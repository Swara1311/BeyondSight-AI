import { useEffect, useRef, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useObjectDetection } from "../hooks/useObjectDetection";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useLanguage } from "../context/LanguageContext";
import { DetectionAnnouncer } from "../utils/detectionAnnouncer";
import Button from "./Button";
import VoiceOrb from "./VoiceOrb";

interface CameraViewProps {
  mode: "detect" | "capture";
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function CameraView({ mode, onCapture, onClose }: CameraViewProps) {
  const { videoRef, status, errorMessage, startCamera, stopCamera, captureFrame } = useCamera();
  const { modelStatus, detectedObjects, startDetection, stopDetection } = useObjectDetection();
  const { speak, stop } = useTextToSpeech();
  const { language, speechLang } = useLanguage();
  const announcerRef = useRef(new DetectionAnnouncer());

  useEffect(() => {
    if (status === "active" && mode === "detect" && modelStatus === "ready" && videoRef.current) {
      startDetection(videoRef.current);
    }
    return () => stopDetection();
  }, [status, mode, modelStatus, startDetection, stopDetection, videoRef]);

  useEffect(() => {
    if (mode !== "detect") return;
    const text = announcerRef.current.getAnnouncementText(detectedObjects, language);
    if (text) {
      speak(text, language);
    }
  }, [detectedObjects, mode, speak, language]);

  useEffect(() => {
    if (errorMessage) {
      speak(errorMessage, language);
    }
  }, [errorMessage, speak, language]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  function handleCapture() {
    const frame = captureFrame();
    if (frame) {
      onCapture(frame);
    }
  }

  const handleClose = useCallback(() => {
    stop();
    stopCamera();
    onClose();
  }, [stop, stopCamera, onClose]);

  const handleVoiceResult = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase();

      if (
        normalized.includes("close") ||
        normalized.includes("cancel") ||
        normalized.includes("back") ||
        normalized.includes("बंद") ||
        normalized.includes("वापस") ||
        normalized.includes("मागे")
      ) {
        handleClose();
        return;
      }

      if (
        mode === "capture" &&
        (normalized.includes("capture") ||
          normalized.includes("take photo") ||
          normalized.includes("खींचो") ||
          normalized.includes("काढा"))
      ) {
        handleCapture();
        return;
      }
    },
    [handleClose, mode]
  );

  const { isListening, startListening } = useSpeechRecognition(handleVoiceResult);

  function handleVoiceOrbClick() {
    stop();
    startListening(speechLang);
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      style={{ height: "100dvh" }}
      role="dialog"
      aria-label="Camera view"
    >
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${
            status === "active" ? "block" : "hidden"
          }`}
          playsInline
          muted
          aria-label="Live camera feed"
        />

        {status === "active" && mode === "detect" && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            {detectedObjects.map((obj, i) => {
              const [x, y, width, height] = obj.bbox;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={3}
                    rx={8}
                  />
                  <text
                    x={x}
                    y={y > 20 ? y - 8 : y + 20}
                    fill="#22c55e"
                    fontSize={16}
                    fontWeight="bold"
                  >
                    {obj.class} ({Math.round(obj.score * 100)}%)
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {status === "active" && mode === "detect" && modelStatus === "loading" && (
          <p className="absolute top-4 left-4 right-4 text-center text-white bg-black/60 rounded-lg py-2 z-10">
            Loading detection model...
          </p>
        )}

        {status === "active" && (
          <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
            <VoiceOrb isListening={isListening} onClick={handleVoiceOrbClick} />
          </div>
        )}

        {status === "idle" && (
          <div className="relative text-center px-6 z-10">
            <p className="text-[var(--color-text-primary)] mb-4">
              Camera access is needed for this feature.
            </p>
            <Button variant="primary" size="lg" onClick={startCamera}>
              Turn On Camera
            </Button>
          </div>
        )}

        {status === "requesting" && (
          <p className="relative text-[var(--color-text-secondary)] z-10">
            Requesting camera access...
          </p>
        )}

        {(status === "denied" || status === "unavailable" || status === "error") && (
          <div className="relative text-center px-6 z-10">
            <p role="alert" className="text-[var(--color-error)] mb-4">
              {errorMessage}
            </p>
            <Button variant="secondary" size="lg" onClick={startCamera}>
              Try Again
            </Button>
          </div>
        )}

        {status === "active" && (
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 z-20 px-6">
            <p className="text-xs text-white bg-black/60 rounded-lg px-3 py-1.5 text-center">
              Say "close" to go back{mode === "capture" ? ', or "capture" to take a photo' : ""}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="lg" onClick={handleClose}>
                Cancel
              </Button>
              {mode === "capture" && (
                <Button variant="primary" size="xl" onClick={handleCapture}>
                  Capture
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {status !== "active" && (
        <div className="flex-shrink-0 flex items-center justify-center gap-4 p-6 bg-[var(--color-background)]">
          <Button variant="ghost" size="lg" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}