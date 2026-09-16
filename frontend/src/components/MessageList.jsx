import React from "react";

import { useSelector } from "react-redux";

import MessageBubble from "./MessageBubble";

function MessageList() {
  const { selectedConversation } = useSelector((state) => state.conversation);

  const { messages = [] } = useSelector((state) => state.message);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          {/* ================= EMPTY STATE ================= */}{" "}
          <div className="flex flex-col items-center max-w-md">
            {/* Logo / Icon */}{" "}
            <div
              className="
             mb-6
             flex
             items-center
             justify-center
             w-14
             h-14
             rounded-2xl
             bg-gradient-to-br
             from-indigo-500/20
             via-violet-500/15
             to-purple-500/20
             border
             border-white/[0.08]
             shadow-lg
             shadow-indigo-500/10
           "
            >
              {" "}
              <div
                className="
               w-7
               h-7
               rounded-xl
               bg-gradient-to-br
               from-indigo-400
               via-violet-500
               to-purple-600
               shadow-md
               shadow-indigo-500/30
             "
              />{" "}
            </div>
            {/* Heading */}
            <div className="flex flex-col gap-2">
              <h1
                className="
              text-2xl
              sm:text-[26px]
              font-semibold
              tracking-tight
              text-white
            "
              >
                CortexAi
              </h1>

              <p
                className="
              text-[15px]
              sm:text-base
              font-medium
              text-slate-300
            "
              >
                How can I help you today?
              </p>

              <p
                className="
              text-[13px]
              sm:text-sm
              text-slate-500
              max-w-[340px]
              leading-6
              mt-1
            "
              >
                Ask me anything — code, ideas, explanations, research,
                debugging, or just a quick question.
              </p>
            </div>
            {/* ================= SUGGESTIONS ================= */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-7">
              {[
                "Write a Netflix clone",
                "Explain Redis",
                "Build a dashboard",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="
                group
                text-[12px]
                sm:text-[13px]
                text-slate-400
                bg-white/[0.035]
                border
                border-white/[0.07]
                px-3.5
                py-2
                rounded-xl
                hover:bg-white/[0.08]
                hover:text-slate-200
                hover:border-white/[0.12]
                hover:-translate-y-0.5
                active:translate-y-0
                transition-all
                duration-200
              "
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= MESSAGES ================= */
        <div className="mx-auto w-full max-w-5xl space-y-5 pb-6">
          {messages.map((message, i) => (
            <div
              key={message?._id || `${message?.role}-${i}`}
              className="
            animate-in
            fade-in
            slide-in-from-bottom-2
            duration-300
          "
            >
              <MessageBubble
                role={message?.role}
                content={message?.content}
                images={message.images || []}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageList;
