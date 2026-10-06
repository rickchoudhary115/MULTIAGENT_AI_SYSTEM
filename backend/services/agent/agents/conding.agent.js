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
You are Kivo, an expert software engineer and coding tutor.

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
        console.log("MODEL:", llm?.constructor?.name);
        console.log("PROMPT LENGTH:", prompt.length);

        res = await llm.invoke(prompt);

        if (!res) {
          throw new Error("Coding model returned undefined response");
        }

        console.log(
          "========== SIMPLE CODING MODEL RESPONSE RECEIVED ==========",
        );

        console.log("RESPONSE TYPE:", res?.constructor?.name);
        console.log("CONTENT TYPE:", typeof res?.content);
        console.log("RESPONSE:", res);
      } catch (error) {
        console.error("========== CODING MODEL ERROR ==========");
        console.error("NAME:", error?.name);
        console.error("MESSAGE:", error?.message);
        console.error("STATUS:", error?.status);
        console.error("CODE:", error?.code);
        console.error("STACK:", error?.stack);

        return {
          ...state,
          aiResponse:
            error?.status === 429
              ? "The coding model is currently rate-limited. Please try again later."
              : "The coding model failed to generate a response. Please try again.",
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
You are Kivo, an expert frontend developer and UI/UX designer.

Build a COMPLETE, WORKING, polished frontend for:

USER REQUEST:
${state.prompt}

## GOAL

Create the requested frontend as a compact, production-style prototype.

Prioritize:

1. Working functionality
2. Clean UI/UX
3. Responsive design
4. Complete implementation
5. Compact code

Do NOT try to build an unnecessarily large application.

## STACK

Use only:

* HTML
* CSS
* Vanilla JavaScript

Use React/Vue/Next/etc. ONLY if explicitly requested by the user.

No backend.
No database.
No authentication.
No server code.

Maximum 3 files:

* index.html
* style.css
* script.js

## DESIGN

Choose ONE visual style that best fits the request:

dark, minimal, glassmorphism, futuristic, elegant, colorful, or clean.

Create:

* Strong visual hierarchy
* Modern typography
* Consistent spacing
* CSS variables
* Attractive but simple colors
* Rounded cards/buttons
* Subtle shadows
* Small animations
* Responsive mobile/tablet/desktop layout
* Professional visual hierarchy

Avoid unnecessary decorative elements.

## FUNCTIONALITY

Implement only the functionality directly relevant to the user's request.

Interactive elements must work.

Examples when relevant:

* Navigation
* Search
* Filters
* Tabs
* Forms
* Modals
* Add/remove actions
* Cart
* Quantity controls
* Sorting
* Toggles
* Buttons
* Status updates

Use SMALL mock data only when required.

For example, if the user asks for a food delivery website, use only a small set of restaurants and food items sufficient to demonstrate the UI and interactions.

Do NOT create hundreds of mock items.

## CODE EFFICIENCY

This is extremely important.

Keep the total generated code SMALL and COMPLETE.

Target approximately:

* HTML: 100–180 lines
* CSS: 150–250 lines
* JavaScript: 100–180 lines

These are targets, not requirements. If fewer lines can implement the requested functionality, use fewer.

Rules:

* Reuse CSS classes.
* Reuse JavaScript functions.
* Avoid duplicated HTML.
* Avoid duplicated CSS.
* Avoid huge datasets.
* Avoid large inline SVGs.
* Avoid base64 images.
* Avoid unnecessary comments.
* Avoid unnecessary animations.
* Avoid complex charts.
* Avoid unnecessary libraries.
* Avoid excessive sections.
* Avoid unnecessary features.
* Do not generate code simply to make the project look larger.

Use remote image URLs when images genuinely improve the UI.

## IMPORTANT OUTPUT LIMIT RULE

The response MUST fit comfortably within the model's output limit.

If the user's request is broad, simplify the implementation rather than generating more code.

Never sacrifice JSON validity.

Never stop in the middle of a file.

Never generate partial files.

Never generate placeholder text such as:

"add more items here"
"continue..."
"rest of code..."
"TODO"
"implement later"

Every returned file must be complete and immediately usable.

## FOOD DELIVERY EXAMPLE

If the user asks for something like:

"make a food delivery website UI and frontend"

Build a compact but complete demo containing only the essential experience:

* Header/navigation
* Search
* Small restaurant/food list
* Category/filter buttons
* Food cards
* Add-to-cart functionality
* Cart summary
* Quantity controls
* Total price
* Responsive layout

Do NOT add:

* Authentication
* Payment gateway
* Backend
* Admin dashboard
* User profiles
* Order tracking system
* Complex maps
* Large restaurant datasets
* Complex animations
* Unnecessary pages

## OUTPUT FORMAT

Return ONLY valid JSON.

Use exactly this structure:

{
"files": [
{
"name": "index.html",
"content": "complete HTML"
},
{
"name": "style.css",
"content": "complete CSS"
},
{
"name": "script.js",
"content": "complete JavaScript"
}
]
}

## STRICT JSON RULES

* Return JSON only.
* No Markdown.
* No code fences.
* No explanation.
* Exactly 3 files.
* Every file must be complete.
* Escape quotes correctly.
* Escape newlines correctly.
* Do not truncate code.
* Do not omit required functionality.
* Do not add additional files.
* Keep the implementation compact enough to finish completely.

## FINAL PRIORITY

If there is a conflict between adding more features and keeping the project complete:

CHOOSE A SMALLER COMPLETE PROJECT.

A smaller fully working frontend is better than a large incomplete frontend.
`

      let res;

      try {
        console.log("========== PROJECT CODING MODEL CALL ==========");
        console.log("MODEL:", llm?.constructor?.name);
        console.log("PROMPT LENGTH:", prompt.length);

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

        console.log("RESPONSE TYPE:", res?.constructor?.name);
        console.log("CONTENT TYPE:", typeof res?.content);
      } catch (error) {
        console.error("========== CODING MODEL ERROR ==========");
        console.error("NAME:", error?.name);
        console.error("MESSAGE:", error?.message);
        console.error("STATUS:", error?.status);
        console.error("CODE:", error?.code);
        console.error("STACK:", error?.stack);

        return {
          ...state,
          aiResponse:
            error?.status === 429
              ? "The coding model is currently rate-limited. Please try again later."
              : "The coding model failed to generate the project. Please try again.",
          artifacts: [],
        };
      }

   
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

    
      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      
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

    const prompt = `
You are Kivo, an expert software engineer and coding tutor.

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
      console.log("MODEL:", llm?.constructor?.name);
      console.log("PROMPT LENGTH:", prompt.length);

      res = await llm.invoke(prompt);

      if (!res) {
        throw new Error("Coding model returned undefined response");
      }

      console.log("========== OTHER CODING MODEL RESPONSE RECEIVED ==========");

      console.log("RESPONSE TYPE:", res?.constructor?.name);
      console.log("CONTENT TYPE:", typeof res?.content);
    } catch (error) {
      console.error("========== CODING MODEL ERROR ==========");
      console.error("NAME:", error?.name);
      console.error("MESSAGE:", error?.message);
      console.error("STATUS:", error?.status);
      console.error("CODE:", error?.code);
      console.error("STACK:", error?.stack);

      return {
        ...state,
        aiResponse:
          error?.status === 429
            ? "The coding model is currently rate-limited. Please try again later."
            : "The coding model failed to generate a response. Please try again.",
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
    console.error("NAME:", error?.name);
    console.error("MESSAGE:", error?.message);
    console.error("STATUS:", error?.status);
    console.error("CODE:", error?.code);
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
