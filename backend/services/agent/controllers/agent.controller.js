import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;

    // await redis.del(`messages-${conversationId}`)
    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });
    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
    });

    await addMessage(conversationId, "user", prompt);

    // Save AI response
    await addMessage(conversationId, "assistant", result.aiResponse);

    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: result?.aiResponse,
      images: result?.images,
      artifacts: result?.artifacts,
    });

    return res.status(200).json({
      answer: result?.aiResponse,
      images: result?.images,
      artifacts:result?.artifacts
    });
  } catch (error) {
    console.error("AGENT ERROR:", error.response?.data || error.message);
    console.error("AGENT STACK:", error.stack);

    return res.status(500).json({
      message: "Agent error",
      error: error.response?.data || error.message,
    });
  }
};
