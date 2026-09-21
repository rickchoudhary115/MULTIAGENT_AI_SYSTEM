import { ChatGroq } from "@langchain/groq";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatOpenRouter} from "@langchain/openrouter"
const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",

  //   temperature: 0,
  //   maxTokens: undefined,
  //   maxRetries: 2,
  // other params...
});
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  // other params...
});
const openrouter = new ChatOpenRouter({
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0,
  maxTokens: 8000,
  // other params...
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return openrouter;

    default:
      return groq; // break;
  }
};
