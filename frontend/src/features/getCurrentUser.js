import api from "../../utils/axios.js";

const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/me");
        console.log("Current user data:", data);
        return data;
    } catch (error) {
      console.log("Error fetching current user:", error);
      throw error;
    }
}
export default getCurrentUser;