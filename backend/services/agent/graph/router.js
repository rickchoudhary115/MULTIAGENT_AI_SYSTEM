import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  try {
    // Uploaded file
    if (state.file?.mimetype === "application/pdf") {
      console.log("📄 PDF → pdfRag");
      return { ...state, agent: "pdfRag" };
    }

    if (state.file?.mimetype?.startsWith("image/")) {
      console.log("🖼️ IMAGE → imageAnalyzer");
      return { ...state, agent: "imageAnalyzer" };
    }

    // Manual agent
    if (state.agent && state.agent !== "auto") {
      console.log("🎯 Manual →", state.agent);
      return { ...state, agent: state.agent };
    }

    // LLM routing
    const llm = await getModel("router");

    const prompt = `
Choose one agent for this request:

chat = normal conversation
search = web/current information
coding = programming/software
pdf = PDF generation
ppt = PowerPoint/presentation
vision = image generation

User: ${state.prompt}

Return only:
chat, search, coding, pdf, ppt, or vision
`;

    const response = await llm.invoke(prompt);

    const agent = response.content
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");

    const validAgents = ["chat", "search", "coding", "pdf", "ppt", "vision"];

    const finalAgent = validAgents.includes(agent) ? agent : "chat";

    console.log("🤖 LLM →", finalAgent);

    return { ...state, agent: finalAgent };
  } catch (error) {
    console.error("❌ Router:", error);
    return { ...state, agent: "chat" };
  }
};
