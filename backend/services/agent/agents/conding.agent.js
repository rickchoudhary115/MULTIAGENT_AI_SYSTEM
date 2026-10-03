import { getModel } from "../config/llmModel.js";
import { jsonrepair } from "jsonrepair";
import { deductCredicts } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimits.js";

export const codingAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "coding");

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
    // 2. PROJECT VS SIMPLE CODE
    // =========================================================

    const typeRes = await intentllm.invoke(`
You are a coding request type classifier.

Determine whether the user wants a COMPLETE PROJECT/FRONTEND
or just NORMAL/SIMPLE CODE.

Return ONLY ONE value:

PROJECT
SIMPLE_CODE

Use PROJECT when the user asks for things such as:

- website
- frontend
- UI
- dashboard
- landing page
- portfolio
- web app
- React application
- Vue application
- full project
- complete application
- calculator website
- frontend prototype
- multi-file project

Examples:

"give me sum of two numbers in python"
=> SIMPLE_CODE

"write a python function to add two numbers"
=> SIMPLE_CODE

"reverse a string in C++"
=> SIMPLE_CODE

"explain binary search in C++"
=> SIMPLE_CODE

"debug this python code"
=> SIMPLE_CODE

"create a calculator website"
=> PROJECT

"build a React dashboard"
=> PROJECT

"make a portfolio website"
=> PROJECT

"create a landing page using HTML CSS JS"
=> PROJECT

User Request:
${state.prompt}
`);

    const requestType = String(typeRes?.content || "")
      .trim()
      .toUpperCase();

    console.log("CODING REQUEST TYPE:", requestType);

    // =========================================================
    // 3. SIMPLE CODE GENERATION
    // =========================================================

    if (intent === "CODE_GENERATION" && requestType !== "PROJECT") {
      const prompt = `
You are CortexAI, an expert software engineer and coding tutor.

Answer the user's coding question directly.

USER REQUEST:
${state.prompt}

IMPORTANT RULES:

1. Follow the programming language requested by the user.
2. If Python is requested, use Python.
3. If C++ is requested, use C++.
4. If Java is requested, use Java.
5. If JavaScript is requested, use JavaScript.
6. Provide the necessary code.
7. Give a short explanation.
8. Include expected output when useful.
9. Keep the answer concise and beginner-friendly.
10. Do not create HTML/CSS/JavaScript unless web development is requested.
11. Do not create a frontend.
12. Do not create a project.
13. Do not create multiple files.
14. Do not create an artifact.
15. Do not add unnecessary libraries.
16. Do not turn a simple problem into a large application.

Use this structure when appropriate:

### Explanation

Short explanation.

### Code

Required code.

### How it works

Brief explanation.

### Output

Expected output.

Return normal Markdown.
`;

      let res;

      try {
        console.log("========== SIMPLE CODING MODEL CALL ==========");

        res = await llm.invoke(prompt);

        if (!res) {
          throw new Error("Coding model returned undefined response");
        }

        console.log("========== RAW SIMPLE CODING RESPONSE ==========");

        console.log(res);
      } catch (error) {
        console.error("========== CODING MODEL ERROR ==========");

        console.error("MESSAGE:", error?.message);
        console.error("STACK:", error?.stack);

        return {
          ...state,
          aiResponse:
            "The coding model is currently unavailable or rate-limited. Please try again.",
          artifacts: [],
        };
      }

      // =====================================================
      // EXTRACT RESPONSE
      // =====================================================

      let data = "";

      if (typeof res?.content === "string") {
        data = res.content.trim();
      } else if (Array.isArray(res?.content)) {
        data = res.content
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return item?.text || "";
          })
          .join("")
          .trim();
      }

      console.log("========== SIMPLE CODING ANSWER ==========");

      console.log(data);

      // =====================================================
      // DEDUCT CREDIT
      // =====================================================

      const deduction = await deductCredicts(
        state.userId,
        "coding",
        state.session,
      );

      console.log("CODING CREDITS:", deduction?.credits);

      return {
        ...state,
        aiResponse: data || "No response generated.",
        artifacts: [],
        credits: deduction?.credits,
      };
    }

    // =========================================================
    // 4. PROJECT / FRONTEND GENERATION
    // =========================================================

    if (intent === "CODE_GENERATION" && requestType === "PROJECT") {
      const prompt = `
You are CortexAI, an expert frontend developer and UI/UX designer.

Create a COMPLETE and WORKING frontend project for the user's request.

USER REQUEST:
${state.prompt}

==================================================
TECHNOLOGY
==================================================

- Use HTML, CSS and vanilla JavaScript.
- Use React/Vue/Next/etc ONLY if explicitly requested.
- No backend.
- No database.
- No authentication.

==================================================
DESIGN
==================================================

Create a modern, premium and polished interface.

Use:

- CSS variables
- Gradients
- Rounded cards
- Soft shadows
- Modern typography
- Good spacing
- Responsive layout
- Hover effects
- Subtle animations
- Clear visual hierarchy

Choose ONE suitable visual style and keep it consistent.

==================================================
FUNCTIONALITY
==================================================

Implement the important functionality requested by the user.

Use small mock data when necessary.

Everything visible in the UI should work.

Examples:

- Buttons should work.
- Forms should work.
- Search should work if included.
- Filters should work if included.
- Modals should open and close.
- Navigation should work.
- Interactive elements should have appropriate behavior.

Do not add unnecessary functionality.

==================================================
KEEP THE PROJECT COMPACT
==================================================

Generate ONLY the files required to run the project.

Maximum 3 files.

For a normal HTML/CSS/JS website use:

1. index.html
2. style.css
3. script.js

Keep each file reasonably small.

Do NOT generate:

- Backend
- Database
- Authentication
- Huge datasets
- Complex charts
- Large SVGs
- Base64 images
- Unnecessary pages
- Unnecessary libraries
- TODO placeholders
- Fake unfinished functions
- Repeated code
- Long comments

Use remote image URLs only when images are useful.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "files": [
    {
      "name": "index.html",
      "content": "complete HTML here"
    },
    {
      "name": "style.css",
      "content": "complete CSS here"
    },
    {
      "name": "script.js",
      "content": "complete JavaScript here"
    }
  ]
}

==================================================
STRICT RULES
==================================================

- Return JSON only.
- No Markdown.
- No code fences.
- No explanation outside JSON.
- Every file must be complete.
- All files must work together.
- Do not leave TODOs.
- Do not leave unfinished code.
- Do not create additional files.
- Keep the implementation compact.
- Prioritize working functionality over excessive styling.
`;

      let res;

      try {
        console.log("========== PROJECT CODING MODEL CALL ==========");

        res = await llm.invoke(prompt);

        if (!res) {
          throw new Error("Coding model returned undefined response");
        }

        console.log("========== PROJECT MODEL RESPONSE RECEIVED ==========");

        console.log(
          "CODING FINISH REASON:",
          res?.response_metadata?.finish_reason ||
            res?.response_metadata?.finishReason ||
            res?.additional_kwargs?.finish_reason,
        );

        console.log(
          "CODING OUTPUT TOKENS:",
          res?.usage_metadata?.output_tokens ||
            res?.response_metadata?.usage?.completion_tokens ||
            0,
        );
      } catch (error) {
        console.error("========== CODING MODEL ERROR ==========");

        console.error("MESSAGE:", error?.message);
        console.error("STACK:", error?.stack);

        return {
          ...state,
          aiResponse:
            "The coding model is currently unavailable or rate-limited. Please try again.",
          artifacts: [],
        };
      }

      // =====================================================
      // CHECK FINISH REASON
      // =====================================================

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
        console.error("❌ PROJECT GENERATION STOPPED BECAUSE OF TOKEN LIMIT");

        return {
          ...state,
          aiResponse:
            "The coding model reached its output limit while generating the project. Try asking for a smaller project.",
          artifacts: [],
        };
      }

      // =====================================================
      // EXTRACT CONTENT
      // =====================================================

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
        return {
          ...state,
          aiResponse: "The coding model returned an empty response.",
          artifacts: [],
        };
      }

      console.log("========== PROJECT RAW RESPONSE ==========");

      console.log(text);

      // =====================================================
      // REMOVE MARKDOWN FENCES
      // =====================================================

      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // =====================================================
      // FIND JSON
      // =====================================================

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start === -1 || end === -1 || end <= start) {
        console.error("❌ PROJECT JSON OBJECT NOT FOUND");

        return {
          ...state,
          aiResponse: "The coding model did not return valid project JSON.",
          artifacts: [],
        };
      }

      text = text.substring(start, end + 1);

      // =====================================================
      // PARSE JSON
      // =====================================================

      let data;

      try {
        data = JSON.parse(text);

        console.log("✅ PROJECT JSON PARSED SUCCESSFULLY");
      } catch (error) {
        console.warn("PRIMARY JSON.parse FAILED:", error?.message);

        try {
          const repaired = jsonrepair(text);

          data = JSON.parse(repaired);

          console.log("✅ JSON REPAIR SUCCEEDED");
        } catch (repairError) {
          console.error("❌ JSON REPAIR FAILED:", repairError?.message);

          return {
            ...state,
            aiResponse: "The coding model returned malformed project data.",
            artifacts: [],
          };
        }
      }

      // =====================================================
      // VALIDATE FILES
      // =====================================================

      if (!data || !Array.isArray(data.files)) {
        console.error("❌ INVALID PROJECT FILE STRUCTURE");

        return {
          ...state,
          aiResponse: "The coding model returned invalid project files.",
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
        return {
          ...state,
          aiResponse: "No valid files were generated.",
          artifacts: [],
        };
      }

      // Maximum 3 files
      const finalFiles = validFiles.slice(0, 3);

      console.log("========== GENERATED FILES ==========");

      finalFiles.forEach((file, index) => {
        console.log(
          `FILE ${index}:`,
          file.name,
          `(${file.content.length} chars)`,
        );
      });

      // =====================================================
      // DEDUCT CREDIT
      // =====================================================

      const deduction = await deductCredicts(
        state.userId,
        "coding",
        state.session,
      );

      console.log("CODING CREDITS:", deduction?.credits);

      // =====================================================
      // RETURN PROJECT
      // =====================================================

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

        credits: deduction?.credits,
      };
    }

    // =========================================================
    // 5. OTHER CODING REQUESTS
    // =========================================================

    const prompt = `
You are CortexAI, an expert software engineer and coding tutor.

USER REQUEST:
${state.prompt}

INTENT:
${intent}

Answer the user's request clearly.

IMPORTANT:

- Follow the requested programming language.
- Provide code when needed.
- Explain important parts.
- Include examples when useful.
- Keep the response concise.
- Do not create project artifacts.
- Do not create frontend projects unless explicitly requested.
- Do not generate multiple files.

For simple questions use:

### Explanation

Short explanation.

### Code

Necessary code.

### How it works

Brief explanation.

### Output

Expected output when useful.

Return normal Markdown.
`;

    let res;

    try {
      console.log("========== OTHER CODING MODEL CALL ==========");

      res = await llm.invoke(prompt);

      if (!res) {
        throw new Error("Coding model returned undefined response");
      }
    } catch (error) {
      console.error("========== CODING MODEL ERROR ==========");

      console.error("MESSAGE:", error?.message);
      console.error("STACK:", error?.stack);

      return {
        ...state,
        aiResponse:
          "The coding model is currently unavailable or rate-limited. Please try again.",
        artifacts: [],
      };
    }

    // =====================================================
    // EXTRACT NORMAL RESPONSE
    // =====================================================

    let data = "";

    if (typeof res?.content === "string") {
      data = res.content.trim();
    } else if (Array.isArray(res?.content)) {
      data = res.content
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return item?.text || "";
        })
        .join("")
        .trim();
    }

    // =====================================================
    // DEDUCT CREDIT
    // =====================================================

    const deduction = await deductCredicts(
      state.userId,
      "coding",
      state.session,
    );

    console.log("CODING CREDITS:", deduction?.credits);

    return {
      ...state,
      aiResponse: data || "No response generated.",
      artifacts: [],
      credits: deduction?.credits,
    };
  } catch (error) {
    console.error("========== CODING AGENT ERROR ==========");

    console.error("MESSAGE:", error?.message);
    console.error("STACK:", error?.stack);

    if (error?.status === 429) {
      return {
        ...state,
        aiResponse:
          "The coding model is currently rate-limited. Please try again later.",
        artifacts: [],
      };
    }

    return {
      ...state,
      aiResponse:
        "The coding agent encountered an unexpected error. Please try again.",
      artifacts: [],
    };
  }
};
