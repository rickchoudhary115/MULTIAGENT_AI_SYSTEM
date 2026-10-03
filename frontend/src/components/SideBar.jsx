
import React, { useEffect, useId, useState } from "react";

import {
  Coins,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftIcon,
  PanelRight,
  PenSquare,
  Plus,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getConversations } from "../features/getConversations";
import {
  setConversation,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { setUserData } from "../redux/userSlice";
import logOut from "../features/logOut";
import { setmessage } from "../redux/messageSlice";
import getMessages from "../features/getMessages";
import BillingDrawer from "./BillingDrawer";

const iconBtn =
  "flex items-center justify-center rounded-xl border border-transparent bg-transparent text-slate-500 cursor-pointer transition-all duration-200 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/[0.07]";

/* Kivo Raccoon Logo */
function RaccoonLogo({ className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kivo logo"
      role="img"
    >
      {/* Soft ears */}
      <path
        d="M13 38 C12 29 13 17 19 13 C23 11 30 17 38 27 L34 39 Z"
        fill="#111111"
      />

      <path
        d="M87 38 C88 29 87 17 81 13 C77 11 70 17 62 27 L66 39 Z"
        fill="#111111"
      />

      {/* Inner ears */}
      <path
        d="M18 29 C18 22 19 19 21 18 C24 18 28 22 31 27 L28 32 Z"
        fill="#383838"
      />

      <path
        d="M82 29 C82 22 81 19 79 18 C76 18 72 22 69 27 L72 32 Z"
        fill="#383838"
      />

      {/* Chubby head */}
      <ellipse cx="50" cy="57" rx="39" ry="36" fill="#111111" />

      {/* Cheek highlights */}
      <ellipse cx="22" cy="67" rx="8" ry="7" fill="#222222" />

      <ellipse cx="78" cy="67" rx="8" ry="7" fill="#222222" />

      {/* Cute eye patches */}
      <ellipse cx="32" cy="52" rx="13" ry="11" fill="#ffffff" />

      <ellipse cx="68" cy="52" rx="13" ry="11" fill="#ffffff" />

      {/* Big cute eyes */}
      <ellipse cx="33" cy="53" rx="5" ry="6" fill="#111111" />

      <ellipse cx="67" cy="53" rx="5" ry="6" fill="#111111" />

      {/* Eye sparkle */}
      <circle cx="31.5" cy="51" r="1.8" fill="#ffffff" />

      <circle cx="65.5" cy="51" r="1.8" fill="#ffffff" />

      {/* Soft muzzle */}
      <ellipse cx="50" cy="69" rx="17" ry="14" fill="#ffffff" />

      {/* Tiny nose */}
      <ellipse cx="50" cy="67" rx="5" ry="3.8" fill="#111111" />

      {/* Cute smile */}
      <path
        d="M50 70 C47 73 44 73 42 71"
        fill="none"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M50 70 C53 73 56 73 58 71"
        fill="none"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Tiny cheek dots */}
      <circle cx="36" cy="72" r="1.3" fill="#dddddd" />

      <circle cx="64" cy="72" r="1.3" fill="#dddddd" />
    </svg>
  );
}

/* Defined outside SideBar so it isn't remounted on every render */
function Avatar({ user, imageError, onError }) {
  return user?.avatar && !imageError ? (
    <img
      className="w-9 h-9 rounded-xl object-cover border border-indigo-500/30 shadow-md shadow-indigo-500/10"
      src={user.avatar}
      alt="User avatar"
      onError={onError}
    />
  ) : (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.07]">
      <User size={15} className="text-slate-400" />
    </div>
  );
}

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const dispatch = useDispatch();

  const { conversations = [], selectedConversation } = useSelector(
    (state) => state.conversation,
  );

  const { userData } = useSelector((state) => state.user);
  const user = userData?.user;

  /* ---------- load conversations ---------- */
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

  /* ---------- retry the avatar if the user/avatar changes ---------- */
  useEffect(() => {
    setImageError(false);
  }, [user?.avatar]);

  /* ---------- lock body scroll + Esc to close (mobile drawer) ---------- */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  /* ---------- close drawer when resizing to desktop ---------- */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const onChange = (e) => {
      if (e.matches) setMobileOpen(false);
    };

    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* ---------- handlers ---------- */
  const handleNewChat = () => {
    dispatch(setSelectedConversation(null));
    setMobileOpen(false);
  };

  const handleSelectConversation = async (conv) => {
    dispatch(setSelectedConversation(conv));
    setMobileOpen(false);

    try {
      const messages = await getMessages(conv?._id);
      dispatch(setmessage(messages));
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleOpenBilling = () => {
    setMobileOpen(false);
    setShowBilling(true);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logOut();
    dispatch(setUserData(null));
  };

  return (
    <>
      {/* ================= MOBILE HAMBURGER ================= */}
      {!mobileOpen && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-30 w-10 h-10 flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b0e13]/90 backdrop-blur text-slate-500 cursor-pointer transition-all duration-200 active:scale-95 hover:text-slate-100"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>
      )}

      {/* ================= MOBILE OVERLAY ================= */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`
          lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* ================= COLLAPSED RAIL (DESKTOP ONLY) ================= */}
      {collapsed && (
        <div className="hidden lg:flex flex-col items-center w-[60px] h-screen bg-[#0b0e13] border-r border-white/[0.06] py-3 gap-1 shrink-0 shadow-[8px_0_30px_rgba(0,0,0,0.12)]">
          <button
            aria-label="Expand sidebar"
            className={`${iconBtn} w-9 h-9 mb-1`}
            onClick={() => setCollapsed(false)}
          >
            <PanelRight size={17} strokeWidth={1.8} />
          </button>

          <button
            aria-label="New chat"
            className={`${iconBtn} w-9 h-9 hover:bg-indigo-500/10 hover:border-indigo-500/20`}
            onClick={handleNewChat}
          >
            <Plus size={17} strokeWidth={1.8} />
          </button>

          <div className="flex-1 w-full overflow-y-auto px-2 pb-2 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {conversations.map((conv) => {
              const isActive = selectedConversation?._id === conv?._id;

              return (
                <div
                  key={conv?._id}
                  title={conv?.title || "New Chat"}
                  onClick={() => handleSelectConversation(conv)}
                  className={`
                    group flex items-center justify-center cursor-pointer mb-1 px-2 py-2.5 rounded-xl border transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_16px_rgba(99,102,241,0.08)]"
                        : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center shrink-0 w-[22px] h-[22px] rounded-lg transition-all duration-200
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

          <div className="shrink-0 mt-2">
            <Avatar
              user={user}
              imageError={imageError}
              onError={() => setImageError(true)}
            />
          </div>
        </div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-[270px] max-w-[85vw] h-[100dvh]
          bg-[#0b0e13] border-r border-white/[0.06]
          max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)]
          transition-transform duration-300 ease-out
          ${
            mobileOpen
              ? "translate-x-0 shadow-[8px_0_30px_rgba(0,0,0,0.35)]"
              : "-translate-x-full"
          }
          lg:static lg:translate-x-0 lg:h-screen lg:shrink-0 lg:z-auto
          lg:shadow-[8px_0_30px_rgba(0,0,0,0.12)]
          ${collapsed ? "lg:hidden" : ""}
        `}
      >
        <div className="flex flex-col py-3 h-full">
          {/* ================= HEADER ================= */}
          <div className="flex items-center gap-2.5 px-4 pb-3 border-b border-white/[0.06]">
            {/* desktop: collapse */}
            <button
              aria-label="Collapse sidebar"
              className={`${iconBtn} hidden lg:flex w-8 h-8`}
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftIcon size={16} strokeWidth={1.8} />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 shrink-0 rounded-lg bg-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <RaccoonLogo className="w-5 h-5" />
              </div>

              <span className="text-[16px] font-semibold text-slate-100 tracking-tight truncate">
                Kivo
              </span>
            </div>

            <span className="shrink-0 text-[9px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wider uppercase">
              {user?.plan ?? "free"}
            </span>

            <button
              aria-label="New chat"
              className={`${iconBtn} hidden sm:flex w-8 h-8`}
              onClick={handleNewChat}
            >
              <PenSquare size={15} strokeWidth={1.8} />
            </button>

            {/* mobile: close */}
            <button
              aria-label="Close sidebar"
              className={`${iconBtn} lg:hidden w-8 h-8`}
              onClick={() => setMobileOpen(false)}
            >
              <X size={17} strokeWidth={1.8} />
            </button>
          </div>

          {/* ================= NEW CHAT ================= */}
          <div className="px-4 pt-4 pb-2">
            <button
              className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-white bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 rounded-xl py-[10px] border border-indigo-400/20 cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              onClick={handleNewChat}
            >
              <Plus size={15} strokeWidth={2} />
              New Chat
            </button>
          </div>

          {/* ================= SECTION TITLE ================= */}
          <div className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {conversations.length === 0 ? "No Recent Conversation" : "Recents"}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {conversations.map((conv) => {
              const isActive = selectedConversation?._id === conv?._id;

              return (
                <div
                  key={conv?._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`
                    group flex items-center gap-2.5 cursor-pointer mb-1 px-3 py-2.5 rounded-xl border transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-500/[0.09] border-indigo-500/[0.18] shadow-[0_0_18px_rgba(99,102,241,0.05)]"
                        : "bg-transparent border-transparent hover:bg-white/[0.035] hover:border-white/[0.055]"
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center shrink-0 w-[22px] h-[28px] rounded-lg transition-all duration-200
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
                      text-[13px] font-medium truncate transition-colors duration-200
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

          <div className="mx-2.5 mb-1 rounded-2xl border border-white/[0.06] bg-white/[0.025] shadow-inner">
            <div className="px-3 py-3">
              {user ? (
                <div className="flex items-center gap-2.5 rounded-xl px-1 py-1 hover:bg-white/[0.04] transition-colors duration-150">
                  <div className="relative shrink-0">
                    <Avatar
                      user={user}
                      imageError={imageError}
                      onError={() => setImageError(true)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-100 truncate">
                      {user?.name || "user"}
                    </p>

                    <p className="text-[10px] text-indigo-400/80 mt-0.5">
                      {`${user?.plan ?? "free"} plan`}
                    </p>

                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      aria-label="Billing"
                      onClick={handleOpenBilling}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent bg-transparent text-yellow-600 cursor-pointer hover:bg-yellow-500/[0.08] hover:text-yellow-500 hover:border-yellow-500/10 transition-all duration-150"
                    >
                      <Coins size={15} strokeWidth={1.8} />
                    </button>

                    <button
                      aria-label="Log out"
                      onClick={handleLogout}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent bg-transparent text-slate-600 cursor-pointer hover:bg-red-500/[0.08] hover:text-red-400 hover:border-red-500/10 transition-all duration-150"
                    >
                      <LogOut size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.04] border border-white/[0.08] rounded-xl py-[10px] cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200">
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
    </>
  );
}

export default SideBar;

