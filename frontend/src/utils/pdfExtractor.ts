import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface PdfExtractionResult {
  text: string;
  needsOcr: boolean;
  firstPageImage: string | null;
}

export async function extractTextFromPdf(file: File): Promise<PdfExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  const maxPages = Math.min(pdf.numPages, 10);

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  const trimmedText = fullText.trim();

  if (trimmedText.length >= 20) {
    return { text: trimmedText, needsOcr: false, firstPageImage: null };
  }

  const firstPage = await pdf.getPage(1);
  const viewport = firstPage.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    await firstPage.render({ canvasContext: ctx, viewport }).promise;
    return {
      text: "",
      needsOcr: true,
      firstPageImage: canvas.toDataURL("image/png"),
    };
  }

  return { text: "", needsOcr: false, firstPageImage: null };
}