import React from 'react'
import api from "../../utils/axios.js"
async function sendMessage(payload) {
try {
    const {data}=await api.post("/api/agent/chat",payload)
    return data
} catch (error) {
  console.log("SEND MESSAGE ERROR:", error);
  throw error;
}
}

export default sendMessage
