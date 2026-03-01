const HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models";
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL ??
  "cardiffnlp/twitter-roberta-base-sentiment-latest";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

const getHuggingFaceSentiment = async (content) => {
  const response = await fetch(`${HUGGINGFACE_API_URL}/${HUGGINGFACE_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: content }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const scores = Array.isArray(data)
    ? Array.isArray(data[0])
      ? data[0]
      : data
    : [];

  if (!scores.length) {
    return { sentiment: "neutral", moodScore: 0.5 };
  }

  const best = scores.reduce((current, item) =>
    item.score > current.score ? item : current
  );
  const label = String(best.label ?? "").toLowerCase();

  if (label.includes("pos")) {
    const score = Math.max(0, Math.min(1, best.score));
    return {
      sentiment: score < 0.55 ? "neutral" : "positive",
      moodScore: score,
    };
  }

  if (label.includes("neg")) {
    const score = Math.max(0, Math.min(1, 1 - best.score));
    return {
      sentiment: score > 0.45 ? "neutral" : "negative",
      moodScore: score,
    };
  }

  return { sentiment: "neutral", moodScore: 0.5 };
};

const getGroqSummary = async (content) => {
  const prompt = `Summarize the journal entry in 100 words or fewer as if talking to the user . Return plain text only.\n\nJournal:\n"""${content}"""`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? null;
};

export const analyzeJournal = async (content) => {
  try {
    const [sentimentResult, summary] = await Promise.all([
      getHuggingFaceSentiment(content),
      getGroqSummary(content),
    ]);

    const result = {
      sentiment: sentimentResult.sentiment,
      moodScore: sentimentResult.moodScore,
      summary,
    };

    console.log("AI Analysis Result:", result);
    return result;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
};
