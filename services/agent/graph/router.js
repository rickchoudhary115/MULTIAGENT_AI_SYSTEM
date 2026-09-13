import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  const llm = await getModel("router");

  const prompt = `
You are an agent router.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation, explanations, learning, questions.

search:
Current events, latest information, news, recent developments, internet lookup.

coding:
Generate code, debug code, build projects, architecture, API design.

pdf:
Questions about generating PDFs or questions about PDF/document context.

ppt:
Questions about generating PPTs or questions about PPT context.

vision:
Generate images or analyze/debug images.

Return ONLY ONE word from:
chat
search
coding
pdf
ppt
vision

User Query:
${state.prompt}
`;

  const response = await llm.invoke(prompt);

  const agent = response.content.trim().toLowerCase().replace(/[^\w]/g, "");

  console.log("Router selected:", agent);

  return {
    ...state,
    agent,
  };
};
