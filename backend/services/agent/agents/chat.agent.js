import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";

export const chatAgent = async (state) => {

  try {
    const llm = await getModel("chat");

  const history = (await getMemory(state.conversationId)) || []
  const limitedHistory = history.slice(-4).map((msg) => ({
    ...msg,
    content: String(msg.content).slice(0, 2000),
  }));
 const searchContext = state.searchResults
   ? `
Web Search Results:
${JSON.stringify(state.searchResults).slice(0, 5000)}

Answer the user using only the above search results.
`
   : "";
  const systemPrompt = `You are CortexAI, an intelligent AI assistant.

      ${searchContext}
      If searchContext exists:

  - Use search results to answer.
  - Do not mention internal tools.

    Rules:

- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.

Formatting:

- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet lists for steps.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write heading and content on the same line.
- Never generate large walls of text.
`;

  const messages = [new SystemMessage(systemPrompt)];

 limitedHistory.forEach((msg) => {
   if (msg.role === "user") {
     messages.push(new HumanMessage(msg.content));
   }

   if (msg.role === "assistant") {
     messages.push(new AIMessage(msg.content));
   }
 });

  messages.push(new HumanMessage(state.prompt));

  console.log("MESSAGES:", messages);
  const response = await llm.invoke(messages);
  console.log("AI RESPONSE:", response.content);


  return {
    ...state,
    aiResponse: response.content,
  };
}catch (error) {
    return {
      ...state,
      aiResponse: `
      ❌ Failed to generate response.
      `,
    };
  }
}