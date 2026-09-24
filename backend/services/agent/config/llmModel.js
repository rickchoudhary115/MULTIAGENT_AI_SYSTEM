
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";




const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
});
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
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
      "X-Title": "CortexAI",
    },
  },
});

export const getModel = (agent) => {
  switch (agent) {
    case "chat":
      return groq;

    case "search":
      return gemini;

    case "coding":
      return openrouter;

    case "intent":
      return groq;

    default:
      return groq;
  }
};

