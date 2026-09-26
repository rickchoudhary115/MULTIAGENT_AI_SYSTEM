
import { getModel } from "../config/llmModel.js";
import axios from "axios";

// import { uploadToS3, getFromS3 } from "../utils/s3.js";

export const visionAgent = async (state) => {
  try {
    console.log("🖼️ IMAGE AGENT STARTED");
    console.log("👤 User prompt:", state.prompt);

    // =====================================================
    // 1. Generate detailed image prompt using LLM
    // =====================================================

    const llm = await getModel("image");

    const res = await llm.invoke(`
You are an expert AI image prompt engineer specializing in high-quality image generation.

Transform the user's request into ONE detailed prompt suitable for a modern image-generation model.

Rules:

1. Preserve the user's exact subject, intent, objects, and requested style.

2. Expand the request with useful visual details:
   - subject appearance
   - environment
   - background
   - composition
   - camera angle
   - framing
   - lighting
   - color palette
   - textures
   - materials
   - atmosphere
   - depth
   - perspective

3. Make the scene visually coherent and realistic.

4. Use cinematic lighting and professional composition when appropriate.

5. Use realistic shadows, reflections, textures, and depth of field when appropriate.

6. Use camera terminology when useful:
   - 35mm
   - 50mm
   - 85mm
   - shallow depth of field
   - bokeh
   - cinematic framing
   - realistic exposure
   - soft natural lighting

7. Adapt the visual style to the user's request.
   For example:
   - If the user asks for anime, create an anime-style prompt.
   - If the user asks for a 3D render, create a 3D-render prompt.
   - If the user asks for a painting, create a painting-style prompt.
   - If the user asks for a photograph, create a photorealistic photography prompt.

8. Do NOT add unrelated objects, people, locations, or concepts.

9. Do NOT add text, captions, logos, signatures, watermarks, or UI elements unless explicitly requested.

10. Do NOT repeat meaningless quality keywords such as:
   "8K, 16K, masterpiece, best quality"
   over and over.

11. Make the final prompt descriptive but not unnecessarily repetitive.

12. Return ONLY the final image-generation prompt.
Do not explain the prompt.
Do not add headings.
Do not use quotation marks around the prompt.

User request:

${state.prompt}
`);

    // =====================================================
    // 2. Extract generated prompt
    // =====================================================

    const prompt =
      typeof res.content === "string"
        ? res.content.trim()
        : String(res.content).trim();

    console.log("\n🎨 GENERATED IMAGE PROMPT:");
    console.log(prompt);

    if (!prompt) {
      throw new Error(
        "Image prompt generation returned an empty result"
      );
    }

    // =====================================================
    // 3. Encode prompt
    // =====================================================

    const encodedPrompt = encodeURIComponent(prompt);

    // =====================================================
    // 4. Generate image with Pollinations
    // =====================================================

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodedPrompt}` +
      `?nologo=true` +
      `&width=1024` +
      `&height=1024`;

    console.log("\n🔗 IMAGE URL:");
    console.log(imageUrl);

    // =====================================================
    // 5. Request image
    // =====================================================

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });

    console.log("\n✅ IMAGE GENERATED SUCCESSFULLY");
    console.log("📦 Image size:", imageRes.data.length, "bytes");

    // =====================================================
    // 6. Return image URL to frontend
    // =====================================================

    return {
      ...state,

      aiResponse: `
 
      IMAGE GENERATED SUCCESSFULLY
      `,

      images: [imageUrl],
    };

    // =====================================================
    // S3 VERSION
    // Enable this later after direct generation works
    // =====================================================

    /*
    const buffer = Buffer.from(imageRes.data);

    const filename = `image-${Date.now()}.png`;

    await uploadToS3(
      filename,
      buffer,
      "image/png"
    );

    const downloadUrl = await getFromS3(
      filename,
      24 * 60 * 60
    );

    return {
      ...state,

      aiResponse: `
![Generated Image](${downloadUrl})

📩 [Download Image](${downloadUrl})

⌛ Link expires in 24 hours.
      `.trim(),

      images: [downloadUrl],
    };
    */
  } catch (error) {
    // =====================================================
    // ERROR HANDLING
    // =====================================================

    console.error("\n❌ IMAGE GENERATION FAILED");

    console.error("Message:", error.message);

    if (error.response) {
      console.error(
        "Status:",
        error.response.status
      );

      console.error(
        "Headers:",
        error.response.headers
      );

      console.error(
        "Response:",
        error.response.data
      );
    }

    return {
      ...state,

      aiResponse: `❌ Failed to generate image.

Error: ${error.message}`,

      images: [],
    };
  }
};

