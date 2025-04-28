import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { collection } from "~/lib/vector-database/chroma";
import { env } from "~/env";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: env.CHUNK_SIZE,
  chunkOverlap: env.CHUNK_OVERLAP,
});

export async function processAndStoreFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<{
  message: string;
  fileName: string;
  docCount: number;
  chunksAdded: number;
}> {
  let docs: Document[] = [];

  console.log(
    `Processing file: ${fileName}, Type: ${fileType}, Size: ${fileSize} bytes`
  );

  try {
    // Create a Blob from the buffer for loaders that expect it
    const fileBlob = new Blob([fileBuffer], { type: fileType });

    // --- Select Loader based on File Type ---
    if (fileType === "application/pdf") {
      console.log("Using PDFLoader...");
      const loader = new PDFLoader(fileBlob, {
        splitPages: false,
        parsedItemSeparator: "",
      });
      docs = await loader.load();
      console.log(`PDF loaded. Found ${docs.length} document parts.`);
      // Ensure correct source is set
      docs.forEach((doc) => {
        doc.metadata = { ...(doc.metadata || {}), source: fileName };
      });
    } else if (fileType === "text/plain") {
      console.log("Using TextLoader...");
      const loader = new TextLoader(fileBlob);
      docs = await loader.load();
      console.log(`TXT loaded. Found ${docs.length} document parts.`);
      // Ensure correct source is set
      docs.forEach((doc) => {
        doc.metadata = { ...(doc.metadata || {}), source: fileName };
      });
    } else if (fileType === "text/markdown") { // Added block for Markdown
      console.log("Using TextLoader for Markdown...");
      const loader = new TextLoader(fileBlob);
      docs = await loader.load();
      console.log(`Markdown loaded. Found ${docs.length} document parts.`);
      // Ensure correct source is set
      docs.forEach((doc) => {
        doc.metadata = { ...(doc.metadata || {}), source: fileName };
      });
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("Using mammoth for DOCX...");
      // Mammoth works directly with the buffer
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      docs = [
        new Document({
          pageContent: result.value,
          metadata: {
            source: fileName,
          },
        }),
      ];
      console.log(
        `DOCX processed. Extracted text length: ${result.value.length}`
      );
    } else if (fileType === "application/msword") {
      console.warn(`Skipping unsupported file type '.doc': ${fileName}`);
      throw new Error(
        `Unsupported file type: .doc files are not currently supported. Please convert to .docx or .pdf.`
      );
    } else {
      console.error(`Unsupported file type: ${fileType} for file: ${fileName}`);
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (docs.length === 0) {
      console.warn(`No documents extracted from file: ${fileName}`);
      return {
        message: "No content could be extracted from the file.",
        fileName,
        docCount: 0,
        chunksAdded: 0,
      };
    }

    console.log(`Splitting ${docs.length} document(s) into chunks...`);
    const chunks = await splitter.splitDocuments(docs);
    console.log(`Generated ${chunks.length} chunks.`);

    const validChunks = chunks.filter(
      (chunk) => chunk.pageContent && chunk.pageContent.trim() !== ""
    );

    if (validChunks.length === 0) {
      console.warn(
        `No valid text chunks generated after splitting: ${fileName}`
      );
      return {
        message:
          "File processed, but no valid text chunks were generated after splitting.",
        fileName,
        docCount: docs.length,
        chunksAdded: 0,
      };
    }

    const simplifiedMetadatas = validChunks.map((chunk) => {
      const simpleMeta: { [key: string]: any } = {};
      for (const key in chunk.metadata) {
        if (
          typeof chunk.metadata[key] !== "object" ||
          chunk.metadata[key] === null
        ) {
          simpleMeta[key] = chunk.metadata[key];
        } else {
          simpleMeta[key] = JSON.stringify(chunk.metadata[key]);
        }
      }
      if (!simpleMeta.source) {
        simpleMeta.source = fileName;
      }
      return simpleMeta;
    });

    const texts = validChunks.map((chunk) => chunk.pageContent);
    const metadatas = simplifiedMetadatas;
    const ids = validChunks.map(
      (_, index) => `${fileName}_${Date.now()}_${index}`
    );

    console.log(
      `Adding ${validChunks.length} chunks to ChromaDB collection '${collection.name}'...`
    );
    // --- DEBUGGING LOG ---
    console.log(`[DEBUG] Adding to ChromaDB: Collection=${collection.name}`);
    console.log(
      `[DEBUG] IDs Count: ${ids.length}, First 3 IDs:`,
      ids.slice(0, 3)
    );
    console.log(
      `[DEBUG] Metadatas Count: ${metadatas.length}, First 3 Metadatas:`,
      metadatas.slice(0, 3)
    );
    console.log(
      `[DEBUG] Texts Count: ${texts.length}, First 3 Texts (lengths):`,
      texts.slice(0, 3).map((t) => t.length)
    );
    // --- END DEBUGGING LOG ---
    try {
      await collection.add({ ids, metadatas, documents: texts });
    } catch (chromaError: any) {
      console.error("[DEBUG] Error during collection.add:", chromaError);
      // Add more specific error checking if possible
      if (chromaError.message?.includes("expected dimension")) {
        console.error(
          "Dimension mismatch error adding to Chroma. Check embedding model and collection setup."
        );
        throw new Error(
          `ChromaDB Error: Embedding dimension mismatch. Ensure the collection expects ${env.EMBEDDING_DIMENSIONS} dimensions.`
        );
      }
      throw chromaError; // Re-throw other errors
    }

    console.log(
      `Successfully added ${validChunks.length} chunks from ${fileName} to the database.`
    );

    return {
      message: "File processed and stored successfully.",
      fileName,
      docCount: docs.length,
      chunksAdded: validChunks.length,
    };
  } catch (error: any) {
    console.error(`Error processing file ${fileName}:`, error);
    // Re-throw the error to be handled by the router
    throw new Error(`Failed to process file ${fileName}: ${error.message}`);
  }
}
