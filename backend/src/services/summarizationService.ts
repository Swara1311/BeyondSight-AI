export async function summarizeText(text: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("Summarization service is not configured.");
  }

  const truncatedText = text.slice(0, 3000);

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: truncatedText }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Hugging Face API error:", response.status, errorText);
    throw new Error("Summarization service is temporarily unavailable.");
  }

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.summary_text) {
    return data[0].summary_text;
  }

  throw new Error("Could not generate a summary for this text.");
}