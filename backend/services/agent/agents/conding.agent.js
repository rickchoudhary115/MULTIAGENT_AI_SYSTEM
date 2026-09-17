import { getModel } from "../config/llmModel.js";

export const codingAgent = async (state) => {
  try {
    const intentllm = await getModel("intent");
    const llm = await getModel("coding");

    const intentRes = await intentllm.invoke(`

You are a coding intent classifier for an AI assistant.

Analyze the user's request and determine what kind of coding help they need.

User request:

"${state.prompt}"

Classify the request into exactly one of these categories:

- code_generation
- code_debugging
- code_explanation
- code_review
- algorithm_dsa
- project_architecture
- database
- api_backend
- frontend
- devops_deployment
- other

Also provide a short explanation of why you selected that category.

Return ONLY valid JSON in this format:

{
  "intent": "category_name",
  "reason": "short explanation"
}

Do not write code.
Do not answer the user's coding question.
Only classify the intent.

`);

    console.log("RAW INTENT:", intentRes.content);

    const intentData = JSON.parse(intentRes.content);
    const intent = intentData.intent;

    console.log("DETECTED INTENT:", intent);


    if (intent === "code_generation") {
      const prompt = `

You are an expert software engineer and coding assistant.

The user wants code to be generated.

User request:

"${state.prompt}"

Your task:

- Understand the user's exact requirement.
- Generate clean, correct, and runnable code.
- Use the programming language/framework requested by the user.
- If no language is specified, choose the most appropriate one.
- Keep the code simple, maintainable, and production-friendly.
- Include all necessary imports.
- Do not invent APIs, libraries, or functions.
- If multiple files are required, clearly specify the filename for each file.
- Briefly explain the important parts of the solution.
- Do not include unnecessary explanations.

Return ONLY valid JSON.

Do not use Markdown outside the JSON.
Do not wrap the JSON inside a code block.

Return exactly this structure:

{
  "type": "code_generation",
  "answer": "Short explanation of the solution",
  "code": "Complete generated code",
  "language": "Programming language used",
  "files": [
    {
      "filename": "example.html",
      "code": "Code for this file"
    },
    {
      "filename": "example.css",
      "code": "Code for this file"
    },
    {
      "filename": "example.js",
      "code": "Code for this file"
    }
  ]
}

Rules:

- "answer" must contain a concise explanation.
- "code" should contain the complete code when only one file is needed.
- If multiple files are needed, put each file inside "files".
- Use an empty array for "files" if only the "code" field is needed.
- Ensure the output is valid JSON.
- Escape quotes and newlines correctly inside JSON strings.

`;

      const res = await llm.invoke(prompt);

      console.log("RAW CODE RESPONSE:", res.content);

      const data = JSON.parse(res.content);

      return {
        ...state,
        aiResponse: data.answer,
        artifacts: [
          {
            id: Date.now(),
            type: "Projects",
            files: data.files || [],
          },
        ],
      };
    }
    const res = await llm.invoke(`

You are an expert software engineer and coding assistant.

The user's request is:

"${state.prompt}"

The detected coding intent is:

"${intent}"

Your task is to answer the user's request based on the detected intent.

Intent-specific instructions:

- code_debugging:
  Identify the cause of the problem, explain why it happens, and provide the corrected code.
  Clearly explain what was wrong and what was changed.

- code_explanation:
  Explain the provided code clearly and step by step.
  Do not unnecessarily rewrite the entire original code.
  After the explanation, provide 1 or 2 small code examples showing how the concept, function, or technique can be used in practice.
  Keep the examples short and directly related to the code being explained.

- code_review:
  Review the code for bugs, security issues, performance problems, readability, and best practices.
  Provide specific improvements and examples where useful.

- algorithm_dsa:
  Explain the approach, provide the solution, and include time and space complexity.

- project_architecture:
  Suggest a suitable architecture, folder structure, components, and data flow based on the user's requirements.

- database:
  Help with database design, schemas, queries, indexing, relationships, and database-related errors.

- api_backend:
  Help with APIs, backend logic, authentication, middleware, controllers, routes, databases, and server-side implementation.

- frontend:
  Help with UI, React, HTML, CSS, JavaScript, state management, components, and frontend errors.

- devops_deployment:
  Help with Docker, deployment, environment variables, CI/CD, cloud hosting, servers, and production configuration.

- other:
  Provide the most appropriate technical solution based on the user's request.

General rules:

- Give a direct and technically correct answer.
- Use the programming language/framework requested by the user.
- Provide code when code is required.
- Use Markdown for explanations and code blocks.
- Do not invent APIs, libraries, or functions.
- Keep the solution simple and maintainable.
- Explain important changes briefly.
- If the user's code contains an error, clearly identify the cause before showing the fix.
- Do not unnecessarily repeat the user's entire code.

Return the final answer that should be shown directly to the user.

`);

    return {
      ...state,
      aiResponse: res.content,
      artifacts: [],
    };
  } catch (error) {
    console.error("CODING AGENT ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);

    throw error;
  }
};
