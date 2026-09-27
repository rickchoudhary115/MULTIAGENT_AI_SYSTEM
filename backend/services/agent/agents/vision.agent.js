
import { getModel } from "../config/llmModel.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";

export const visionAgent = async (state) => {
  try {
    console.log("🖼️ IMAGE AGENT STARTED");
    console.log("👤 User prompt:", state.prompt);

    const llm = await getModel("image");

const res = await llm.invoke(`
You are an expert AI image prompt engineer specializing in professional image-generation prompts.

Your task is to transform the user's request into ONE highly detailed, visually coherent prompt suitable for a modern text-to-image generation model.

PROMPT REQUIREMENTS:

1. Preserve the user's exact subject, intent, requested objects, environment, and visual style.
2. Never change the main subject or the user's intended meaning.
3. Add useful visual details only when they improve the requested image.
4. Describe the main subject clearly, including appearance, pose, expression, clothing, materials, shape, or physical characteristics when relevant.
5. Describe the environment, background, setting, and surrounding elements when relevant.
6. Define a suitable composition, framing, perspective, camera angle, and subject placement.
7. Specify appropriate lighting, shadows, highlights, reflections, textures, atmosphere, and depth.
8. Use cinematic lighting and professional composition when they fit the user's requested style.
9. Adapt the artistic style to the user's request, such as photorealistic, cinematic, anime, illustration, 3D render, watercolor, oil painting, cyberpunk, minimal, fantasy, etc.
10. Maintain visual consistency between the subject, environment, lighting, colors, materials, and perspective.
11. Add realistic depth of field, lens characteristics, shadows, reflections, and atmospheric effects only when appropriate.
12. Use a suitable color palette that complements the requested subject and style.
13. Do not introduce unrelated people, objects, locations, characters, or concepts.
14. Do not change important attributes specified by the user.
15. Do not add text, captions, typography, logos, signatures, watermarks, UI elements, or written content unless explicitly requested.
16. Do not add unnecessary negative prompts.
17. Do not repeat generic quality keywords such as "masterpiece", "8K", "ultra HD", or "high quality" repeatedly.
18. Do not mention the image-generation model, API, prompt engineering, or these instructions.
19. Return exactly ONE complete image-generation prompt.
20. Do not return JSON, Markdown, bullet points, explanations, or multiple prompt variations.

OUTPUT:
Return ONLY the final image-generation prompt as plain text.

USER REQUEST:
${state.prompt}
`);

    const prompt =
      typeof res.content === "string"
        ? res.content.trim()
        : String(res.content).trim();

    console.log("\n🎨 GENERATED IMAGE PROMPT:");
    console.log(prompt);

    if (!prompt) {
      throw new Error("Image prompt generation returned an empty result");
    }

    const encodedPrompt = encodeURIComponent(prompt);

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodedPrompt}` +
      `?nologo=true` +
      `&width=1024` +
      `&height=1024`;

    console.log("\n🔗 IMAGE URL:");
    console.log(imageUrl);

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });

    console.log("\n✅ IMAGE GENERATED SUCCESSFULLY");
    console.log("📦 Image size:", imageRes.data.length, "bytes");

    const buffer = Buffer.from(imageRes.data);

    const filename = `image-${Date.now()}.png`;

    await uploadToS3(
      filename,
      buffer,
      "image/png"
    );

    console.log("☁️ IMAGE UPLOADED TO S3");

    const downloadUrl = await getFromS3(
      filename,
      24 * 60 
    );

    console.log("🔗 S3 DOWNLOAD URL:");
    console.log(downloadUrl);

    return {
      ...state,
      aiResponse: `🖼️ Image Generated Successfully\n\n${downloadUrl}`,
      
    };

  } catch (error) {
    console.error("\n❌ IMAGE GENERATION FAILED:", error);



    return {
      ...state,
      aiResponse: `❌ Failed to generate image.\nError: ${error.message}`,
      images: [],
    };
  }
};
