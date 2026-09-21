import { getModel } from "../config/llmModel.js";
import { jsonrepair } from "jsonrepair";

export const codingAgent = async (state) => {
  const intentllm = await getModel("intent");

  const llm = await getModel("coding");

  const intentRes = await intentllm.invoke(`

    You are an intent classifier.

    Return ONLY one of these values:

    CODE_GENERATION

    CODE_REVIEW

    CODE_EXPLANATION

    DEBUGGING

    OPTIMIZATION

    CONVERSION

    DOCUMENTATION

    Do not return anything else.

    User Request:

    ${state.prompt}

  `);

  const intent = String(intentRes.content).trim();

  console.log("CODING INTENT:", intent);

  if (intent == "CODE_GENERATION") {
    const prompt = `

      You are CortexAI coding Agent.

      Generate the requested project.

      Default stack:

      - HTML
      - CSS
      - JavaScript

      Use React / Next.js / Vue ONLY if explicitly requested.

      Rules:

      - Responsive
      - Modern UI
      - CSS Variables
      - Flexbox/Grid
      - Smooth Scroll
      - Hover Effects
      - Beautiful spacing
      - Single page unless user asks otherwise

      Return ONLY valid JSON.

      Required format:

      {
        "files": [
          {
            "name": "index.html",
            "content": "..."
          },
          {
            "name": "style.css",
            "content": "..."
          },
          {
            "name": "script.js",
            "content": "..."
          }
        ]
      }

      VERY IMPORTANT:

      - Return ONLY JSON.
      - Do NOT use markdown.
      - Do NOT use code fences.
      - Do NOT add explanations.
      - Do NOT add text before or after JSON.
      - Every content value MUST be a valid JSON string.
      - Escape every double quote inside content as \\".
      - Escape every backslash inside content as \\\\.
      - Escape every newline inside content as \\n.
      - Escape every tab inside content as \\t.
      - Escape every carriage return inside content as \\r.
      - Never place a raw newline inside a JSON string.
      - Never place an unescaped double quote inside a JSON string.
      - The complete response MUST be directly parseable using JSON.parse().
      - The "files" value MUST always be an array.
      - Every file MUST contain "name" and "content".

      User Request:

      ${state.prompt}

    `;

    const res = await llm.invoke(prompt);

    console.log("========== RAW CODING RESPONSE ==========");

    console.log(res.content);

    console.log("==========================================");

    let text = String(res.content).trim();

    const start = text.indexOf("{");

    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("NO JSON FOUND IN CODING RESPONSE");

      throw new Error("Coding model did not return JSON");
    }

    text = text.substring(start, end + 1);

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      console.warn(
        "PRIMARY JSON.parse FAILED, ATTEMPTING REPAIR:",
        error.message,
      );

      try {
        data = JSON.parse(jsonrepair(text));

        console.log("JSON REPAIR SUCCEEDED");
      } catch (repairError) {
        console.error("========== JSON PARSE ERROR ==========");

        console.error(repairError.message);

        console.error("======================================");

        console.error("BROKEN JSON:");

        console.error(text);

        // Last-resort fallback: don't crash the whole request.
        data = {
          files: [
            {
              name: "index.html",
              content:
                "<!-- The AI response could not be parsed. Please try again. -->",
            },
          ],
        };
      }
    }

    if (!data || !Array.isArray(data.files)) {
      console.error("INVALID FILES:", data);

      data = {
        files: [
          {
            name: "index.html",
            content:
              "<!-- The AI response was missing valid file data. Please try again. -->",
          },
        ],
      };
    }

    console.log("========== GENERATED FILES ==========");

    data.files.forEach((file, index) => {
      console.log(`FILE ${index}:`, file?.name);
    });

    console.log("=====================================");

    return {
      ...state,

      aiResponse: "Code Generated Successfully",

      artifacts: [
        {
          id: Date.now(),

          type: "Project",

          title: state.prompt,

          files: data.files,
        },
      ],
    };
  }

  const res = await llm.invoke(`

    The User's request is:

    ${intent}

    Return Markdown only.

    Never generate project files.

    Use headings like:

    # Overview

    ## Explanation

    ## Problems

    ## Improvements

    ## Best Practices

    ## Optimized Code(if needed)

    User Request:

    ${state.prompt}

  `);

  const data = res.content;

  console.log("========== CODING ANSWER ==========");

  console.log(data);

  console.log("===================================");

  return {
    ...state,

    aiResponse: data,

    artifacts: [],
  };
};
