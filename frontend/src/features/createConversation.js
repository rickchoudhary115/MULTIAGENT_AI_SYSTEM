import api from "../../utils/axios.js"

export const createConversation = async ()=>{
    try {
        const { data } = await api("/api/chat/create-conversation");
        console.log(data)
        return data
    } catch (error) {
        console.log(error)
        return []
    }
}

