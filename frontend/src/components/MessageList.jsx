import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import LoadingAnimation from "./LoadingAnimation";
function RaccoonLogo({ className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kivo logo"
      role="img"
    >
      {" "}
      {/* Soft ears */}{" "}
      <path
        d="M13 38 C12 29 13 17 19 13 C23 11 30 17 38 27 L34 39 Z"
        fill="#111111"
      />{" "}
      <path
        d="M87 38 C88 29 87 17 81 13 C77 11 70 17 62 27 L66 39 Z"
        fill="#111111"
      />{" "}
      {/* Inner ears */}{" "}
      <path
        d="M18 29 C18 22 19 19 21 18 C24 18 28 22 31 27 L28 32 Z"
        fill="#383838"
      />{" "}
      <path
        d="M82 29 C82 22 81 19 79 18 C76 18 72 22 69 27 L72 32 Z"
        fill="#383838"
      />{" "}
      {/* Chubby head */}{" "}
      <ellipse cx="50" cy="57" rx="39" ry="36" fill="#111111" />{" "}
      {/* Cheek highlights */}{" "}
      <ellipse cx="22" cy="67" rx="8" ry="7" fill="#222222" />{" "}
      <ellipse cx="78" cy="67" rx="8" ry="7" fill="#222222" />{" "}
      {/* Cute eye patches */}{" "}
      <ellipse cx="32" cy="52" rx="13" ry="11" fill="#ffffff" />{" "}
      <ellipse cx="68" cy="52" rx="13" ry="11" fill="#ffffff" />{" "}
      {/* Big cute eyes */}{" "}
      <ellipse cx="33" cy="53" rx="5" ry="6" fill="#111111" />{" "}
      <ellipse cx="67" cy="53" rx="5" ry="6" fill="#111111" />{" "}
      {/* Eye sparkle */} <circle cx="31.5" cy="51" r="1.8" fill="#ffffff" />{" "}
      <circle cx="65.5" cy="51" r="1.8" fill="#ffffff" /> {/* Soft muzzle */}{" "}
      <ellipse cx="50" cy="69" rx="17" ry="14" fill="#ffffff" />{" "}
      {/* Tiny nose */}{" "}
      <ellipse cx="50" cy="67" rx="5" ry="3.8" fill="#111111" />{" "}
      {/* Cute smile */}{" "}
      <path
        d="M50 70 C47 73 44 73 42 71"
        fill="none"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />{" "}
      <path
        d="M50 70 C53 73 56 73 58 71"
        fill="none"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />{" "}
      {/* Tiny cheek dots */} <circle cx="36" cy="72" r="1.3" fill="#dddddd" />{" "}
      <circle cx="64" cy="72" r="1.3" fill="#dddddd" />{" "}
    </svg>
  );
}

function MessageList() {
  const { selectedConversation } = useSelector((state) => state.conversation);

  const {
    messages = [],
    message,
    isLoading,
  } = useSelector((state) => state.message);

  const bottomRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [message?.length, isLoading, messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 || !selectedConversation ? (
        /* ================= EMPTY STATE ================= */
        <div className="h-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="flex flex-col items-center max-w-md">
            {/* Kivo Logo */}

            {/* Kivo Logo */}
            <div className="relative group mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-white/[0.08] shadow-lg shadow-indigo-500/10">
              <RaccoonLogo className="w-15 h-15" />

              {/* Creator tooltip */}
              <div
                className="
      pointer-events-none
      absolute
      -bottom-9
      left-1/2
      -translate-x-1/2
      whitespace-nowrap
      rounded-lg
      bg-black/90
      border
      border-white/[0.08]
      px-3
      py-1.5
      text-[11px]
      font-medium
      text-slate-200
      opacity-0
      translate-y-1
      group-hover:opacity-100
      group-hover:translate-y-0
      transition-all
      duration-200
      shadow-lg
      z-50
    "
              >
                Created by Anirban Choudhury
              </div>
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
                Kivo Ai
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
            {/* Suggestions */}
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
                images={message?.images || []}
              />
            </div>
          ))}

          {isLoading && <LoadingAnimation />}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
