import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeJournal = async (content) => {
  try {
    const prompt = `
Analyze the following journal entry.

Return ONLY valid JSON in this exact format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "moodScore": number between 0 and 1 (0=very negative, 0.5=neutral, 1=very positive),
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
    console.log("AI Raw Response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Raw text was:", text);
      throw new Error("AI returned invalid JSON");
    }

    const result = {
      sentiment: parsed.sentiment ?? "neutral",
      moodScore:
        typeof parsed.moodScore === "number"
          ? Math.max(0, Math.min(1, parsed.moodScore))
          : 0.5,
      summary: parsed.summary ?? null,
    };

    console.log("AI Analysis Result:", result);
    return result;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    if (error.response) {
      console.error("OpenAI API Error:", error.response.status, error.response.data);
    }
    throw error;
  }
};
