import { getModel } from "../config/llmModel.js";
import fs from "fs/promises";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { deductCredicts } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimits.js";

export const imageAnalyzer = async (state) => {
  try {
        await checkAgentLimit(state.userId,"image")
    
    const llm = await getModel("imageAnalyzer");
    const imageBuffer = await fs.readFile(state.file.path);
    const base64Image = imageBuffer.toString("base64");
    const messages = [
      new SystemMessage(`You are an image analysis agent.

Analyze the provided image carefully and provide a clear, accurate response.

Your tasks:
- Describe the main content of the image.
- Identify important objects, people, scenes, or visual elements.
- If the image contains text, read and transcribe it accurately.
- If it is a screenshot, explain the relevant UI elements and visible information.
- If the image contains a diagram, chart, or document, explain its structure and important details.
- Do not invent information that cannot be clearly identified.
- Keep the response informative and well structured.`),
      new HumanMessage({
        content: [
          { type: "text", text: state.prompt || "analyze this image" },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
             await deductCredicts(state.userId, "vision", state.session);


    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.log(error);
    if (error.status == 429) {
      return {
        ...state,
        aiResponse: error?.data?.message,
      };
    }
    return{
        ...state,
        aiResponse:"Failed to anlayze file"
    }
  }
  finally{
   await fs.unlink(state.file.path)
  }
};
