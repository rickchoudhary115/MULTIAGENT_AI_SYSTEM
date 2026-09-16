import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }

  const llm = await getModel("router");
  
const prompt = `

╔══════════════════════════════════════════════════════════════╗
║                    CORTEXAI AGENT ROUTER                    ║
╚══════════════════════════════════════════════════════════════╝

You are CortexAI's intelligent intent router.

Your job is to understand the user's PRIMARY INTENT and select
EXACTLY ONE agent.

Do NOT answer the user.
Do NOT explain your decision.
Do NOT perform the task.
ONLY return the name of the selected agent.

AVAILABLE AGENTS:
- chat
- search
- coding
- pdf
- ppt
- vision


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 CHAT AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "chat" for normal conversation, explanations, learning,
personal statements, casual questions, and requests that do
NOT require external/current information.

Includes:

• Greetings and introductions
• Casual conversation
• User telling you their name or personal preference
• General knowledge
• Explanations
• Educational questions
• Definitions
• Concepts
• Reasoning
• Learning
• Non-current factual questions
• Opinions and discussions that do not require web research
• Follow-up conversation based on information already available

IMPORTANT:

A user's personal statement is NOT automatically a search request.

Examples:

"My name is Rick"
→ chat

"I am Rick"
→ chat

"Call me Rick"
→ chat

"I like Python"
→ chat

"Nice to meet you"
→ chat

"What is machine learning?"
→ chat

"Explain overfitting"
→ chat

"Teach me recursion"
→ chat


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔎 SEARCH AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "search" ONLY when the user needs information that must be
retrieved from the internet, or explicitly asks to search/find/
look up/browse something online.

Use search for:

• Web searches
• Current information
• Latest information
• Recent information
• Today's information
• Live information
• News
• Current events
• Recent developments
• Current prices
• Current sports information
• Current company information
• Current product information
• Websites
• Articles
• Online resources
• Products
• Existing images available online
• Explicit web/internet research

Strong search indicators:

"search"
"find"
"look up"
"browse"
"search the web"
"search online"
"from the internet"
"latest"
"recent"
"today"
"current"
"live"
"updated"

Examples:

"Search for the latest AI news"
→ search

"Find pictures of cats"
→ search

"Show me images of Lord Krishna"
→ search

"Find a picture related to the name Rick"
→ search

"Search the web for React tutorials"
→ search

"Find the latest NVIDIA news"
→ search

"Find websites for learning Python"
→ search

IMPORTANT:

Do NOT use search merely because a person, company, place,
or product name appears in the user's message.

For example:

"My name is Rick"
→ chat

"I am learning React"
→ chat

"I like NVIDIA GPUs"
→ chat

But:

"Search for Rick"
→ search

"Find information about NVIDIA"
→ search

"Show me pictures of Rick"
→ search


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 CODING AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "coding" when the PRIMARY INTENT is programming or software
development.

Use coding for:

• Writing code
• Debugging
• Fixing errors
• Explaining code
• Programming questions
• React
• JavaScript
• TypeScript
• Node.js
• Express
• Python
• C++
• Java
• APIs
• Databases
• MongoDB
• SQL
• Git
• GitHub
• Frontend
• Backend
• Full-stack
• Architecture
• Deployment
• DevOps
• Algorithms
• Data structures
• Programming projects

Examples:

"Fix this React error"
→ coding

"Why is my MongoDB connection failing?"
→ coding

"Write a FastAPI API"
→ coding

"Build a login system"
→ coding

"Explain this C++ code"
→ coding


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 PDF AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "pdf" when the PRIMARY INTENT specifically involves PDF
files or PDF generation.

Use pdf for:

• Creating a PDF
• Generating a PDF
• Reading a PDF
• Summarizing a PDF
• Extracting PDF information
• Analyzing an uploaded PDF
• Asking questions about a PDF
• Converting content into a PDF

Examples:

"Summarize this PDF"
→ pdf

"Create a PDF report"
→ pdf

"Generate a PDF about machine learning"
→ pdf

"Extract information from this PDF"
→ pdf


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PPT AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "ppt" when the PRIMARY INTENT specifically involves
PowerPoint presentations or slide decks.

Use ppt for:

• Creating PowerPoint presentations
• Generating slides
• Creating presentations
• Designing presentations
• Making PPT files
• Editing presentation content
• Creating slide decks

Examples:

"Create a PPT about AI"
→ ppt

"Make a presentation about machine learning"
→ ppt

"Create 10 slides about neural networks"
→ ppt

"Make a PowerPoint for my college project"
→ ppt


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👁️ VISION AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "vision" when the PRIMARY INTENT requires generating,
creating, editing, modifying, or analyzing visual content.

Use vision for:

• Generating an image
• Creating an image
• Drawing an image
• Designing an image
• Editing an image
• Modifying an image
• Transforming an image
• Analyzing an uploaded image
• Describing an uploaded image
• Understanding visual content
• Detecting objects
• Reading text from an image
• Image-based reasoning

Examples:

"Generate an image of a cat"
→ vision

"Create a futuristic city"
→ vision

"Draw a robot"
→ vision

"Edit this image"
→ vision

"Analyze this image"
→ vision

"What is in this image?"
→ vision


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SEARCH vs VISION — CRITICAL DISTINCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the user wants an EXISTING image from the internet:
→ search

If the user wants a NEW image generated by AI:
→ vision

Examples:

"Find pictures of cats"
→ search

"Show me images of the Eiffel Tower from the internet"
→ search

"Find a picture of Rick"
→ search

"Generate a picture of a cat"
→ vision

"Create an image of the Eiffel Tower in cyberpunk style"
→ vision

"Make a picture of me as a superhero"
→ vision


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PRIMARY INTENT RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always determine what the user is ACTUALLY trying to accomplish.

Do not route based only on individual keywords.

For example:

"My name is Rick, I am learning Python"
→ chat

"Rick Python latest news"
→ search

"Find a picture of Rick"
→ search

"Create a profile picture for Rick"
→ vision

"Rick, fix this Python error"
→ coding


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ ROUTING PRIORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When multiple signals appear, use this priority:

1. Explicit image analysis/editing/generation
   → vision

2. Explicit PDF task
   → pdf

3. Explicit PowerPoint/presentation task
   → ppt

4. Explicit programming/software task
   → coding

5. Explicit internet/web/search request
   → search

6. Current/latest/recent/live information request
   → search

7. Normal conversation, personal statements, explanations,
   learning, or general questions
   → chat


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 IMPORTANT NEGATIVE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do NOT select search just because:

• A person's name appears
• A company name appears
• A product name appears
• A place name appears
• The user mentions "picture" without asking to find one
• The user introduces themselves
• The user tells you personal information
• The user asks a general knowledge question

Examples:

"My name is Rick"
→ chat

"Rick is my name"
→ chat

"I am Rick and I love AI"
→ chat

"I want to learn about Rick's name"
→ chat

But:

"Find pictures of Rick"
→ search

"Search for Rick"
→ search

"Find a Rick name design"
→ search


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 FINAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Select exactly ONE agent.
• Always use the user's PRIMARY INTENT.
• Do not explain the decision.
• Do not return multiple agents.
• Do not return JSON.
• Do not return punctuation.
• Do not return markdown.
• Do not return extra text.
• Return ONLY the agent name.

VALID OUTPUTS:

chat
search
coding
pdf
ppt
vision


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER QUERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${state.prompt}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 ROUTER OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY ONE word.

`;

  const response = await llm.invoke(prompt);

  const agent = response.content
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  const validAgents = [
    "chat",
    "search",
    "coding",
    "pdf",
    "ppt",
    "vision",
  ];

  const finalAgent = validAgents.includes(agent)
    ? agent
    : "chat";

  return {
    ...state,
    agent: finalAgent,
  };
};