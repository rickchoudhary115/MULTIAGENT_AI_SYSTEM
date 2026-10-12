import {
  Code2,
  X,
  MicOff,
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

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import sendMessage from "../features/sendMessage";

import { addMessage, setArtifacts, setIsLoading } from "../redux/messageSlice";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState("");

  const recognitionRef = useRef(null);
  const baseTextRef = useRef(""); // text already in the box when listening starts
  const fileRef = useRef(null);

  const { isLoading } = useSelector((state) => state.message);

  const { selectedConversation } = useSelector((state) => state.conversation);

  const dispatch = useDispatch();

  // =========================
  // SPEECH RECOGNITION
  // =========================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // keep listening until stopped
    recognition.interimResults = true; // show words while speaking
    recognition.lang = navigator.language || "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      // Join every result (final + interim) from this listening session
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const spoken = transcript.trim();
      const base = baseTextRef.current;

      // Put the spoken words into the text input
      setValue(base ? `${base} ${spoken}` : spoken);
    };

    recognition.onerror = (event) => {
      console.error("SPEECH ERROR:", event.error);

      const messages = {
        "not-allowed":
          "Microphone permission was denied. Allow mic access in the browser.",
        "service-not-allowed":
          "Speech service is blocked. Use https or localhost.",
        "audio-capture": "No microphone found.",
        network: "Speech service needs an internet connection.",
        "no-speech": "Didn't hear anything. Try again.",
      };

      setSpeechError(
        messages[event.error] || `Voice input error: ${event.error}`,
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.abort();
    };
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;

    baseTextRef.current = value.trim(); // keep whatever is already typed
    setSpeechError("");

    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start recognition:", err);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop(); // finalizes the last words, then fires onend
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // =========================
  // IMAGE PREVIEW
  // =========================

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // =========================
  // SEND MESSAGE
  // =========================

  const handleSendMessage = async () => {
    const prompt = value.trim();

    // Don't send empty message
    if (!prompt) return;

    // Stop mic so it doesn't write into the box after sending
    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
    }

    // Start loading
    dispatch(setIsLoading(true));

    let conversation = selectedConversation;

    try {
      // =========================
      // CREATE CONVERSATION
      // =========================

      if (!conversation) {
        const conv = await createConversation();

        if (!conv?._id) {
          console.error("Invalid conversation:", conv);
          dispatch(setIsLoading(false));
          return;
        }

        dispatch(setSelectedConversation(conv));
        dispatch(addConversation(conv));

        conversation = conv;
      }

      if (!conversation?._id) {
        dispatch(setIsLoading(false));
        return;
      }

      // =========================
      // SET CONVERSATION TITLE
      // =========================

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

      console.log("SELECTED FILE:", selectedFile);

      // =========================
      // FORMDATA
      // =========================

      const formData = new FormData();

      formData.append("prompt", prompt);
      formData.append("conversationId", conversation._id);
      formData.append("agent", selectedAgent.toLowerCase());

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // =========================
      // ADD USER MESSAGE
      // =========================

      dispatch(
        addMessage({
          role: "user",
          content: prompt,
          images: [],
        }),
      );

      setValue("");

      // =========================
      // SEND REQUEST
      // =========================

      const data = await sendMessage(formData);

      console.log("CHAT RESPONSE:", data);

      // Stop loading
      dispatch(setIsLoading(false));

      // Clear selected file
      setSelectedFile(null);

      // Update artifacts
      dispatch(setArtifacts(data?.artifacts || []));

      // =========================
      // ADD AI RESPONSE
      // =========================

      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer,
          images: data?.images || [],
          artifacts: data?.artifacts || [],
        }),
      );
    } catch (error) {
      console.error("CHAT ERROR:", error.response?.data || error.message);

      // IMPORTANT
      // Re-enable Send button after error
      dispatch(setIsLoading(false));
    }
  };

  // =========================
  // AGENTS
  // =========================

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
        "
      >
        {/* AGENTS */}

        <div className="flex w-full gap-2 pr-1 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;

            const Icon = agent.icon;

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                  flex-shrink-0
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
              </button>
            );
          })}
        </div>

        {/* SELECTED FILE */}

        {selectedFile && (
          <div className="flex items-center gap-3 w-fit max-w-sm px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10">
            {selectedFile.type === "application/pdf" ? (
              <FileText size={20} className="text-red-400 shrink-0" />
            ) : selectedFile.type.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Selected"
                className="w-10 h-10 object-cover rounded-lg shrink-0"
              />
            ) : null}

            <div className="min-w-0">
              <p
                className="text-xs text-white truncate max-w-[180px]"
                title={selectedFile.name}
              >
                {selectedFile.name}
              </p>

              <p className="text-[10px] text-slate-500">
                {Math.ceil(selectedFile.size / 1024)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="shrink-0 text-slate-500 hover:text-white transition"
              aria-label="Remove file"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* LISTENING STATUS */}

        {isListening && (
          <p className="text-[11px] text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Listening... tap the mic to stop
          </p>
        )}

        {speechError && (
          <p className="text-[11px] text-amber-400">{speechError}</p>
        )}

        {/* TEXTAREA */}

        <textarea
          placeholder="Ask anything..."
          onChange={(e) => {
            if (isListening) recognitionRef.current?.stop();
            setValue(e.target.value);
          }}
          value={value}
          rows={3}
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
        />

        {/* BOTTOM BAR */}

        <div className="flex items-center justify-between pt-0.5">
          {/* LEFT BUTTONS */}

          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf,image/*"
              hidden
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  setSelectedFile(file);
                }

                e.target.value = "";
              }}
            />

            <button
              type="button"
              aria-label="Attach file"
              onClick={() => fileRef.current?.click()}
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
              "
            >
              <Paperclip size={16} strokeWidth={1.8} />
            </button>

            {/* VOICE INPUT */}

            <button
              type="button"
              aria-label={isListening ? "Stop listening" : "Voice input"}
              title={
                !speechSupported
                  ? "Voice input isn't supported in this browser"
                  : isListening
                    ? "Stop listening"
                    : "Start voice input"
              }
              onClick={toggleListening}
              disabled={!speechSupported}
              className={`
                relative
                flex
                items-center
                justify-center
                w-8
                h-8
                rounded-lg
                border
                active:scale-95
                transition-all
                duration-150

                ${
                  isListening
                    ? "text-red-400 bg-red-500/10 border-red-500/30"
                    : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] bg-transparent border-transparent hover:border-white/[0.06]"
                }

                ${!speechSupported ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-lg bg-red-500/20 animate-ping" />
              )}

              {isListening ? (
                <MicOff size={15} strokeWidth={1.8} className="relative" />
              ) : (
                <Mic size={15} strokeWidth={1.8} className="relative" />
              )}
            </button>
          </div>

          {/* SEND BUTTON */}

          <button
            type="button"
            disabled={!value.trim() || isLoading}
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
                value.trim() && !isLoading
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
