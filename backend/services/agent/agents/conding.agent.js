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

Use PROJECT only when the user explicitly asks for things such as:

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

    if (
      intent === "CODE_GENERATION" &&
      requestType !== "PROJECT"
    ) {
      const prompt = `
You are CortexAI, an expert software engineer and coding tutor.

Answer the user's coding question directly.

USER REQUEST:
${state.prompt}

IMPORTANT RULES:

1. Follow the programming language requested by the user.

2. If the user asks for Python, use Python.

3. If the user asks for C++, use C++.

4. If the user asks for Java, use Java.

5. If the user asks for JavaScript, use JavaScript.

6. Provide the necessary code.

7. Also provide a short, clear explanation of what the code does.

8. Include an example or expected output when useful.

9. Keep the answer concise and beginner-friendly.

10. Do NOT create HTML/CSS/JavaScript unless the user asks for
web development.

11. Do NOT create a frontend.

12. Do NOT create a project.

13. Do NOT create multiple files.

14. Do NOT create an artifact.

15. Do NOT add unnecessary libraries or frameworks.

16. Do NOT turn a simple programming problem into a large application.

Use this structure when appropriate:

### Explanation

Short explanation.

### Code

The required code.

### How it works

Short explanation of the important lines.

### Output

Expected output.

Example:

User:
give me sum of two numbers in python

Response:

### Explanation

We can add two numbers in Python using the `+` operator.

\`\`\`python
def add(a, b):
    return a + b

a = 10
b = 20

result = add(a, b)

print(result)
\`\`\`

### How it works

- add(a, b) takes two numbers.
- a + b adds them.
- return sends the result back.
- print() displays the result.

### Output

30

Return normal Markdown.
`;

      let res;

      try {
        console.log(
          "========== SIMPLE CODING MODEL CALL =========="
        );

        res = await llm.invoke(prompt);

        if (!res) {
          throw new Error(
            "Coding model returned undefined response"
          );
        }

        console.log(
          "========== RAW SIMPLE CODING RESPONSE =========="
        );

        console.log(res);
      } catch (error) {
        console.error(
          "========== CODING MODEL ERROR =========="
        );

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

      console.log(
        "========== SIMPLE CODING ANSWER =========="
      );

      console.log(data);

      // =====================================================
      // DEDUCT CREDIT
      // =====================================================

      const deduction = await deductCredicts(
        state.userId,
        "coding",
        state.session
      );

      console.log(
        "CODING CREDITS:",
        deduction?.credits
      );

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

    if (
      intent === "CODE_GENERATION" &&
      requestType === "PROJECT"
    ) {
      const prompt = `
You are CortexAI, an expert frontend developer and UI/UX designer.

The user explicitly requested a complete project.

USER REQUEST:

${state.prompt}

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

Create a premium, modern and polished interface.

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
- Strong visual hierarchy

Choose ONE visual direction:

1. Aurora
2. Sunset
3. Tropical
4. Cyber
5. Pastel

==================================================
FUNCTIONALITY
==================================================

Build only the important interactions.

Use small mock data.

Maximum 5-8 items for lists/tables.

For dashboards:

- Hero/header
- 3-4 statistic cards
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
- TODO placeholders
- Repeated code

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

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
- All files must be complete
- All files must work together
- Do not add additional files
- Keep the response compact
`;

      let res;

      try {
        console.log(
          "========== PROJECT CODING MODEL CALL =========="
        );

        res = await llm.invoke(prompt);

        if (!res) {
          throw new Error(
            "Coding model returned undefined response"
          );
        }
      } catch (error) {
        console.error(
          "========== CODING MODEL ERROR =========="
        );

        console.error(error?.message);
        console.error(error?.stack);

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

      console.log(
        "CODING FINISH REASON:",
        finishReason
      );

      console.log(
        "CODING OUTPUT TOKENS:",
        outputTokens
      );

      if (finishReason === "length") {
        return {
          ...state,
          aiResponse:
            "The coding model stopped before completing the project. Please try again with a smaller request.",
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
          aiResponse:
            "The coding model returned an empty response.",
          artifacts: [],
        };
      }

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

      if (
        start === -1 ||
        end === -1 ||
        end <= start
      ) {
        return {
          ...state,
          aiResponse:
            "The coding model did not return valid project JSON.",
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
      } catch (error) {
        console.warn(
          "PRIMARY JSON.parse FAILED:",
          error?.message
        );

        try {
          const repaired = jsonrepair(text);

          data = JSON.parse(repaired);

          console.log(
            "JSON REPAIR SUCCEEDED"
          );
        } catch (repairError) {
          console.error(
            "JSON REPAIR FAILED:",
            repairError?.message
          );

          return {
            ...state,
            aiResponse:
              "The coding model returned malformed project data.",
            artifacts: [],
          };
        }
      }

      // =====================================================
      // VALIDATE FILES
      // =====================================================

      if (!data || !Array.isArray(data.files)) {
        return {
          ...state,
          aiResponse:
            "The coding model returned invalid project files.",
          artifacts: [],
        };
      }

      const validFiles = data.files.filter(
        (file) =>
          file &&
          typeof file.name === "string" &&
          typeof file.content === "string"
      );

      if (validFiles.length === 0) {
        return {
          ...state,
          aiResponse:
            "No valid files were generated.",
          artifacts: [],
        };
      }

      const finalFiles = validFiles.slice(0, 3);

      console.log(
        "========== GENERATED FILES =========="
      );

      finalFiles.forEach((file, index) => {
        console.log(
          `FILE ${index}:`,
          file.name
        );
      });

      // =====================================================
      // DEDUCT CREDIT
      // =====================================================

      const deduction = await deductCredicts(
        state.userId,
        "coding",
        state.session
      );

      // =====================================================
      // RETURN PROJECT
      // =====================================================

      return {
        ...state,

        aiResponse:
          "Code Generated Successfully",

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

User request:

${state.prompt}

Intent:

${intent}

Answer the user's request clearly.

IMPORTANT:

- Follow the requested programming language.
- Provide code when code is needed.
- Explain the important parts.
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
      res = await llm.invoke(prompt);

      if (!res) {
        throw new Error(
          "Coding model returned undefined response"
        );
      }
    } catch (error) {
      console.error(
        "========== CODING MODEL ERROR =========="
      );

      console.error(error?.message);
      console.error(error?.stack);

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
      state.session
    );

    console.log(
      "CODING CREDITS:",
      deduction?.credits
    );

    return {
      ...state,
      aiResponse:
        data || "No response generated.",
      artifacts: [],
      credits: deduction?.credits,
    };

  } catch (error) {
    console.error(
      "========== CODING AGENT ERROR =========="
    );

    console.error(error?.message);
    console.error(error?.stack);

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