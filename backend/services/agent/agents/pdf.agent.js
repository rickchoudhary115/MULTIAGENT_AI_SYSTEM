
import { getModel } from "../config/llmModel.js";
import { generatePdf } from "../utils/generatePdf.js";

export const pdfAgent = async (state) => {
    try {

        const llm = await getModel("pdf");

        const prompt = `
You are an expert AI document generation agent.

Transform the user's request into a professional document that can be converted into a PDF.

Rules:
1. Create clear and professional content.
2. Preserve all important information from the user.
3. Do not invent facts, dates, statistics, qualifications, or references.
4. Use appropriate sections and subsections.
5. Do not use Markdown.
6. Return ONLY valid JSON.
7. Do not wrap the JSON in markdown code fences.
8. The response must be directly parseable using JSON.parse().

Return exactly this structure:

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

User request:
${state.prompt}
`;

        const res = await llm.invoke(prompt);

        let content = res.content
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");

        content = content.slice(start, end + 1);

        const data = JSON.parse(content);

        const pdfBuffer = await generatePdf(data);

        console.log("📄 PDF Generated Successfully");

        return {
            ...state,
            pdfBuffer,
            aiResponse: `📄 PDF Generated Successfully\n\n${data.title}`,
        };

    } catch (error) {

        console.log("❌ PDF Agent Error:", error);

        return {
            ...state,
            aiResponse: "❌ Failed To Generate PDF",
        };
    }
};

