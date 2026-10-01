import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import { vectorStore } from "../config/vectorDb.js";

const SMALL_PDF_LIMIT = 30000; // characters

export const pdfRag = async (state) => {
  let store;
  const collectionName = `pdf-${Date.now()}`;
  const question = state.prompt?.trim() || "Summarize this document";

  try {
    const buffer = fs.readFileSync(state.file.path);

    // 1. Extract text
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    // 2. Remove page markers like "-- 7 of 10 --"
    const text = (result.text || "")
      .replace(/--\s*\d+\s+of\s+\d+\s*--/g, "")
      .trim();

    console.log("📄 Extracted text length:", text.length);

    // 3. Scanned PDF (no real text): let Gemini read the PDF directly
    if (text.length < 50) {
      console.log("🖼️ Scanned PDF detected → Gemini fallback");

      const gemini = await getModel("imageAnalyzer");

      const response = await gemini.invoke([
        new HumanMessage({
          content: [
            { type: "text", text: question },
            {
              type: "media",
              mimeType: "application/pdf",
              data: buffer.toString("base64"),
            },
          ],
        }),
      ]);

      return { ...state, aiResponse: response.content };
    }

    // 4. Build context
    let context;

    if (text.length <= SMALL_PDF_LIMIT) {
      // Small PDF: send everything, no vector search needed
      context = text;
    } else {
      // Large PDF: retrieve the most relevant chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([text]);

      store = await vectorStore(docs, collectionName);

      const relevantDocs = await store.similaritySearch(question, 5);

      context = relevantDocs.map((d) => d.pageContent).join("\n\n");
    }

    // 5. Ask the LLM
    const llm = await getModel("pdfRag");

    const response = await llm.invoke([
      new SystemMessage(`
You are a PDF question-answering assistant.

Answer the user's question using ONLY the provided PDF context.

Rules:
- Use the context to answer accurately.
- Do not invent information.
- If the answer cannot be found in the context, clearly say that the information is not available in the PDF.
- Keep the answer clear and well structured.
      `),
      new HumanMessage(`
Context:

${context}

Question:

${question}
      `),
    ]);

    return { ...state, aiResponse: response.content };
  } catch (error) {
    console.error("❌ PDF RAG Error:", error);
    return { ...state, aiResponse: "Failed to analyze PDF" };
  } finally {
    if (store) {
      try {
        await store.client.deleteCollection(collectionName);
      } catch (e) {
        console.error("Qdrant cleanup failed:", e.message);
      }
    }

    if (state.file?.path && fs.existsSync(state.file.path)) {
      fs.unlinkSync(state.file.path);
    }
  }
};
