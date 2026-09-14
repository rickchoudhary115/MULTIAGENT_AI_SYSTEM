import axios from "axios";

export const getMessages = async (conversationId) => {
  try {
    const { data } = await axios.get(
      `${process.env.CHAT_SERVICE_URL}/get-message/${conversationId}`,
    );

    return data;
  } catch (error) {
    console.log("GET MESSAGES ERROR:", error.response?.data || error.message);
    return [];
  }
};
