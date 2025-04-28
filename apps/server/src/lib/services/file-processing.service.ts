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

  try {
    const fileBlob = new Blob([fileBuffer], { type: fileType });

    if (fileType === "application/pdf") {
      const loader = new PDFLoader(fileBlob, {
        splitPages: false,
        parsedItemSeparator: "",
      });
      docs = await loader.load();
      docs.forEach((doc) => {
        doc.metadata = { ...(doc.metadata || {}), source: fileName };
      });
    } else if (fileType === "text/plain") {
      const loader = new TextLoader(fileBlob);
      docs = await loader.load();
      docs.forEach((doc) => {
        doc.metadata = { ...(doc.metadata || {}), source: fileName };
      });
    } else if (fileType === "text/markdown") {
      const loader = new TextLoader(fileBlob);
      docs = await loader.load();
      docs.forEach((doc) => {
        doc.metadata = { ...(doc.metadata || {}), source: fileName };
      });
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      docs = [
        new Document({
          pageContent: result.value,
          metadata: {
            source: fileName,
          },
        }),
      ];
    } else if (fileType === "application/msword") {
      throw new Error(
        `Unsupported file type: .doc files are not currently supported. Please convert to .docx or .pdf.`
      );
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (docs.length === 0) {
      return {
        message: "No content could be extracted from the file.",
        fileName,
        docCount: 0,
        chunksAdded: 0,
      };
    }

    const chunks = await splitter.splitDocuments(docs);

    const validChunks = chunks.filter(
      (chunk) => chunk.pageContent && chunk.pageContent.trim() !== ""
    );

    if (validChunks.length === 0) {
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

    try {
      await collection.add({ ids, metadatas, documents: texts });
    } catch (chromaError: any) {
      if (chromaError.message?.includes("expected dimension")) {
        throw new Error(
          `ChromaDB Error: Embedding dimension mismatch. Ensure the collection expects ${env.EMBEDDING_DIMENSIONS} dimensions.`
        );
      }
      throw chromaError;
    }

    return {
      message: "File processed and stored successfully.",
      fileName,
      docCount: docs.length,
      chunksAdded: validChunks.length,
    };
  } catch (error: any) {
    throw new Error(`Failed to process file ${fileName}: ${error.message}`);
  }
}
