import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;

    // await redis.del(`messages-${conversationId}`)

    const result = await graph.invoke({
      prompt,
      conversationId,
    });

    const response = result.aiResponse;

    // Save user message AFTER graph
    await addMessage(conversationId, "user", prompt);

    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // Save AI response
    await addMessage(conversationId, "assistant", response);

    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("AGENT ERROR:", error);
    console.error("AGENT ERROR MESSAGE:", error.message);
    console.error("AGENT ERROR STACK:", error.stack);

    return res.status(500).json({
      message: "Agent error",
      error: error.message,
    });
  }
};
