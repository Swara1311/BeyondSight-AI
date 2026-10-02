type AssistantStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "permission_required";

interface StatusIndicatorProps {
  status: AssistantStatus;
}

interface StatusConfigEntry {
  label: string;
  color: string;
  pulse: boolean;
}

const statusConfig: Record<AssistantStatus, StatusConfigEntry> = {
  idle: {
    label: "Ready to listen",
    color: "bg-[var(--color-text-secondary)]",
    pulse: false,
  },
  listening: {
    label: "Listening...",
    color: "bg-[var(--color-primary)]",
    pulse: true,
  },
  processing: {
    label: "Processing...",
    color: "bg-[var(--color-warning)]",
    pulse: true,
  },
  speaking: {
    label: "Speaking...",
    color: "bg-[var(--color-success)]",
    pulse: true,
  },
  error: {
    label: "Something went wrong",
    color: "bg-[var(--color-error)]",
    pulse: false,
  },
  permission_required: {
    label: "Permission required",
    color: "bg-[var(--color-warning)]",
    pulse: false,
  },
};

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-surface)]"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-3 w-3">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
            aria-hidden="true"
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`}
          aria-hidden="true"
        />
      </span>
      <span className="text-[var(--color-text-primary)] font-medium">
        {config.label}
      </span>
    </div>
  );
}