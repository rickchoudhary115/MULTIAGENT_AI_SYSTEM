import { getModel } from "../config/llmModel.js";

export const chatAgent = async (state) => {
  const llm = await getModel("chat");

  const systemPrompt =`You are CortexAI, an intelligent AI assistant.
  
  Rules:
  -For simple questions,greetings, and short queries , respond naturally in plain text.
  -For technical, educational , coding, or detailed topics, use clean Markdown.
  
  
  Formatting:


  - Use # for titles and ## for selection.
  - Leave a blank line after headings.
  - Use bullets lists for steps.
  - Use numbered lists for steps.
  - Use fenced code blocks with language tags for code.
  - Keep paragraphs short and readable.
  - Never write heading and content on the same line.
  - Never generate large walls of texts.
  
  
  `;

  const response = await llm.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "human",
      content: state.prompt,
    },
  ]);

  return {
    ...state,
    aiResponse: response.content,
  };
};
