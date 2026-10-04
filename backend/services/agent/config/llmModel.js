
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";




const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
});
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash", // stable choice
  temperature: 0,
});
const openrouter = new ChatOpenAI({
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",

  temperature: 0,

  maxTokens: 10000,

  apiKey: process.env.OPENROUTER_API_KEY,

  configuration: {
    baseURL: "https://openrouter.ai/api/v1",

    defaultHeaders: {
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Kivo AI",
    },
  },
});

export const getModel = (agent) => {
  switch (agent) {
    case "chat":
      return groq.withFallbacks({ fallbacks: [gemini] });

    case "search":
      return gemini;

    case "coding":
      return openrouter.withFallbacks({ fallbacks: [gemini] });


    case "imageAnalyzer":
      return gemini;

    case "intent":
      return gemini;

    default:
      return groq;
  }
};

