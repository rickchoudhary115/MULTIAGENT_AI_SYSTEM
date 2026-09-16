
import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  Zap,
} from "lucide-react";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import sendMessage from "../features/sendMessage";
import { addMessage } from "../redux/messageSlice";

import { createConversation } from "../features/createConversation";

import {
  addConversation,
  setSelectedConversation,
  setConvTitle,
} from "../redux/conversationSlice";

import { updateConversation } from "../features/updateConversation";

function ChatInput() {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");

  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const dispatch = useDispatch();

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
        })
      );
    }

    const payload = {
      prompt,
      conversationId: conversation._id,
      agent: selectedAgent.toLowerCase(),
    };

    console.log("CHAT PAYLOAD:", payload);

    // Add user message
    dispatch(
      addMessage({
        role: "user",
        content: prompt,
        images: [],
      })
    );

    setValue("");

    try {
      const data = await sendMessage(payload);


      // Add AI response
      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer ,
          images: data?.images ,
        })
      );
    } catch (error) {
      console.log(
        "CHAT ERROR:",
        error.response?.data || error.message
      );
    }
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "image",
      icon: ImageIcon,
      label: "Image",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">

        <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
          {agents.map((agent) => {
            const isActive=selectedAgent === agent.label;
            const Icon=agent.icon;
            return (
              <div
                key={agent.id}
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
                  className={
                    isActive ? "text-white" : "text-slate-500"
                  }
                />

                {agent.label}
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          placeholder="Ask Anything..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="w-full bg-transparent outline-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />

        {/* Bottom buttons */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all duration-150 bg-transparent border border-transparent hover:border-white/[0.06] cursor-pointer"
            >
              <Paperclip size={16} />
            </button>

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all duration-150 bg-transparent border border-transparent hover:border-white/[0.06] cursor-pointer"
            >
              <Mic size={15} />
            </button>
          </div>

          {/* Send */}
          <button
            disabled={!value.trim()}
            onClick={handleSendMessage}
            className={`
              flex items-center justify-center
              border-none w-8 h-8 rounded-lg
              cursor-pointer transition-all duration-150
              ${
                value.trim()
                  ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white"
                  : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
              }
            `}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;

