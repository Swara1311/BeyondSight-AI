function isMostlyDevanagari(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const devanagari = letters.filter((c) => /[\u0900-\u097F]/.test(c)).length;
  return devanagari / letters.length > 0.3;
}

function tokenize(sentence: string): string[] {
  return sentence.toLowerCase().match(/[\p{L}\p{M}]{3,}/gu) ?? [];
}

function extractiveSummary(text: string, maxSentences = 4): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length <= maxSentences) {
    return sentences.join(" ") || text.slice(0, 400);
  }

  const wordFrequency = new Map<string, number>();
  sentences.forEach((sentence) => {
    tokenize(sentence).forEach((word) => {
      wordFrequency.set(word, (wordFrequency.get(word) ?? 0) + 1);
    });
  });

  const scored = sentences.map((sentence, index) => {
    const words = tokenize(sentence);
    const total = words.reduce((sum, word) => sum + (wordFrequency.get(word) ?? 0), 0);
    return { sentence, index, score: total / Math.max(words.length, 1) };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence)
    .join(" ");
}

export async function summarizeText(text: string): Promise<string> {
  // The AI model (BART) understands English only, so Hindi/Marathi text uses the basic summary.
  if (isMostlyDevanagari(text)) {
    return extractiveSummary(text);
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    console.error("HUGGINGFACE_API_KEY is not set. Using basic summary.");
    return extractiveSummary(text);
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text.slice(0, 3000) }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0]?.summary_text) {
        return data[0].summary_text;
      }
      console.error("Hugging Face unexpected response:", JSON.stringify(data).slice(0, 300));
    } else {
      const body = await response.text();
      console.error("Hugging Face API error:", response.status, body.slice(0, 300));
    }
  } catch (error) {
    console.error("Hugging Face request failed:", error);
  }

  return extractiveSummary(text);
}