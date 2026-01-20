import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeJournal = async (content) => {
  const prompt = `
Analyze the following journal entry.

Return ONLY valid JSON in this exact format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "moodScore": number between -1 and 1,
  "summary": string (max 30 words)
}

Journal:
"""${content}"""
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
  });

  const text = response.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return {
    sentiment: parsed.sentiment ?? "neutral",
    moodScore:
      typeof parsed.moodScore === "number"
        ? Math.max(-1, Math.min(1, parsed.moodScore))
        : 0,
    summary: parsed.summary ?? null,
  };
};
