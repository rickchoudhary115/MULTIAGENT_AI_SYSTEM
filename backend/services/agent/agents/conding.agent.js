import { getModel } from "../config/llmModel.js";
import { jsonrepair } from "jsonrepair";

export const codingAgent = async (state) => {
  try {
    const intentllm = await getModel("intent");
    const llm = await getModel("coding");

    // =========================
    // INTENT CLASSIFICATION
    // =========================

    const intentRes = await intentllm.invoke(`
You are an intent classifier.

Return ONLY one value:

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

    // =========================
    // CODE GENERATION
    // =========================

    if (intent === "CODE_GENERATION") {
const prompt = `
You are CortexAI, an expert frontend developer and UI/UX designer known for bold,
colorful, premium interfaces — the kind that look like they belong in a design
awards showcase, not a generic admin template.

Build a visually impressive frontend prototype for the user's request.

============================================================
STACK
============================================================
- HTML
- CSS
- Vanilla JavaScript
- No React, Vue, Next.js, or frameworks unless explicitly requested.
- No external libraries or icon packs unless absolutely necessary.
  (If icons are needed, use simple inline SVG or Unicode glyphs — nothing heavy.)

============================================================
IMPORTANT
============================================================
This is a FRONTEND PROTOTYPE, not a production system.
Prioritize visual quality, color, and usability over feature quantity.
A small, gorgeous, colorful interface beats a large plain one every time.

============================================================
COLOR SYSTEM — THIS IS THE MOST IMPORTANT PART
============================================================
Do NOT default to safe grayscale-with-one-accent designs. The UI must feel
vivid, saturated, and intentional. Pick ONE cohesive palette family below (or
a clear hybrid) that best fits the user's request, then commit to it fully.

Palette directions to choose from:
1. "Aurora" — deep indigo/violet background, electric cyan + magenta gradient
   accents, glowing highlights.
2. "Sunset Pop" — warm coral, hot pink, amber, and orange gradients over a
   soft cream or deep plum background.
3. "Tropical Candy" — teal, lime, and fuchsia on a crisp white or near-black
   background for high contrast.
4. "Cyber Neon" — near-black background with neon green, electric blue, and
   hot pink glow accents, subtle scanline/grid texture via CSS only.
5. "Playful Pastel Max" — saturated pastel pink, lavender, mint, and
   sunflower yellow blocks with punchy dark-ink text for contrast.
Adapt hues to fit context (e.g. finance = jewel tones, kids app = candy
brights, dev tool = neon-on-dark), but ALWAYS use a multi-color gradient
system — never a single flat accent color.

Rules:
- Define a full CSS variable palette in :root: at least 2 background tones,
  1 surface/card tone, 3-5 accent colors, and a matching gradient pair for
  each major accent (e.g. --grad-primary: linear-gradient(135deg, var(--accent-1), var(--accent-2))).
- Every primary button, hero section, active nav item, chart bar, badge, or
  stat card must use a gradient or vivid solid accent — not plain gray/white.
- Use color to encode meaning where relevant (status badges, categories,
  priority tags) with distinct, saturated hues per category.
- Include at least one glowing/soft-shadow colored effect (colored box-shadow
  matching the element's accent, not just black shadow).
- Background should NOT be plain white or plain black — use a subtle gradient,
  tinted surface, or soft mesh/blob background (pure CSS radial-gradients).
- Dark or light mode is fine, but either way it must feel rich, not sterile.

============================================================
DESIGN
============================================================
- Premium modern UI, magazine/awards-site quality
- Strong, deliberate color palette per the system above
- CSS variables for every color, spacing, radius, and shadow value
- Gradient accents on buttons, headers, active states, and key stat/data elements
- Beautiful cards with soft colored shadows and rounded corners (12-24px)
- Glass/blur effects where appropriate (backdrop-filter) layered over the
  colorful background so the color shows through
- Modern, confident typography — one distinctive font pairing (system font
  stack is fine, but set clear weight/size hierarchy)
- Responsive layout (mobile-first breakpoints, at least one @media query)
- Smooth hover/focus transitions (transform + color/shadow, 150-250ms)
- Subtle entrance animations (fade/slide-in on load, CSS-only is fine)
- Clean, generous spacing — no cramped UI
- Strong visual hierarchy: one hero/dominant element per screen
- Attractive, colorful buttons (gradient fill or vivid solid, clear hover state)
- Professional but characterful navigation (colored underline/pill on active state)
- Impressive, color-forward first screen — this is what the user sees first,
  it must not look like a boilerplate template

============================================================
FUNCTIONALITY
============================================================
Implement only the most important interactions.
Use small mock/demo data (5-8 items max for any list/table).
Use localStorage only when it meaningfully improves the demo (e.g. persisting
a form, a theme toggle, or a small saved list).
Avoid complex business logic — this is a prototype, not a real system.

For dashboards/admin systems:
- Show a dashboard with a colorful header/hero strip
- Show 3-4 key statistics as vivid gradient stat cards (with a small
  up/down trend indicator, colored accordingly)
- Show a small data table or card list (5-8 rows), with colorful status
  badges per row
- Add search or filter if useful, styled to match the palette
- Add ONE simple modal or inline form, styled consistently (not a plain
  browser-default form)
- Add basic interactions: hover states, a working filter/search, a toggle,
  or a simple add/remove action against the mock data

For landing pages:
- Hero section with a bold gradient background or gradient text treatment
- Features section (3-4 cards, each with a distinct accent color from the
  palette so the grid itself reads as colorful, not monochrome)
- Main content section relevant to the request
- CTA section with strong gradient button and contrasting background
- Footer, kept simple but on-brand (matching background/accent tones)

For portfolios/creative sites:
- Bold, color-blocked hero
- Colorful project/work cards with hover lift + glow
- Distinct accent per project card if showing a grid

============================================================
DO NOT
============================================================
- Build authentication
- Build backend APIs
- Build databases
- Build complex charts (simple CSS bar/donut visualizations are fine, no
  charting libraries)
- Generate huge datasets
- Generate large or intricate SVGs (simple decorative shapes/blobs are fine)
- Generate base64 images
- Generate unnecessary pages
- Generate unnecessary components
- Default to a dull, monochrome, "safe corporate gray" palette — this is
  the single most important failure mode to avoid
- Add comments everywhere
- Add placeholder/TODO code
- Repeat code

============================================================
CODE LIMITS
============================================================
- index.html: maximum 100 lines
- style.css: maximum 180 lines (a few extra lines are allowed here
  specifically to accommodate the richer color/gradient/variable system)
- script.js: maximum 70 lines

Keep all code compact and complete — no truncation.

============================================================
OUTPUT
============================================================
Return ONLY valid JSON.

Exactly 3 files:

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

============================================================
RULES
============================================================
- No Markdown
- No code fences
- No explanation
- No text outside JSON
- Every file must contain complete, working code
- Do not truncate files
- Keep the entire response compact
- Prefer CSS (gradients, shadows, variables) over large assets
- Prefer mock data over complex logic
- Prefer 3-5 useful, colorful, well-executed features over 15 flat ones

============================================================
QUALITY RULE
============================================================
Make the first screen look impressive AND colorful — vivid palette,
confident gradients, visible hierarchy. A reviewer should be able to tell
at a glance that color was a deliberate design decision, not an afterthought.
Prioritize design and color quality over application complexity.

USER REQUEST:
${state.prompt}
`;

      // =========================
      // CODING MODEL CALL
      // =========================

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

      // =========================
      // CHECK FINISH REASON
      // =========================

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

      // Model stopped because token limit was reached
      if (finishReason === "length") {
        console.error("========== CODING RESPONSE TRUNCATED ==========");
        console.error("The model reached its output token limit.");
        console.error("Output tokens:", outputTokens);
        console.error("===============================================");

        return {
          ...state,
          aiResponse:
            "The coding model stopped before completing the project. Please try again.",
          artifacts: [],
        };
      }

      // =========================
      // EXTRACT MODEL CONTENT
      // =========================

      let text = "";

      if (typeof res?.content === "string") {
        text = res.content.trim();
      } else if (Array.isArray(res?.content)) {
        text = res.content
          .map((item) => {
            if (typeof item === "string") return item;
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

      // =========================
      // REMOVE MARKDOWN FENCES
      // =========================

      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // =========================
      // EXTRACT JSON
      // =========================

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

      // =========================
      // PARSE JSON
      // =========================

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

      // =========================
      // VALIDATE FILES
      // =========================

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

      // =========================
      // LOG GENERATED FILES
      // =========================

      console.log("========== GENERATED FILES ==========");

      validFiles.forEach((file, index) => {
        console.log(`FILE ${index}:`, file.name);
      });

      console.log("=====================================");

      // =========================
      // RETURN ARTIFACT
      // =========================

      return {
        ...state,
        aiResponse: "Code Generated Successfully",

        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            title: state.prompt,
            files: validFiles,
          },
        ],
      };
    }

    // =========================
    // OTHER CODING REQUESTS
    // =========================

    const prompt = `
The user's request is:

${intent}

Return Markdown only.

Do not generate project files.

Use:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code

User Request:
${state.prompt}
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

    let data = "";

    if (typeof res?.content === "string") {
      data = res.content;
    } else if (Array.isArray(res?.content)) {
      data = res.content
        .map((item) => {
          if (typeof item === "string") return item;
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
