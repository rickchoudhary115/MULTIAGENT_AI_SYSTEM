import {
  Check,
  Code2,
  Copy,
  Eye,
  X,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useEffect, useState } from "react"; // 🔹 added useEffect
import { useSelector } from "react-redux";
import { easeInOut, motion } from "motion/react";
import Editor from "@monaco-editor/react";

function Artifact() {
  const [collapsed, setCollapsed] = useState(false);
  const { artifacts = [] } = useSelector((state) => state.message);
  const [tab, setTab] = useState("code");
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  // 🔹 NEW: mobile sheet open/close + screen size tracking
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 1024,
  );

  // 🔹 NEW: track screen size
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 🔹 NEW: lock page scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen && !isDesktop ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isDesktop]);

  if (artifacts.length === 0) return;

  const artifact = artifacts[0];
  const file = artifact?.files[activeFile];
  const htmlFile = artifact?.files.find((f) => f.name === "index.html");
  const cssFile = artifact?.files.find((f) => f.name === "style.css");
  const jsFile = artifact?.files.find((f) => f.name === "script.js");
  const canPreview = Boolean(htmlFile);

  const previewDoc = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A simple web page">
    <style>
    ${cssFile?.content || ""}
    </style>
</head>

<body>
   ${htmlFile?.content || ""}
    <script >
    ${jsFile?.content || ""}
    </script>
</body>
</html>
  `;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file?.content || "");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  };

  const detectLanguage = (fileName = "") => {
    const name = fileName.toLowerCase();
    if (name.endsWith(".html") || name.endsWith(".htm")) return "html";
    if (name.endsWith(".css")) return "css";
    if (name.endsWith(".scss")) return "scss";
    if (name.endsWith(".sass")) return "sass";
    if (name.endsWith(".less")) return "less";
    if (name.endsWith(".js") || name.endsWith(".mjs") || name.endsWith(".cjs"))
      return "javascript";
    if (name.endsWith(".jsx")) return "javascript";
    if (name.endsWith(".ts") || name.endsWith(".mts") || name.endsWith(".cts"))
      return "typescript";
    if (name.endsWith(".tsx")) return "typescript";
    if (name.endsWith(".json")) return "json";
    if (name.endsWith(".jsonc")) return "json";
    if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";
    if (name.endsWith(".yaml") || name.endsWith(".yml")) return "yaml";
    if (name.endsWith(".toml")) return "ini";
    if (name.endsWith(".xml")) return "xml";
    if (name.endsWith(".env")) return "dotenv";
    if (name.endsWith(".py")) return "python";
    if (name.endsWith(".java")) return "java";
    if (name.endsWith(".kt") || name.endsWith(".kts")) return "kotlin";
    if (name.endsWith(".scala")) return "scala";
    if (name.endsWith(".groovy")) return "groovy";
    if (name.endsWith(".cpp") || name.endsWith(".cc") || name.endsWith(".cxx"))
      return "cpp";
    if (name.endsWith(".c")) return "c";
    if (name.endsWith(".h") || name.endsWith(".hh")) return "cpp";
    if (name.endsWith(".hpp")) return "cpp";
    if (name.endsWith(".cs")) return "csharp";
    if (name.endsWith(".php")) return "php";
    if (name.endsWith(".rb")) return "ruby";
    if (name.endsWith(".go")) return "go";
    if (name.endsWith(".rs")) return "rust";
    if (name.endsWith(".swift")) return "swift";
    if (name.endsWith(".dart")) return "dart";
    if (name.endsWith(".sql")) return "sql";
    if (name.endsWith(".sh") || name.endsWith(".bash") || name.endsWith(".zsh"))
      return "shell";
    if (name.endsWith(".vue")) return "vue";
    if (name.endsWith(".svelte")) return "svelte";

    if (name === "dockerfile" || name.endsWith(".dockerfile"))
      return "dockerfile";
    if (name.endsWith(".graphql") || name.endsWith(".gql")) return "graphql";
    if (name.endsWith(".lua")) return "lua";
    if (name.endsWith(".json")) return "json";
    if (name.endsWith(".pl")) return "perl";
    if (name.endsWith(".r")) return "r";
    return "plaintext";
  };

  return (
    // 🔹 wrapped in a fragment so the mobile button can sit beside the panel
    <>
      {/* 🔹 NEW: floating open button, mobile/tablet only */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open code panel"
          className="lg:hidden fixed top-3 right-3 z-30 flex items-center gap-1.5 h-11 px-3.5 rounded-xl bg-[#0b0e13]/90 backdrop-blur border border-indigo-500/30 text-[12px] font-medium text-indigo-300 shadow-lg shadow-black/30 active:scale-95 transition-transform cursor-pointer"
        >
          {canPreview ? <Eye size={15} /> : <Code2 size={15} />}
          <span>{canPreview ? "Preview" : "View code"}</span>
        </button>
      )}

      <motion.div
        // 🔹 CHANGED: mobile = full-screen sheet when open, hidden when closed. lg+ = your original side panel
        className={`${
          mobileOpen ? "flex fixed inset-0 z-50 h-[100dvh]" : "hidden"
        } lg:flex lg:static lg:z-auto lg:h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0`}
        // 🔹 CHANGED: full width on mobile, your original widths on desktop
        initial={{ width: isDesktop ? 400 : "100%" }}
        animate={{ width: isDesktop ? (collapsed ? 48 : 500) : "100%" }}
        transition={{ duration: 0.5, ease: easeInOut }}
      >
        {/* 🔹 CHANGED: the collapsed rail only applies on desktop */}
        {!(isDesktop && collapsed) ? (
          <div className="flex flex-col h-full bg-[#0d0f14]">
            <div className="h-14 px-3 sm:px-4 border-b border-white/[0.06] flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                // 🔹 CHANGED: bigger on mobile; closes the sheet on mobile, collapses on desktop
                className="flex items-center justify-center w-9 h-9 lg:w-7 lg:h-7 rounded-lg
            text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]
            transition-colors duration-150 bg-transparent border-none
            cursor-pointer shrink-0"
                onClick={() =>
                  isDesktop ? setCollapsed(true) : setMobileOpen(false)
                }
              >
                {isDesktop ? <PanelRightClose size={16} /> : <X size={20} />}
              </button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* 🔹 CHANGED: icon box hidden on very small screens to save space */}
                <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                  <Code2 size={18} className="text-indigo-400" />
                </div>
                {/* 🔹 CHANGED: added flex-1 min-w-0 so a long title truncates instead of overflowing */}
                <div className="flex-1 min-w-0 font-medium text-[13px] text-slate-200 truncate">
                  {artifact?.title}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 font-medium  rounded-lg
            text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]
            transition-colors duration-150 bg-transparent border-none
            cursor-pointer"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                {canPreview && (
                  // 🔹 CHANGED: added shrink-0 so the toggle never gets squashed
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg shrink-0">
                    <button
                      onClick={() => setTab("code")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150
                  ${
                    tab === "code"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/[0.04] text-slate-500 hover:text-slate-200"
                  }`}
                    >
                      <Code2 size={11} />
                      Code
                    </button>
                    <button
                      onClick={() => setTab("preview")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150
                  ${
                    tab === "preview"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/[0.04] text-slate-500 hover:text-slate-200"
                  }`}
                    >
                      <Eye size={11} />
                      Preview
                    </button>
                  </div>
                )}
              </div>
            </div>
            {tab === "code" && (
              // 🔹 FIXED typo: [&:: webkit-scrollbar] → [&::-webkit-scrollbar], removed duplicate h-auto
              <div className="flex h-auto text-white border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                {artifact?.files?.map((f, index) => (
                  <button
                    key={f?.name || index} // 🔹 added key
                    onClick={() => setActiveFile(index)}
                    // 🔹 FIXED typo: whilespace-nowrap → whitespace-nowrap, added shrink-0
                    className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 border-r border-white/[0.06] relative cursor-pointer bg-transparent ${activeFile === index ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    {f?.name}
                    {activeFile === index && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 🔹 CHANGED: added min-h-0 so the editor/iframe fills the height properly */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {tab === "preview" && canPreview ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  <iframe
                    title="preview"
                    srcDoc={previewDoc}
                    sandbox="allow-scripts"
                    className="w-full h-full bg-white border-0"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full overflow-auto"
                >
                  <Editor
                    theme="vs-dark"
                    language={detectLanguage(file?.name)}
                    value={file?.content}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: isDesktop ? 13 : 12, // 🔹 CHANGED: slightly smaller on mobile
                      wordWrap: "on",
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 16 },
                      lineNumbers: "on",
                      renderLineHighlight: "none",
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex h-full border-l border-white/[0.06] flex-col items-center bg-[#0d0f14] py-4 gap-3 shrink-0">
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg
            text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]
            transition-colors duration-150 bg-transparent border-none
            cursor-pointer shrink-0"
              onClick={() => setCollapsed(false)}
            >
              <PanelRightOpen size={16} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                style={{
                  writingMode: "vertical-lr",
                }}
                className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap"
              >
                {artifact?.title}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

export default Artifact;
