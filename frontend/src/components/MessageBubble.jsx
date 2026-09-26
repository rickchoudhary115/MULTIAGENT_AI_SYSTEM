import React, { useState } from "react";

import Markdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Check, Copy, ExternalLink, X, Maximize2 } from "lucide-react";

function MessageBubble({ role, content, images = [] }) {
  const isUser = role === "user";

  const [lightBox, setLightBox] = useState(null);

  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  };

  return (
    <>
      {/* ================= MESSAGE ================= */}

      <div
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`
            relative
            max-w-[94vw] md:max-w-[80%] lg:max-w-[78%]
            overflow-hidden
            break-words
            rounded-2xl
            px-4 py-3.5
            leading-relaxed
            transition-all
            duration-200
            ${
              isUser
                ? `
                  rounded-tr-md
                  bg-gradient-to-br
                  from-indigo-500
                  via-violet-600
                  to-purple-700
                  text-white
                  shadow-lg
                  shadow-indigo-500/10
                `
                : `
                  rounded-tl-md
                  text-slate-200
                `
            }
          `}
        >
          {/* ================= SEARCH IMAGES ================= */}

          {images?.length > 0 && (
            <div className="mb-5">
              <div
                className={`
                  grid
                  gap-2.5
                  ${
                    images.length === 1
                      ? "grid-cols-1"
                      : images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 sm:grid-cols-3"
                  }
                `}
              >
                {images.map((img, index) => (
                  <div
                    key={`${img}-${index}`}
                    onClick={() => setLightBox(img)}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-[#111827]
                      cursor-zoom-in
                      shadow-md
                      shadow-black/20
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-white/20
                      hover:shadow-xl
                    "
                  >
                    <img
                      src={img}
                      alt={`Search result ${index + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.parentElement?.remove();
                      }}
                      className="
                        w-full
                        h-32
                        sm:h-36
                        md:h-40
                        object-cover
                        transition-transform
                        duration-500
                        ease-out
                        group-hover:scale-105
                      "
                    />

                    {/* Image overlay */}

                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-black/0
                        group-hover:bg-black/40
                        transition-all
                        duration-300
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          rounded-full
                          bg-black/55
                          backdrop-blur-md
                          p-2.5
                          opacity-0
                          scale-90
                          group-hover:opacity-100
                          group-hover:scale-100
                          transition-all
                          duration-300
                          border
                          border-white/10
                        "
                      >
                        <Maximize2
                          size={17}
                          strokeWidth={2}
                          className="text-white"
                        />
                      </div>
                    </div>

                    {/* Image number */}

                    <div
                      className="
                        absolute
                        bottom-2
                        left-2
                        rounded-md
                        bg-black/50
                        px-2
                        py-0.5
                        text-[10px]
                        font-medium
                        text-white/80
                        backdrop-blur-sm
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                      "
                    >
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= MARKDOWN ================= */}

          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              /* ================= HEADINGS ================= */

              h1: ({ children }) => (
                <h1
                  className="
                    text-2xl
                    md:text-3xl
                    font-bold
                    tracking-tight
                    mt-6
                    mb-4
                    text-white
                    leading-tight
                  "
                >
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2
                  className="
                    text-xl
                    md:text-2xl
                    font-bold
                    tracking-tight
                    mt-7
                    mb-3
                    text-white
                    leading-tight
                  "
                >
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3
                  className="
                    text-lg
                    md:text-xl
                    font-semibold
                    mt-6
                    mb-2.5
                    text-slate-100
                    leading-tight
                  "
                >
                  {children}
                </h3>
              ),

              h4: ({ children }) => (
                <h4
                  className="
                    text-base
                    font-semibold
                    mt-5
                    mb-2
                    text-slate-200
                  "
                >
                  {children}
                </h4>
              ),

              /* ================= PARAGRAPH ================= */

              p: ({ children }) => (
                <p
                  className="
                    mb-3.5
                    last:mb-0
                    whitespace-pre-wrap
                    break-words
                    text-[15px]
                    md:text-[15.5px]
                    leading-7
                    text-slate-200
                  "
                >
                  {children}
                </p>
              ),

              /* ================= LISTS ================= */

              ul: ({ children }) => (
                <ul
                  className="
                    list-disc
                    pl-6
                    my-4
                    space-y-2
                    marker:text-indigo-400
                  "
                >
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol
                  className="
                    list-decimal
                    pl-6
                    my-4
                    space-y-2
                    marker:text-indigo-400
                  "
                >
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li
                  className="
                    pl-1
                    text-slate-200
                    leading-7
                  "
                >
                  {children}
                </li>
              ),

              /* ================= LINKS ================= */

              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-indigo-400
                    hover:text-indigo-300
                    hover:underline
                    underline-offset-4
                    decoration-indigo-400/50
                    transition-colors
                    break-words
                  "
                >
                  {children}

                  <ExternalLink
                    size={13}
                    strokeWidth={2}
                    className="shrink-0"
                  />
                </a>
              ),

              /* ================= TEXT ================= */

              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),

              em: ({ children }) => (
                <em className="italic text-slate-300">{children}</em>
              ),

              /* ================= CODE ================= */

              code: ({ className, children, ...props }) => {
                const value = String(children).replace(/\n*$/, "");

                const language =
                  className?.replace("language-", "").trim() || "text";

                const isCodeBlock = className?.startsWith("language-");

                /* ================= CODE BLOCK ================= */

                if (isCodeBlock) {
                  return (
                    <div
                      className="
                        group
                        relative
                        my-6
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/[0.08]
                        bg-[#0d1117]
                        shadow-xl
                        shadow-black/20
                      "
                    >
                      {/* Code Header */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          px-4
                          py-2.5
                          bg-[#161b22]
                          border-b
                          border-white/[0.08]
                        "
                      >
                        <div className="flex items-center gap-3">
                          {/* Mac dots */}

                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                          </div>

                          <span
                            className="
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-[0.15em]
                              text-slate-500
                            "
                          >
                            {language}
                          </span>
                        </div>

                        {/* Copy */}

                        <button
                          type="button"
                          onClick={() => copyCode(value)}
                          className="
                            flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-white/[0.06]
                            px-2.5
                            py-1.5
                            text-xs
                            text-slate-400
                            hover:text-white
                            hover:bg-white/[0.07]
                            hover:border-white/10
                            transition-all
                            duration-200
                          "
                        >
                          {copiedCode === value ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code */}

                      <div className="relative">
                        <SyntaxHighlighter
                          language={language}
                          style={{
                            ...oneDark,

                            "pre[class*='language-']": {
                              ...oneDark["pre[class*='language-']"],
                              background: "#0d1117",
                            },

                            "code[class*='language-']": {
                              ...oneDark["code[class*='language-']"],
                              background: "#0d1117",
                            },
                          }}
                          wrapLongLines
                          customStyle={{
                            margin: 0,
                            padding: "18px",
                            background: "#0d1117",
                            fontSize: "13px",
                            lineHeight: "1.7",
                            overflowX: "auto",
                            border: "none",
                          }}
                          codeTagProps={{
                            style: {
                              background: "transparent",
                            },
                          }}
                        >
                          {value}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  );
                }

                /* ================= INLINE CODE ================= */

                return (
                  <code
                    className="
                      rounded-md
                      border
                      border-white/[0.08]
                      bg-white/[0.07]
                      px-1.5
                      py-0.5
                      font-mono
                      text-[13px]
                      text-indigo-300
                    "
                    {...props}
                  >
                    {children}
                  </code>
                );
              },

              /* ================= BLOCKQUOTE ================= */

              blockquote: ({ children }) => (
                <blockquote
                  className="
                    my-5
                    border-l-4
                    border-indigo-500/70
                    rounded-r-xl
                    bg-indigo-500/[0.06]
                    px-4
                    py-3
                    italic
                    text-slate-300
                  "
                >
                  {children}
                </blockquote>
              ),

              /* ================= HR ================= */

              hr: () => <hr className="my-7 border-white/[0.08]" />,

              /* ================= TABLE ================= */

              table: ({ children }) => (
                <div
                  className="
                    my-6
                    overflow-x-auto
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.015]
                  "
                >
                  <table
                    className="
                      min-w-full
                      border-collapse
                      text-sm
                    "
                  >
                    {children}
                  </table>
                </div>
              ),

              thead: ({ children }) => (
                <thead className="bg-white/[0.06]">{children}</thead>
              ),

              tbody: ({ children }) => <tbody>{children}</tbody>,

              tr: ({ children }) => (
                <tr
                  className="
                    border-b
                    border-white/[0.07]
                    last:border-b-0
                    hover:bg-white/[0.025]
                    transition-colors
                  "
                >
                  {children}
                </tr>
              ),

              th: ({ children }) => (
                <th
                  className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-slate-100
                    border-r
                    border-white/[0.07]
                    last:border-r-0
                    whitespace-nowrap
                  "
                >
                  {children}
                </th>
              ),

              td: ({ children }) => (
                <td
                  className="
                    px-4
                    py-3
                    text-slate-300
                    border-r
                    border-white/[0.07]
                    last:border-r-0
                    leading-6
                  "
                >
                  {children}
                </td>
              ),

              /* ================= MARKDOWN IMAGE ================= */

              img: ({ src, alt }) => 
               { if(!src)return null;

                return(
                <img
                  src={src}
                  alt={alt || "Image"}
                  loading="lazy"
                  onClick={() => setLightBox(src)}
                  className="
                    max-w-full
                    max-h-[450px]
                    rounded-2xl
                    my-5
                    border
                    border-white/[0.08]
                    object-contain
                    cursor-zoom-in
                    shadow-lg
                    shadow-black/20
                    hover:opacity-90
                    hover:border-white/20
                    transition-all
                    duration-300
                  "
                />
              )},
            }}
          >
            {content}
          </Markdown>
        </div>
      </div>

      {/* ================= LIGHTBOX ================= */}

      {lightBox && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/90
            backdrop-blur-xl
            p-4
            md:p-8
            animate-in
            fade-in
            duration-200
          "
          onClick={() => setLightBox(null)}
        >
          {/* Close */}

          <button
            type="button"
            aria-label="Close image"
            className="
              absolute
              top-5
              right-5
              z-20
              flex
              items-center
              justify-center
              w-11
              h-11
              rounded-full
              bg-white/[0.08]
              border
              border-white/[0.1]
              text-white/70
              hover:text-white
              hover:bg-white/[0.15]
              hover:scale-105
              backdrop-blur-md
              transition-all
              duration-200
            "
            onClick={(e) => {
              e.stopPropagation();
              setLightBox(null);
            }}
          >
            <X size={21} strokeWidth={2} />
          </button>

          {/* Full Image */}

          <div
            className="
              relative
              max-w-[96vw]
              max-h-[90vh]
              flex
              items-center
              justify-center
            "
          >
            <img
              src={lightBox}
              alt="Full size preview"
              onClick={(e) => e.stopPropagation()}
              className="
                max-w-[95vw]
                max-h-[88vh]
                rounded-2xl
                object-contain
                shadow-2xl
                shadow-black/50
                border
                border-white/[0.08]
                select-none
              "
            />
          </div>
        </div>
      )}
    </>
  );
}

export default MessageBubble;
