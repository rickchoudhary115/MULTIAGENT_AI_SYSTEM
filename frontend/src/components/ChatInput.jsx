import { Code2, FileText, Globe, ImageIcon, MessageSquare, Mic, Paperclip ,Presentation,Send, Zap} from 'lucide-react'
import React, { useState } from 'react'
import sendMessage from '../features/sendMessage';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { addMessage, setmessage } from '../redux/messageSlice';
import { createConversation } from '../features/createConversation';
import {
  setConversation,
  addConversation,
  setSelectedConversation,
  setConvTitle,
} from "../redux/conversationSlice";
import { updateConversation } from '../features/updateConversation';

function ChatInput() {

  const [value,setValue] =useState("")
  const [selectedAgent,setSelectedAgent]=useState("auto")
  const { selectedConversation } = useSelector(
    (state) => state.conversation)
      const { messages } = useSelector(
        (state) => state.message
      );
    const dispatch=useDispatch()

const handleSendMessage = async () => {
  const prompt = value.trim();

  if (!prompt) return;

  let conversation = selectedConversation;

  if (!conversation) {
    const conv = await createConversation();

    if (!conv?._id) {
      console.error("Invalid conversation:", conv);
      return;
    }

    dispatch(setSelectedConversation(conv));
    dispatch(addConversation(conv));

    conversation = conv;
  }

  if (!conversation?._id) return;

  if (conversation.title === "New Conversation") {
    const title = prompt.slice(0, 40);

    await updateConversation({
      id: conversation._id,
      title,
    });

    dispatch(
      setConvTitle({
        conversationId: conversation._id,
        title,
      }),
    );
  }

  const payload = {
    prompt,
    conversationId: conversation._id,
  };

  console.log("CHAT PAYLOAD:", payload);

  dispatch(
    addMessage({
      role: "user",
      content: prompt,
    }),
  );

  setValue("");

  try {
    const data = await sendMessage(payload);

    console.log("AI RESPONSE:", data);

    dispatch(
      addMessage({
        role: "assistant",
        content: data,
      }),
    );
  } catch (error) {
    console.log("CHAT ERROR:", error.response?.data || error.message);
  }
};
const agents=[
  {
    id:"auto",
    icon:Zap,
    label:"Auto"
  },
  {
    id:"chat",
    icon:MessageSquare,
    label:"chat"
  },
  {
    id:"coding",
    icon:Code2,
    label:"coding"
  },
  {
    id:"pdf",
    icon:FileText,
    label:"PDF"
  },
  {
    id:"ppt",
    icon:Presentation,
    label:"PPT"
  },
  {
    id:"image",
    icon:ImageIcon,
    label:"Image"
  },
  {
    id:"search",
    icon:Globe,
    label:"search"
  },
  
]



  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
        <div className="flex w-[80%] gap-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;

            return (
              <div
                onClick={() => setSelectedAgent(agent.label)}
                className={`
          flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5
          px-3 py-2 rounded-full text-xs font-medium border transition-all
          ${
            isActive
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,35)]"
              : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
          }
        `}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />

                {agent.label}
              </div>
            );
          })}
        </div>
        <textarea
          placeholder="Ask Anything..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="w-full bg-transparent outline-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="flex items-center justify-center  w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all  duration-150 bg-transparent border border-transparent hover:border-white/[0.06] cursor-pointer">
              <Paperclip size={16} />
            </button>
            <button className="flex items-center justify-center  w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all  duration-150 bg-transparent border border-transparent hover:border-white/[0.06] cursor-pointer">
              <Mic size={15} />
            </button>
          </div>
          <button
            disabled={!value}
            onClick={handleSendMessage}
            className={`flex items-center justify-center  border-none w-8 h-8 rounded-lg cursor-pointer transition-all  duration-150 ${value.trim() ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white" : "bg-white/[0.05] text-slate-600 cursor-not-allowed"}`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput
