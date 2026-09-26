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

import { addMessage, setArtifacts } from "../redux/messageSlice";

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

  const { selectedConversation } = useSelector((state) => state.conversation);

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
        }),
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
      }),
    );

    setValue("");

    try {
      const data = await sendMessage(payload);
      dispatch(setArtifacts(data.artifacts || []))
      // Add AI response
      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer,
          images: data?.images || [],
          artifacts: data?.artifacts || [],
        }),
      );
      console.log(data);
    } catch (error) {
      console.log("CHAT ERROR:", error.response?.data || error.message);
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
      id: "vision",
      icon: ImageIcon,
      label: "Vision",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-3.5 border-t border-white/[0.06] bg-[#0d0f14]">
      {" "}
      <div
        className="
       group
       flex
       flex-col
       gap-2
       bg-[#11141b]
       border
       border-white/[0.07]
       rounded-2xl
       px-3.5
       pt-3
       pb-2.5
       shadow-lg
       shadow-black/10
       transition-all
       duration-200
       focus-within:border-indigo-500/30
       focus-within:shadow-[0_0_25px_rgba(99,102,241,0.04)]
     "
      >
        {/* ================= AGENTS ================= */}
  
        <div className="flex w-full gap-2 pr-1 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;

            const Icon = agent.icon;

            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
              flex-shrink-0
              cursor-pointer
              inline-flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              text-[11px]
              sm:text-xs
              font-medium
              border
              transition-all
              duration-200
              select-none
              active:scale-95
              ${
                isActive
                  ? `
                    bg-gradient-to-r
                    from-indigo-500
                    via-violet-500
                    to-purple-600
                    text-white
                    border-transparent
                    shadow-[0_2px_12px_rgba(99,102,241,0.25)]
                  `
                  : `
                    bg-white/[0.025]
                    text-slate-500
                    border-white/[0.06]
                    hover:bg-white/[0.07]
                    hover:text-slate-300
                    hover:border-white/[0.1]
                  `
              }
            `}
              >
                <Icon
                  size={13}
                  strokeWidth={2}
                  className={isActive ? "text-white" : "text-slate-600"}
                />

                <span>{agent.label}</span>
              </div>
            );
          })}
        </div>
        {/* ================= TEXTAREA ================= */}
        <textarea
          placeholder="Ask anything..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="
        w-full
        min-h-[72px]
        max-h-48
        resize-none
        bg-transparent
        outline-none
        text-[14px]
        text-slate-200
        placeholder:text-slate-600
        leading-6
        py-1.5
        px-0.5
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
        selection:bg-indigo-500/30
      "
          rows={3}
        />
        {/* ================= BOTTOM BAR ================= */}
        <div className="flex items-center justify-between pt-0.5">
          {/* LEFT BUTTONS */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Attach file"
              className="
            flex
            items-center
            justify-center
            w-8
            h-8
            rounded-lg
            text-slate-600
            hover:text-slate-300
            hover:bg-white/[0.06]
            active:scale-95
            transition-all
            duration-150
            bg-transparent
            border
            border-transparent
            hover:border-white/[0.06]
            cursor-pointer
          "
            >
              <Paperclip size={16} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label="Voice input"
              className="
            flex
            items-center
            justify-center
            w-8
            h-8
            rounded-lg
            text-slate-600
            hover:text-slate-300
            hover:bg-white/[0.06]
            active:scale-95
            transition-all
            duration-150
            bg-transparent
            border
            border-transparent
            hover:border-white/[0.06]
            cursor-pointer
          "
            >
              <Mic size={15} strokeWidth={1.8} />
            </button>
          </div>

          {/* ================= SEND ================= */}

          <button
            type="button"
            disabled={!value.trim()}
            onClick={handleSendMessage}
            aria-label="Send message"
            className={`
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-xl
          border
          transition-all
          duration-200
          ${
            value.trim()
              ? `
                bg-gradient-to-br
                from-indigo-500
                via-violet-600
                to-purple-700
                border-indigo-400/20
                text-white
                shadow-md
                shadow-indigo-500/20
                hover:shadow-lg
                hover:shadow-indigo-500/30
                hover:-translate-y-0.5
                active:translate-y-0
                active:scale-95
                cursor-pointer
              `
              : `
                bg-white/[0.04]
                border-white/[0.05]
                text-slate-700
                cursor-not-allowed
              `
          }
        `}
          >
            <Send
              size={15}
              strokeWidth={2}
              className={value.trim() ? "translate-x-[0.5px]" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
