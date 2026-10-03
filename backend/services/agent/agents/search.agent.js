import { searchTool } from "../config/tavily.js";
import { deductCredicts } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimits.js";

export const searchAgent = async (state) => {
  try {
        await checkAgentLimit(state.userId, "search");

    const results = await searchTool.invoke({
      query: state.prompt,
    });
                  await deductCredicts(state.userId, "search", state.session);


    console.log("SEARCH RESULTS:", results);
    return {
      ...state,
      searchResults: results,
      images:results.images
    };
  } catch (error) {
    console.log("SEARCH AGENT ERROR:", error);
if (error.status == 429) {
  return {
    ...state,
    aiResponse: error?.data?.message,
  };
}
    return {
      ...state,
      searchResults: [],
      images: [],
    };
  }
};
