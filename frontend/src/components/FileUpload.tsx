import { useRef } from "react";
import Button from "./Button";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onClose: () => void;
}

export default function FileUpload({ onFileSelected, onClose }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col items-center justify-center gap-6 px-6"
      role="dialog"
      aria-label="Upload a file"
    >
      <p className="text-[var(--color-text-primary)] text-center max-w-xs">
        Choose an image of text or a document to read.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleChange}
        className="hidden"
        aria-label="Choose file to upload"
      />

      <Button variant="primary" size="lg" onClick={() => inputRef.current?.click()}>
        Choose File
      </Button>

      <Button variant="ghost" size="lg" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}