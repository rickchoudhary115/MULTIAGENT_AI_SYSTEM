import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
export const agent = async (req, res ,next) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId=req.headers["x-user-id"]
    const session = req.headers.cookie;
    const file=req.file
    console.log("file", file)
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
      userId,
      session,
      file: req.file, // Pass the uploaded file to the graph
    });

    await addMessage(conversationId, "user", prompt);

    // Save AI response
    await addMessage(conversationId, "assistant", result.aiResponse);

    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: result?.aiResponse,
      images: result?.images,
      artifacts:result?.artifacts
    });

    return res.status(200).json({
      answer: result?.aiResponse,
      images: result?.images,
      artifacts:result?.artifacts,
    });
  } catch (error) {
    
    next(error);
  }
};
