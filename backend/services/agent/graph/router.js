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

══════════════════════════════════════════════════════════════╗
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
personal statements, casual questions, general knowledge,
and requests that do NOT require external/current information
or software creation.

Examples:

"My name is Rick"
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

"What is a dashboard?"
→ chat

"How does a fitness tracker work?"
→ chat

IMPORTANT:

Do NOT select chat when the user is asking you to CREATE,
BUILD, GENERATE, MAKE, DEVELOP, DESIGN, or IMPLEMENT
a digital/software product.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔎 SEARCH AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "search" when the user needs information retrieved from
the internet or explicitly asks to search, find, look up,
browse, or research something online.

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
• Existing images available online
• Articles
• Online resources
• Websites
• Products
• Explicit internet research

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

"Search the web for React tutorials"
→ search

"Find the latest NVIDIA news"
→ search

"Find websites for learning Python"
→ search

"Find dashboard templates online"
→ search

"Search for fitness dashboard examples"
→ search

IMPORTANT:

Do NOT use search simply because a website, company,
person, product, or technology is mentioned.

If the user wants to CREATE the website/product/UI,
use coding instead.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 CODING AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "coding" when the PRIMARY INTENT is programming,
software development, software creation, or creation of
a digital interface/application.

IMPORTANT:

The user does NOT need to mention code, programming,
HTML, CSS, JavaScript, React, or any programming language.

If the user asks to CREATE, BUILD, GENERATE, MAKE, DEVELOP,
DESIGN, or IMPLEMENT a digital/software product, choose:

→ coding


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 PROGRAMMING & SOFTWARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use coding for:

• Writing code
• Generating code
• Debugging
• Fixing errors
• Code review
• Code explanation
• Code optimization
• Code conversion
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
• Software architecture
• Deployment
• DevOps
• Algorithms
• Data structures
• Programming projects


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 WEBSITE / UI / APP CREATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are CODING requests even when no programming language
is mentioned.

Use coding when the user wants to create:

• Website
• Webpage
• Web application
• Mobile application
• Dashboard
• Admin panel
• Portfolio
• Landing page
• UI
• UX interface
• Frontend
• Component
• Form
• Calculator
• Tracker
• Habit tracker
• Fitness tracker
• Fitness dashboard
• Analytics dashboard
• CRM
• Ecommerce interface
• Management system
• Student management system
• Library management system
• Task management system
• Weather app
• Chat application
• Login page
• Signup page
• Profile page
• Settings page
• Digital tool
• Software prototype


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 CREATION VERBS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These verbs strongly indicate CODING when the object is
a digital/software product:

• create
• build
• generate
• make
• develop
• design
• implement
• code
• program
• construct

Examples:

"Create a dashboard"
→ coding

"Build a dashboard"
→ coding

"Generate a dashboard"
→ coding

"Make a fitness dashboard"
→ coding

"Create a habit tracker"
→ coding

"Build a fitness tracker"
→ coding

"Generate a portfolio website"
→ coding

"Make a landing page"
→ coding

"Create an admin panel"
→ coding

"Build an ecommerce website"
→ coding

"Design a modern login page"
→ coding

"Create a React dashboard"
→ coding

"Build a frontend for my project"
→ coding

"Generate HTML CSS JavaScript for a dashboard"
→ coding


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CRITICAL DASHBOARD RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the user asks to CREATE, BUILD, GENERATE, MAKE,
DEVELOP, DESIGN, or IMPLEMENT a dashboard:

→ coding

Examples:

"Create a dashboard"
→ coding

"Build a dashboard"
→ coding

"Generate a dashboard"
→ coding

"Make a fitness dashboard"
→ coding

"Create a habit tracker dashboard"
→ coding

"Generate a habit tracker or fitness dashboard"
→ coding

"Build an analytics dashboard"
→ coding

"Create an admin dashboard"
→ coding


BUT:

"What is a dashboard?"
→ chat

"How does a dashboard work?"
→ chat

"Explain dashboard design"
→ chat

"Find dashboard templates"
→ search

"Search for dashboard examples"
→ search


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ PRIMARY INTENT DISTINCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always understand what the user wants to ACCOMPLISH.

Do not route based only on one keyword.

The same noun can belong to different agents depending
on the user's intent.

Example:

"dashboard"
→ chat

"what is a dashboard?"
→ chat

"explain dashboards"
→ chat

"find dashboard examples"
→ search

"search dashboard templates"
→ search

"create a dashboard"
→ coding

"build a dashboard"
→ coding

"generate a fitness dashboard"
→ coding


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 PDF AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use "pdf" when the PRIMARY INTENT specifically involves
PDF files or PDF generation.

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

Use "vision" when the PRIMARY INTENT requires:

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


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SEARCH vs VISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the user wants an EXISTING image from the internet:

→ search

If the user wants a NEW image generated by AI:

→ vision

Examples:

"Find pictures of cats"
→ search

"Show me images of the Eiffel Tower"
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

Always determine what the user is actually trying to accomplish.

Examples:

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

"Create a fitness dashboard"
→ coding

"Generate a habit tracker"
→ coding

"Build a portfolio website"
→ coding

"Explain what a fitness dashboard is"
→ chat

"Find fitness dashboard examples"
→ search


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ ROUTING PRIORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When multiple signals appear, use this priority:

1. Explicit image generation/editing/analysis
   → vision

2. Explicit PDF task
   → pdf

3. Explicit PowerPoint/presentation task
   → ppt

4. CREATE / BUILD / GENERATE / MAKE / DEVELOP / DESIGN /
   IMPLEMENT a software product, website, webpage, UI,
   dashboard, application, tracker, tool, or digital interface
   → coding

5. Explicit programming/software development task
   → coding

6. Explicit internet/web/search request
   → search

7. Current/latest/recent/live information request
   → search

8. Normal conversation, personal statements, explanations,
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
• A technology name appears

Do NOT select coding just because:

• The word "dashboard" appears
• The word "website" appears
• The word "app" appears
• The word "Python" appears
• The word "React" appears

Always determine what the user wants to DO.

Examples:

"What is a dashboard?"
→ chat

"Explain React"
→ chat

"What is Python used for?"
→ chat

"Find dashboard designs"
→ search

"Search for React dashboards"
→ search

"Create a dashboard"
→ coding

"Create a React dashboard"
→ coding

"Build a website"
→ coding

"Generate a fitness app"
→ coding


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