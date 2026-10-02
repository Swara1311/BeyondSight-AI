import { useEffect } from "react";
import Button from "./Button";
import VoiceOrb from "./VoiceOrb";
import { useTextToSpeech } from "../hooks/useTextToSpeech";

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

interface NavigationViewProps {
  status: "idle" | "locating" | "routing" | "active" | "error";
  destination: string;
  steps: RouteStep[];
  currentStepIndex: number;
  totalDistance: number;
  errorMessage: string | null;
  isListening: boolean;
  onVoiceCommand: () => void;
  onNextStep: () => void;
  onRepeatStep: () => void;
  onCheckObstacles: () => void;
  onClose: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} meters`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function NavigationView({
  status,
  destination,
  steps,
  currentStepIndex,
  totalDistance,
  errorMessage,
  isListening,
  onVoiceCommand,
  onNextStep,
  onRepeatStep,
  onCheckObstacles,
  onClose,
}: NavigationViewProps) {
  const { stop } = useTextToSpeech();
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex >= steps.length - 1;

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  function handleClose() {
    stop();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col"
      role="dialog"
      aria-label="Navigation"
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-light)]">
        <span className="text-lg font-bold text-[var(--color-primary-light)]">
          Navigating to {destination}
        </span>
        <Button variant="ghost" size="md" onClick={handleClose}>
          Stop
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {status === "locating" && (
          <p className="text-[var(--color-text-secondary)]" role="status" aria-live="polite">
            Finding your location...
          </p>
        )}

        {status === "routing" && (
          <p className="text-[var(--color-text-secondary)]" role="status" aria-live="polite">
            Calculating route to {destination}...
          </p>
        )}

        {status === "error" && (
          <div className="text-center">
            <p role="alert" className="text-[var(--color-error)] mb-4">
              {errorMessage}
            </p>
            <Button variant="secondary" size="lg" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {status === "active" && currentStep && (
          <>
            <VoiceOrb isListening={isListening} onClick={onVoiceCommand} />

            <p className="text-xs text-[var(--color-text-secondary)] text-center max-w-xs">
              Say "next step", "repeat", "check obstacles", or "close"
            </p>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Total distance: {formatDistance(totalDistance)}
            </p>

            <div className="bg-[var(--color-surface)] rounded-2xl p-6 text-center max-w-sm">
              <p className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                {currentStep.instruction}
              </p>
              <p className="text-[var(--color-text-secondary)]">
                {formatDistance(currentStep.distance)}
              </p>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </>
        )}
      </div>

      {status === "active" && currentStep && (
        <div className="flex-shrink-0 flex flex-col gap-3 p-5 border-t border-[var(--color-surface-light)]">
          <Button variant="primary" size="lg" onClick={onNextStep}>
            {isLastStep ? "Finish" : "Next Step"}
          </Button>
          <Button variant="secondary" size="lg" onClick={onRepeatStep}>
            Repeat Step
          </Button>
          <Button variant="secondary" size="lg" onClick={onCheckObstacles}>
            👁️ Check for Obstacles
          </Button>
        </div>
      )}
    </div>
  );
}