import axios from "axios";

export const deductCredicts = async (userId, agent, session) => {
  try {
    const { data } = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/deduct-credits`,
      {
        userId,
        agent,
      },
      {
        headers: {
          Cookie: session || "",
        },
      },
    );
    console.log("CREDIT RESPONSE:", data);

    return data;
  } catch (error) {
    console.error(
      "DEDUCT CREDIT ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
