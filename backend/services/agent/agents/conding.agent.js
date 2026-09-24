import { getModel } from "../config/llmModel.js";
import { jsonrepair } from "jsonrepair";

export const codingAgent = async (state) => {
  try {
    const intentllm = await getModel("intent");
    const llm = await getModel("coding");

    // =========================================================
    // 1. INTENT CLASSIFICATION
    // =========================================================

    const intentRes = await intentllm.invoke(`
You are a coding request classifier.

Return ONLY ONE value from this list:

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
`);

    const intent = String(intentRes?.content || "")
      .trim()
      .toUpperCase();

    console.log("CODING INTENT:", intent);

    // =========================================================
    // 2. CODE GENERATION
    // =========================================================

    if (intent === "CODE_GENERATION") {
      const prompt = `
You are CortexAI, an expert frontend developer and UI/UX designer.

Create a visually impressive frontend prototype for the user's request.

==================================================
STACK
==================================================

- HTML
- CSS
- Vanilla JavaScript
- Use React/Vue/Next/etc ONLY if explicitly requested.
- No backend.
- No database.
- No authentication.

==================================================
DESIGN
==================================================

The interface must look premium, modern, colorful and polished.

Do NOT create a boring gray admin template.

Use:

- CSS variables
- Multiple background colors
- 3-5 accent colors
- Gradients
- Rounded cards
- Soft colored shadows
- At least one glow effect
- Modern typography
- Good spacing
- Responsive layout
- Hover effects
- Subtle animations
- Strong visual hierarchy
- Attractive navbar/header
- Impressive first screen

Choose ONE visual direction:

1. Aurora
   Indigo + violet + cyan + magenta

2. Sunset
   Coral + pink + orange + amber

3. Tropical
   Teal + lime + fuchsia

4. Cyber
   Dark + neon green + cyan + pink

5. Pastel
   Pink + lavender + mint + yellow

Use a cohesive palette rather than random colors.

==================================================
FUNCTIONALITY
==================================================

Build only the important interactions.

Use small mock data.

Maximum 5-8 items for lists/tables.

For dashboards:
- Hero/header
- 3-4 colorful statistic cards
- Small table/list
- Status badges
- Search/filter if useful
- One simple form or modal

For landing pages:
- Hero
- Features
- Main content
- CTA
- Footer

For portfolios:
- Bold hero
- Project cards
- Hover effects
- Different accent colors

==================================================
DO NOT
==================================================

- Authentication
- Backend APIs
- Database
- Complex charts
- Huge datasets
- Large SVGs
- Base64 images
- Unnecessary pages
- Excessive comments
- TODO placeholders
- Repeated code
- Huge components

Images:
- Use Unsplash only when images improve the design.
- Maximum 2 images.
- Never use placeholder images.
- Never generate base64 images.

==================================================
CODE LIMITS
==================================================

Keep the entire response compact.

index.html: maximum 80 lines
style.css: maximum 140 lines
script.js: maximum 50 lines

Prioritize:

1. Visual quality
2. Color/design
3. Responsive layout
4. Core interaction
5. Completeness

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Exactly this structure:

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

Rules:

- No Markdown
- No code fences
- No explanation
- No text outside JSON
- All three files must be complete
- All three files must work together
- Keep the response compact
- Do not truncate the JSON
- Do not add additional files

==================================================
USER REQUEST
==================================================

${state.prompt}
`;

      let res;

      try {
        console.log("========== CODING MODEL CALL ==========");
        console.log("MODEL PROMPT LENGTH:", prompt.length);

        res = await llm.invoke(prompt);

        if (!res) {
          throw new Error("Coding model returned undefined response");
        }

        console.log("========== RAW CODING RESPONSE ==========");
        console.log(res);
        console.log("==========================================");
      } catch (error) {
        console.error("========== CODING MODEL ERROR ==========");
        console.error("MESSAGE:", error?.message);
        console.error("NAME:", error?.name);
        console.error("STACK:", error?.stack);

        if (error?.response) {
          console.error("HTTP STATUS:", error.response.status);
          console.error("HTTP DATA:", error.response.data);
        }

        console.error("========================================");

        return {
          ...state,
          aiResponse:
            "The coding model is currently unavailable or rate-limited. Please try again.",
          artifacts: [],
        };
      }

      // =========================================================
      // 3. CHECK MODEL FINISH REASON
      // =========================================================

      const finishReason =
        res?.response_metadata?.finish_reason ||
        res?.response_metadata?.finishReason ||
        res?.additional_kwargs?.finish_reason;

      const outputTokens =
        res?.usage_metadata?.output_tokens ||
        res?.response_metadata?.usage?.completion_tokens ||
        0;

      console.log("CODING FINISH REASON:", finishReason);
      console.log("CODING OUTPUT TOKENS:", outputTokens);

      if (finishReason === "length") {
        console.error("========== CODING RESPONSE TRUNCATED ==========");

        console.error("The coding model reached its output token limit.");

        console.error("Output tokens:", outputTokens);

        console.error("===============================================");

        return {
          ...state,
          aiResponse:
            "The coding model stopped before completing the project. Please try again with a smaller request.",
          artifacts: [],
        };
      }

      // =========================================================
      // 4. EXTRACT CONTENT
      // =========================================================

      let text = "";

      if (typeof res?.content === "string") {
        text = res.content.trim();
      } else if (Array.isArray(res?.content)) {
        text = res.content
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return item?.text || "";
          })
          .join("")
          .trim();
      }

      if (!text) {
        console.error("EMPTY CODING MODEL RESPONSE:", res);

        return {
          ...state,
          aiResponse:
            "The coding model returned an empty response. Please try again.",
          artifacts: [],
        };
      }

      console.log("========== CODING CONTENT ==========");
      console.log(text);
      console.log("====================================");

      // =========================================================
      // 5. REMOVE MARKDOWN CODE FENCES
      // =========================================================

      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // =========================================================
      // 6. FIND JSON
      // =========================================================

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start === -1 || end === -1 || end <= start) {
        console.error("========== NO JSON FOUND ==========");
        console.error("MODEL RESPONSE:");
        console.error(text);
        console.error("===================================");

        return {
          ...state,
          aiResponse:
            "The coding model did not return valid project JSON. Please try again.",
          artifacts: [],
        };
      }

      text = text.substring(start, end + 1);

      // =========================================================
      // 7. PARSE JSON
      // =========================================================

      let data;

      try {
        data = JSON.parse(text);

        console.log("JSON.parse SUCCESS");
      } catch (error) {
        console.warn("PRIMARY JSON.parse FAILED:", error?.message);

        try {
          const repaired = jsonrepair(text);

          data = JSON.parse(repaired);

          console.log("JSON REPAIR SUCCEEDED");
        } catch (repairError) {
          console.error("========== JSON PARSE ERROR ==========");

          console.error(repairError?.message);

          console.error("======================================");

          console.error("BROKEN JSON:");
          console.error(text);

          return {
            ...state,
            aiResponse:
              "The coding model returned malformed project data. Please try again.",
            artifacts: [],
          };
        }
      }

      // =========================================================
      // 8. VALIDATE FILES
      // =========================================================

      if (!data || !Array.isArray(data.files)) {
        console.error("INVALID FILES:", data);

        return {
          ...state,
          aiResponse:
            "The coding model returned invalid project files. Please try again.",
          artifacts: [],
        };
      }

      const validFiles = data.files.filter(
        (file) =>
          file &&
          typeof file.name === "string" &&
          typeof file.content === "string",
      );

      if (validFiles.length === 0) {
        console.error("NO VALID FILES:", data);

        return {
          ...state,
          aiResponse: "No valid files were generated. Please try again.",
          artifacts: [],
        };
      }

      // =========================================================
      // 9. LIMIT GENERATED FILES
      // =========================================================

      const finalFiles = validFiles.slice(0, 3);

      console.log("========== GENERATED FILES ==========");

      finalFiles.forEach((file, index) => {
        console.log(`FILE ${index}:`, file.name);
      });

      console.log("=====================================");

      // =========================================================
      // 10. RETURN ARTIFACT
      // =========================================================

      return {
        ...state,

        aiResponse: "Code Generated Successfully",

        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            title: state.prompt,

            files: finalFiles,
          },
        ],
      };
    }

    // =========================================================
    // 11. OTHER CODING REQUESTS
    // =========================================================

    const prompt = `
You are CortexAI, an expert software engineer.

User request:

${state.prompt}

Intent:
${intent}

Return concise Markdown.

Use:

# Overview
## Explanation
## Problems
## Improvements
## Best Practices

If code is required, provide only the necessary code.

Do not generate project artifacts unless the user explicitly requests a project.
`;

    let res;

    try {
      res = await llm.invoke(prompt);
    } catch (error) {
      console.error("========== CODING MODEL ERROR ==========");

      console.error(error?.message);
      console.error(error?.stack);

      console.error("========================================");

      return {
        ...state,
        aiResponse:
          "The coding model is currently unavailable or rate-limited. Please try again.",
        artifacts: [],
      };
    }

    // =========================================================
    // 12. EXTRACT NORMAL RESPONSE
    // =========================================================

    let data = "";

    if (typeof res?.content === "string") {
      data = res.content;
    } else if (Array.isArray(res?.content)) {
      data = res.content
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return item?.text || "";
        })
        .join("");
    }

    console.log("========== CODING ANSWER ==========");
    console.log(data);
    console.log("===================================");

    return {
      ...state,

      aiResponse: data || "No response generated.",

      artifacts: [],
    };
  } catch (error) {
    // =========================================================
    // 13. GLOBAL ERROR
    // =========================================================

    console.error("========== CODING AGENT ERROR ==========");

    console.error(error?.message);
    console.error(error?.stack);

    console.error("=========================================");

    return {
      ...state,

      aiResponse:
        "The coding agent encountered an unexpected error. Please try again.",

      artifacts: [],
    };
  }
};
