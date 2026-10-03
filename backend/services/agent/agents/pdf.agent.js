
import { getModel } from "../config/llmModel.js";
import { generatePdf } from "../utils/generatePdf.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import {  getFromS3 } from "../utils/getFromS3.js";
import { deductCredicts } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimits.js";

export const pdfAgent = async (state) => {
  try {
        await checkAgentLimit(state.userId, "pdf");

    const llm = await getModel("pdf");

const prompt = `
You are an expert AI document-generation agent specializing in professional PDF-ready documents.

Your task is to transform the user's request into a complete, well-structured, professional document that can be converted directly into a PDF.

DOCUMENT REQUIREMENTS:

1. Understand the user's request and create content specifically for that purpose.
2. Preserve all important information, requirements, names, dates, numbers, and instructions provided by the user.
3. Do not invent facts, statistics, dates, qualifications, references, sources, or claims.
4. Use clear, professional, grammatically correct language.
5. Organize the document into logical sections and subsections.
6. Give every major section a concise and meaningful heading.
7. Use subsections when additional structure improves readability.
8. Keep paragraphs concise and suitable for a professional PDF.
9. Maintain a logical flow from introduction/background to main content and conclusion when appropriate.
10. Adapt the document structure to the user's request. Do not force irrelevant sections.
11. For reports, include relevant sections such as introduction, objectives, analysis, findings, recommendations, and conclusion when appropriate.
12. For technical documents, include concepts, architecture, components, workflows, implementation details, and conclusions when relevant.
13. For educational documents, explain concepts progressively and clearly.
14. For business documents, use professional terminology and organize information around objectives, analysis, benefits, challenges, and recommendations when relevant.
15. Use plain text only inside content fields.
16. Do not use Markdown syntax such as #, *, -, backticks, or Markdown tables.
17. Do not include HTML tags.
18. Do not include emojis unless explicitly requested by the user.
19. Do not include unnecessary filler or repeated information.
20. The document should be detailed enough to be useful but concise enough to remain readable.
21. Return ONLY one valid JSON object.
22. Do not wrap the JSON in Markdown code fences.
23. Do not include explanations before or after the JSON.
24. The response must be directly parseable using JSON.parse().
25. Escape double quotes correctly inside JSON string values.
26. Do not use trailing commas.
27. Use empty strings when optional information is not provided.
28. If the user does not specify an author, leave the author field empty.
29. If the user does not specify a subtitle, leave the subtitle field empty.
30. Choose an appropriate documentType such as report, article, proposal, resume, letter, guide, research, or documentation.

OUTPUT FORMAT:

{
  "title": "Document title",
  "subtitle": "",
  "documentType": "report",
  "author": "",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content",
      "subsections": [
        {
          "heading": "Subsection heading",
          "content": "Subsection content"
        }
      ]
    }
  ]
}

IMPORTANT JSON RULES:

- "title" must contain the document title.
- "subtitle" must contain a subtitle or an empty string.
- "documentType" must describe the type of document.
- "author" must contain the author's name only if provided by the user.
- "sections" must always be an array.
- Each section must contain "heading", "content", and "subsections".
- "subsections" must always be an array.
- Each subsection must contain "heading" and "content".
- Keep content as strings, not arrays or objects.
- Never return undefined, null, or malformed JSON.
- Never add fields outside the specified structure.

USER REQUEST:

${state.prompt}
`;

    const res = await llm.invoke(prompt);
         await deductCredicts(state.userId, "pdf", state.session);


    let content =
      typeof res.content === "string"
        ? res.content
        : String(res.content);

    content = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON response from AI");
    }

    content = content.slice(start, end + 1);

    const data = JSON.parse(content);

    const pdfBuffer = await generatePdf(data);

    console.log("📄 PDF Generated Successfully");

    const filename = `pdf-${Date.now()}.pdf`;

    await uploadToS3(
      filename,
      pdfBuffer,
      "application/pdf"
    );

    console.log("☁️ PDF Uploaded To S3");

    const downloadUrl = await getFromS3(
      filename,
      24 * 60 
    );
    console.log("🔗 PDF Download URL:", downloadUrl);
    return {
      ...state,
      aiResponse: `📄 #PDF Generated Successfully
      **${data.title}**
      Download: ${downloadUrl}`,
    };

  } catch (error) {
    console.error("❌ PDF Agent Error:", error);
if (error.status == 429) {
  return {
    ...state,
    aiResponse: error?.data?.message,
  };
}
    return {
      ...state,
      aiResponse: `❌ Failed To Generate PDF\n\n${error.message}`,
    };
  }
};
