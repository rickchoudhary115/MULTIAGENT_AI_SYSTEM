
import { getModel } from "../config/llmModel.js";
import { generatePpt } from "../utils/generatePpt.js";

export const pptAgent = async (state) => {
  try {
    const llm = await getModel("ppt");

    const prompt = `
You are an expert AI presentation-generation agent.

Your task is to transform the user's request into a complete, professional PowerPoint presentation.

Requirements:
1. Understand the user's topic, purpose, and target audience.
2. Create a logical slide structure with a clear beginning, middle, and conclusion.
3. Generate 8–12 slides unless the user specifies a different number.
4. Each slide must contain:
   - A concise title
   - Clear, useful content
   - 3–6 bullet points where appropriate
   - Speaker notes when they add value
5. Avoid overcrowding slides with excessive text.
6. Use professional, presentation-friendly language.
7. Include examples, statistics, comparisons, processes, or use cases when relevant.
8. Add a conclusion/summary slide.
9. Add a Q&A slide at the end.
10. Maintain consistent terminology and structure throughout the presentation.

For every slide, return:
- slide number
- slide title
- slide content
- speaker notes
- suggested visual type
- suggested visual description

If the topic requires diagrams, charts, timelines, workflows, architecture diagrams, or tables, explicitly describe them so they can be created in the presentation.

Return ONLY valid JSON in the following format:

{
  "title": "Presentation Title",
  "subtitle": "Optional Subtitle",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": [
        "Point 1",
        "Point 2",
        "Point 3"
      ],
      "speakerNotes": "Speaker notes for this slide.",
      "visual": {
        "type": "diagram | chart | image | table | timeline | none",
        "description": "Description of the visual."
      }
    }
  ]
}

User request:
${state.prompt}
`;

    const res = await llm.invoke(prompt);
    const data = JSON.parse(res.content);

    const ppt = await generatePpt(data);

    const buffer = await ppt.write({
      outputType: "nodebuffer"
    });

    const filename = `ppt-${Date.now()}.pptx`;
  
//    // Upload to S3
//    await uploadToS3(
//      filename,
//      buffer,
//      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//    );

//    // Generate temporary download URL
//    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

//    return {
//      ...state,

//      pptBuffer: buffer,
//      pptUrl: downloadUrl,
//      pptFilename: filename,

//      aiResponse: `📊 PPT Generated Successfully

// ${data.title}

// Download: ${downloadUrl}`,
//    };
    return {
      ...state,
      pptBuffer: buffer,
      pptFilename: filename,
      aiResponse: `📊 PPT Generated Successfully\n\n${data.title}`
    };

  } catch (error) {
    console.error("❌ PPT Agent Error:", error);

    return {
      ...state,
      aiResponse: "❌ Failed To Generate PPT"
    };
  }
};