
import { getModel } from "../config/llmModel.js";
import { generatePpt } from "../utils/generatePpt.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";

export const pptAgent = async (state) => {
  try {
    const llm = await getModel("ppt");

const prompt = `
You are an expert AI presentation designer and PowerPoint content generation agent.

Your task is to transform the user's request into a complete, professional, logically structured PowerPoint presentation.

PRESENTATION REQUIREMENTS:

1. Generate 8–12 slides unless the user explicitly requests a different number.
2. Create a clear presentation title and optional subtitle.
3. Every slide must have a short, meaningful title.
4. Each content slide should contain 3–6 concise bullet points.
5. Each bullet point should communicate one useful idea in 1–2 sentences maximum.
6. Use professional, presentation-friendly language.
7. Avoid paragraphs, unnecessary repetition, filler content, and overly long explanations.
8. Organize the presentation with a logical flow:
   - Introduction / Overview
   - Background or Problem
   - Key Concepts
   - Main Details
   - Examples / Applications / Use Cases
   - Comparison / Process / Architecture when relevant
   - Benefits / Challenges when relevant
   - Conclusion / Summary
   - Q&A
9. Adapt the structure to the user's topic. Do not force irrelevant sections.
10. Include practical examples, real-world applications, comparisons, workflows, or use cases whenever they improve understanding.
11. For technical topics, include architecture, workflow, components, technologies, or implementation concepts when relevant.
12. For business topics, include objectives, market/application context, benefits, challenges, and use cases when relevant.
13. For educational topics, explain concepts progressively from basic to advanced.
14. Keep terminology consistent throughout the presentation.
15. Do not invent statistics, research findings, citations, company claims, or specific facts unless they are provided by the user or are well-established general knowledge.
16. The final slide must be a Q&A slide.
17. Do not include speaker notes, Markdown, HTML, code fences, or explanations outside the JSON.
18. Return ONLY a valid JSON object.
19. The JSON must be directly parseable using JSON.parse().
20. Escape all double quotes inside JSON string values properly.
21. Do not use trailing commas.
22. Do not include comments inside the JSON.

OUTPUT FORMAT:

{
  "title": "Presentation Title",
  "subtitle": "Optional Subtitle",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": [
        "Concise point 1",
        "Concise point 2",
        "Concise point 3"
      ]
    }
  ]
}

IMPORTANT:
- slideNumber must start at 1 and increment sequentially.
- Generate the requested number of slides.
- The last slide must be titled "Q&A" or "Questions & Discussion".
- Every slide except the Q&A slide should contain meaningful content.
- Keep bullet points concise enough to fit comfortably on a PowerPoint slide.
- Never return anything before or after the JSON object.

USER REQUEST:
${state.prompt}
`;

    const res = await llm.invoke(prompt);

    const data = JSON.parse(res.content);

    const ppt = await generatePpt(data);

    const buffer = await ppt.write({
      outputType: "nodebuffer"
    });

    const filename = `ppt-${Date.now()}.pptx`;

    await uploadToS3(
      filename,
      buffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    const downloadUrl = await getFromS3(
      filename,
      24 * 60 
    );

    return {
      ...state,
      pptBuffer: buffer,
      pptFilename: filename,
      pptUrl: downloadUrl,
      aiResponse: `📊 PPT Generated Successfully
      **${data.title}**
      Download: ${downloadUrl}`
    };

  } catch (error) {
    console.error("❌ PPT Agent Error:", error);

    return {
      ...state,
      aiResponse: "❌ Failed To Generate PPT"
    };
  }
};
