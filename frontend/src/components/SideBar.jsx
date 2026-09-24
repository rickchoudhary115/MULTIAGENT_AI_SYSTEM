import React, { useEffect, useState } from "react";

import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PanelRight,
  PenSquare,
  Plus,
  User,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { getConversations } from "../features/getConversations";

import {
  addConversation,
  setConversation,
  setSelectedConversation,
} from "../redux/conversationSlice";

import { setUserData } from "../redux/userSlice";

import { createConversation } from "../features/createConversation";

import logOut from "../features/logOut";

import { setmessage } from "../redux/messageSlice";

import getMessages from "../features/getMessages";

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useDispatch();

  const [imageError, setImageError] = useState(false);

  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );

  const { userData } = useSelector((state) => state.user);

  const user = userData?.user;

  useEffect(() => {
    const getConv = async () => {
      if (!user?.userId) return;

      try {
        const data = await getConversations();

        dispatch(setConversation(data));
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    getConv();
  }, [user?.userId]);

  const handleCreateConversation = async () => {
    const data = await createConversation();

    dispatch(addConversation(data));
  };

  const handleSelectConversation = async (conv) => {
    dispatch(setSelectedConversation(conv));

    const messages = await getMessages(conv?._id);

    dispatch(setmessage(messages));
  };

  if (collapsed) {
    return (
      <div
        className="
       hidden lg:flex
       flex-col
       items-center
       w-[60px]
       h-screen
       bg-[#0b0e13]
       border-r
       border-white/[0.06]
       py-3
       gap-1
       shrink-0
       shadow-[8px_0_30px_rgba(0,0,0,0.12)]
     "
      >
        {/* ================= COLLAPSED HEADER ================= */}

        <button
          className="
        flex
        items-center
        justify-center
        w-9
        h-9
        rounded-xl
        text-slate-500
        hover:text-slate-100
        hover:bg-white/[0.07]
        hover:border-white/[0.08]
        border
        border-transparent
        transition-all
        duration-200
        bg-transparent
        cursor-pointer
        mb-1
      "
          onClick={() => setCollapsed(false)}
        >
          <PanelRight size={17} strokeWidth={1.8} />
        </button>

        <button
          className="
        flex
        items-center
        justify-center
        w-9
        h-9
        rounded-xl
        text-slate-500
        hover:text-white
        hover:bg-indigo-500/10
        hover:border-indigo-500/20
        border
        border-transparent
        transition-all
        duration-200
        bg-transparent
        cursor-pointer
      "
          onClick={() => dispatch(setSelectedConversation(null))}
        >
          <Plus size={17} strokeWidth={1.8} />
        </button>

        {/* ================= COLLAPSED CONVERSATIONS ================= */}

        <div
          className="
        flex-1
        w-full
        overflow-y-auto
        px-2
        pb-2
        pt-4
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
        >
          {conversations.map((conv) => {
            const isActive = selectedConversation?._id == conv?._id;

            return (
              <div
                key={conv?._id}
                onClick={() => dispatch(setSelectedConversation(conv))}
                className={`
              group
              flex
              items-center
              justify-center
              cursor-pointer
              mb-1
              px-2
              py-2.5
              rounded-xl
              border
              transition-all
              duration-200
              ${
                isActive
                  ? `
                    bg-indigo-500/10
                    border-indigo-500/20
                    shadow-[0_0_16px_rgba(99,102,241,0.08)]
                  `
                  : `
                    bg-transparent
                    border-transparent
                    hover:bg-white/[0.04]
                    hover:border-white/[0.06]
                  `
              }
            `}
              >
                <div
                  className={`
                flex
                items-center
                justify-center
                shrink-0
                w-[22px]
                h-[22px]
                rounded-lg
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-white/[0.04] text-slate-600 group-hover:text-slate-400"
                }
              `}
                >
                  <MessageSquare size={13} strokeWidth={1.8} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= COLLAPSED USER ================= */}

        <div className="relative shrink-0 mt-2">
          {user?.avatar && !imageError ? (
            <img
              className="
            w-9
            h-9
            rounded-xl
            object-cover
            border
            border-indigo-500/30
            shadow-md
            shadow-indigo-500/10
          "
              src={user?.avatar}
              alt="User avatar"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="
            w-9
            h-9
            rounded-xl
            flex
            items-center
            justify-center
            bg-white/[0.05]
            border
            border-white/[0.06]
          "
            >
              <User size={15} className="text-slate-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="
     fixed
     lg:static
     inset-y-0
     left-0
     z-50
     w-[270px]
     h-screen
     shrink-0
     bg-[#0b0e13]
     border-r
     border-white/[0.06]
     shadow-[8px_0_30px_rgba(0,0,0,0.12)]
   "
    >
      {" "}
      <div className="flex flex-col py-3 h-full">
        {/* ================= HEADER ================= */}

        <div
          className="
        flex
        items-center
        gap-2.5
        px-4
        pb-3
        border-b
        border-white/[0.06]
      "
        >
          <div
            className="
          hidden
          lg:flex
          items-center
          justify-center
          w-8
          h-8
          rounded-xl
          text-slate-500
          hover:text-slate-100
          hover:bg-white/[0.06]
          border
          border-transparent
          hover:border-white/[0.07]
          transition-all
          duration-200
          cursor-pointer
        "
            onClick={() => setCollapsed(true)}
          >
            <PanelLeftIcon size={16} strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="
            w-7
            h-7
            rounded-lg
            bg-gradient-to-br
            from-indigo-500
            via-violet-500
            to-purple-600
            shadow-md
            shadow-indigo-500/20
          "
            />

            <span
              className="
            text-[16px]
            font-semibold
            text-slate-100
            tracking-tight
          "
            >
              CortexAi
            </span>
          </div>

          <span
            className="
          text-[9px]
          font-semibold
          text-indigo-300
          bg-indigo-500/10
          border
          border-indigo-500/20
          px-2
          py-0.5
          rounded-full
          tracking-wider
          uppercase
        "
          >
            Free
          </span>

          <button
            className="
          flex
          items-center
          justify-center
          w-8
          h-8
          rounded-xl
          text-slate-500
          hover:text-slate-100
          hover:bg-white/[0.06]
          border
          border-transparent
          hover:border-white/[0.07]
          transition-all
          duration-200
          bg-transparent
          cursor-pointer
        "
            onClick={() => dispatch(setSelectedConversation(null))}
          >
            <PenSquare size={15} strokeWidth={1.8} />
          </button>
        </div>

        {/* ================= NEW CHAT ================= */}

        <div className="px-4 pt-4 pb-2">
          <button
            className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          text-[13px]
          font-medium
          text-white
          bg-gradient-to-br
          from-indigo-500
          via-violet-600
          to-purple-700
          rounded-xl
          py-[10px]
          border
          border-indigo-400/20
          cursor-pointer
          shadow-md
          shadow-indigo-500/10
          hover:shadow-lg
          hover:shadow-indigo-500/20
          hover:-translate-y-0.5
          active:translate-y-0
          transition-all
          duration-200
        "
            onClick={() => dispatch(setSelectedConversation(null))}
          >
            <Plus size={15} strokeWidth={2} />
            New Chat
          </button>
        </div>

        {/* ================= SECTION TITLE ================= */}

        {conversations.length == 0 ? (
          <div
            className="
          px-5
          pt-4
          pb-2
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-slate-600
        "
          >
            No Recent Conversation
          </div>
        ) : (
          <div
            className="
          px-5
          pt-4
          pb-2
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-slate-600
        "
          >
            Recents
          </div>
        )}

        {/* ================= CONVERSATIONS ================= */}

        <div
          className="
        flex-1
        overflow-y-auto
        px-2.5
        pb-3
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
        >
          {conversations.map((conv) => {
            const isActive = selectedConversation?._id == conv?._id;

            return (
              <div
                key={conv?._id}
                onClick={() => handleSelectConversation(conv)}
                className={`
              group
              flex
              items-center
              gap-2.5
              cursor-pointer
              mb-1
              px-3
              py-2.5
              rounded-xl
              border
              transition-all
              duration-200
              ${
                isActive
                  ? `
                    bg-indigo-500/[0.09]
                    border-indigo-500/[0.18]
                    shadow-[0_0_18px_rgba(99,102,241,0.05)]
                  `
                  : `
                    bg-transparent
                    border-transparent
                    hover:bg-white/[0.035]
                    hover:border-white/[0.055]
                  `
              }
            `}
              >
                <div
                  className={`
                flex
                items-center
                justify-center
                shrink-0
                w-[22px]
                h-[28px]
                rounded-lg
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-white/[0.04] text-slate-600 group-hover:bg-white/[0.06] group-hover:text-slate-400"
                }
              `}
                >
                  <MessageSquare size={13} strokeWidth={1.8} />
                </div>

                <span
                  className={`
                text-[13px]
                font-medium
                truncate
                transition-colors
                duration-200
                ${
                  isActive
                    ? "text-slate-100"
                    : "text-slate-400 group-hover:text-slate-200"
                }
              `}
                >
                  {conv?.title || "New Chat"}
                </span>
              </div>
            );
          })}
        </div>

        {/* ================= USER PROFILE ================= */}

        <div
          className="
        mx-2.5
        mb-1
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.025]
        shadow-inner
      "
        >
          <div className="px-3 py-3">
            {user ? (
              <div
                className="
              flex
              items-center
              gap-2.5
              cursor-pointer
              rounded-xl
              px-1
              py-1
              hover:bg-white/[0.04]
              transition-colors
              duration-150
            "
              >
                {/* AVATAR */}

                <div className="relative shrink-0">
                  {user?.avatar && !imageError ? (
                    <img
                      className="
                    w-9
                    h-9
                    rounded-xl
                    object-cover
                    border
                    border-indigo-500/30
                    shadow-md
                    shadow-indigo-500/10
                  "
                      src={user?.avatar}
                      alt="User avatar"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div
                      className="
                    w-9
                    h-9
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-white/[0.05]
                    border
                    border-white/[0.07]
                  "
                    >
                      <User size={15} className="text-slate-400" />
                    </div>
                  )}
                </div>

                {/* USER DETAILS */}

                <div className="min-w-0 flex-1">
                  <p
                    className="
                  text-[13px]
                  font-medium
                  text-slate-100
                  truncate
                "
                  >
                    {user?.name || "user"}
                  </p>

                  <p
                    className="
                  text-[10px]
                  text-indigo-400/80
                  mt-0.5
                "
                  >
                    {"Free Plan"}
                  </p>

                  <p
                    className="
                  text-[11px]
                  text-slate-600
                  truncate
                  mt-0.5
                "
                  >
                    {user?.email}
                  </p>
                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-0.5">
                  <button
                    className="
                  flex
                  items-center
                  justify-center
                  w-7
                  h-7
                  rounded-lg
                  border
                  border-transparent
                  bg-transparent
                  text-yellow-600
                  cursor-pointer
                  hover:bg-yellow-500/[0.08]
                  hover:text-yellow-500
                  hover:border-yellow-500/10
                  transition-all
                  duration-150
                "
                  >
                    <Coins size={15} strokeWidth={1.8} />
                  </button>

                  <button
                    className="
                  flex
                  items-center
                  justify-center
                  w-7
                  h-7
                  rounded-lg
                  border
                  border-transparent
                  bg-transparent
                  text-slate-600
                  cursor-pointer
                  hover:bg-red-500/[0.08]
                  hover:text-red-400
                  hover:border-red-500/10
                  transition-all
                  duration-150
                "
                    onClick={() => {
                      logOut();
                      dispatch(setUserData(null));
                    }}
                  >
                    <LogOut size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              text-sm
              font-medium
              text-slate-200
              bg-white/[0.04]
              border
              border-white/[0.08]
              rounded-xl
              py-[10px]
              cursor-pointer
              hover:bg-white/[0.08]
              hover:border-white/[0.12]
              transition-all
              duration-200
            "
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
