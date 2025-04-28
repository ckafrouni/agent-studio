import { Hono } from "hono";
import { z } from "zod";
import { collection } from "~/lib/vector-database/chroma";
import { processAndStoreFile } from "~/lib/services/file-processing.service";
import { IncludeEnum, ChromaNotFoundError } from "chromadb";
import mime from "mime-types";
import { s3Client, bucketName } from "~/lib/s3/client"; 
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { stream } from 'hono/streaming' // Import the stream helper
import type { Readable } from 'node:stream'; // Import Readable type for casting
import { Readable as NodeReadable } from 'node:stream'; // Import specifically for .toWeb()

// --- Zod Schemas (keep these for validation within functions) ---
const SearchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty."),
  k: z.number().int().positive().optional().default(5), // Default k=5
});

const DeleteSchema = z.object({
  source: z.string().min(1, "Source filename cannot be empty."),
});

// --- Standalone Functions (keep these as they contain the core logic) ---

export async function listDocuments() {
  try {
    const results = await collection.get({
      limit: 1000,
      include: [IncludeEnum.Metadatas],
    });

    const uniqueSources = new Map<
      string,
      { id: string; metadata: { source?: string } }
    >();
    results.ids.forEach((id, index) => {
      const metadata = results.metadatas?.[index];
      const source = metadata?.source as string | undefined;
      // Ensure source exists and is not already added
      if (source && !uniqueSources.has(source)) {
        uniqueSources.set(source, { id, metadata: { source } });
      }
    });

    return { documents: Array.from(uniqueSources.values()) };
  } catch (error) {
    console.error("[listDocuments] Error fetching documents:", error);
    throw new Error("Failed to retrieve document list.");
  }
}

export async function uploadDocument(
  fileBuffer: Buffer,
  originalFilename: string,
  fileType: string,
  fileSize: number
) {
  // Basic validation (more specific validation can be added)
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("File buffer cannot be empty.");
  }
  if (!originalFilename) {
    throw new Error("Original filename is required.");
  }
  if (!fileType) {
    throw new Error("File type (mimetype) is required.");
  }
  if (fileSize === undefined || fileSize < 0) {
    throw new Error("Valid file size is required.");
  }

  try {
    const result = await processAndStoreFile(
      fileBuffer,
      originalFilename,
      fileType,
      fileSize
    );
    return {
      success: true,
      message: `Successfully processed ${originalFilename}. ${result.chunksAdded} chunk(s) added.`,
      fileName: result.fileName,
      docCount: result.docCount,
      chunksAdded: result.chunksAdded,
    };
  } catch (error) {
    console.error(
      `[uploadDocument] Error processing file ${originalFilename}:`,
      error
    );
    const message =
      error instanceof Error ? error.message : "Processing failed.";
    throw new Error(`Failed to process file ${originalFilename}: ${message}`);
  }
}

export async function searchDocuments(query: string, k?: number) {
  const validation = SearchSchema.safeParse({ query, k });
  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid search input: ${errorMessages}`);
  }

  const validatedQuery = validation.data.query;
  const validatedK = validation.data.k;

  try {
    const results = await collection.query({
      queryTexts: [validatedQuery],
      nResults: validatedK,
      include: [
        IncludeEnum.Metadatas,
        IncludeEnum.Documents,
        IncludeEnum.Distances,
      ],
    });

    const resultCount = results.ids?.[0]?.length ?? 0;
    if (
      resultCount === 0 ||
      !results.documents?.[0] ||
      !results.metadatas?.[0] ||
      !results.distances?.[0]
    ) {
      return { results: [] };
    }

    const formattedResults = results.ids[0].map((id, index) => ({
      id,
      document: results.documents![0][index] ?? "",
      metadata: {
        ...(results.metadatas![0][index] ?? {}),
        distance: results.distances![0][index] ?? null,
      },
    }));

    return { results: formattedResults };
  } catch (error) {
    throw new Error("Search operation failed.");
  }
}

export async function deleteDocumentBySource(source: string) {
  const validation = DeleteSchema.safeParse({ source });
  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid delete input: ${errorMessages}`);
  }

  const validatedSource = validation.data.source;
  try {
    await collection.delete({
      where: { source: validatedSource },
    });
    return {
      success: true,
      message: `Documents associated with source '${validatedSource}' deleted successfully.`,
    };
  } catch (error) {
    throw new Error(
      `Failed to delete documents for source '${validatedSource}'.`
    );
  }
}

// --- Hono Router Definition ---
const filesRouter = new Hono();

filesRouter.get("/content", async (c) => {
  const source = c.req.query("source");

  if (!source) {
    return c.json({ error: "Missing 'source' query parameter" }, 400);
  }

  // Basic sanitization: prevent directory traversal. 
  // S3 keys don't have the same filesystem risks, but good practice.
  if (source.includes("..") || source.startsWith("/")) {
    return c.json({ error: "Invalid source filename" }, 400);
  }

  const getObjectParams = {
    Bucket: bucketName,
    Key: source,
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const s3Response = await s3Client.send(command);

    // Check if Body is a readable stream (expected for successful GetObject)
    if (!s3Response.Body) { // Simplified check: just ensure Body exists
        throw new Error('S3 response body is not a readable stream.');
    }

    // Determine Content-Type from S3 metadata or mime-types fallback
    const contentType = s3Response.ContentType || mime.lookup(source) || 'application/octet-stream';
    c.header("Content-Type", contentType);

    // Set Content-Disposition to suggest filename to browser
    c.header("Content-Disposition", `inline; filename="${source}"`); 

    // Use the imported stream helper
    return stream(c, async (streamInstance) => { 
        // Ensure the body is a Node Readable before converting
        if (s3Response.Body instanceof NodeReadable) {
            // Manually pipe data from Node stream to Hono stream
            for await (const chunk of s3Response.Body) {
                await streamInstance.write(chunk);
            }
            // Note: Hono's stream helper might automatically close the streamInstance
            // when this async function completes. If issues arise, explicitly call
            // await streamInstance.close(); here.
        } else {
            // Handle cases where Body might not be a Node Readable (e.g., error or unexpected type)
            console.error("S3 response body is not a Node.js Readable stream");
            // Optionally, close the stream with an error or provide a fallback
            await streamInstance.close(); 
        }
    });

  } catch (error: any) {
    if (error instanceof NoSuchKey || error.name === 'NoSuchKey') { // Check error type for S3
      console.error(`File not found in S3: ${bucketName}/${source}`);
      return c.json({ error: "File not found" }, 404);
    } else {
      console.error(`Error fetching file ${source} from S3:`, error);
      return c.json({ error: "Failed to retrieve file" }, 500);
    }
  }
});

filesRouter.get("/", async (c) => {
  try {
    const result = await listDocuments();
    return c.json(result);
  } catch (error) {
    console.error("[GET /api/files] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to list documents";
    return c.json({ error: message }, 500);
  }
});

filesRouter.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return c.json({ error: "No file uploaded or invalid format." }, 400);
    }

    const originalFilename = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    if (!originalFilename || !fileType || fileSize === undefined) {
      return c.json({ error: "Invalid file data received." }, 400);
    }

    const result = await uploadDocument(
      fileBuffer,
      originalFilename,
      fileType,
      fileSize
    );
    return c.json(result, 201);
  } catch (error) {
    console.error("[POST /api/files/upload] Error:", error);
    const message =
      error instanceof Error ? error.message : "File upload failed";
    if (
      message.startsWith("Unsupported file type") ||
      message.startsWith("No content could be extracted")
    ) {
      return c.json({ error: message }, 400);
    }
    return c.json({ error: `Upload failed: ${message}` }, 500);
  }
});

filesRouter.post("/search", async (c) => {
  try {
    const body = await c.req.json();
    const validation = SearchSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return c.json({ error: `Invalid search input: ${errorMessages}` }, 400);
    }

    const { query, k } = validation.data;
    const results = await searchDocuments(query, k);
    return c.json(results);
  } catch (error) {
    console.error("[POST /api/files/search] Error:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return c.json({ error: message }, 500);
  }
});

filesRouter.get("/content/:source", async (c) => {
  console.log(`[GET /content/:source] Handling request for source: ${c.req.param('source')}`);
  const source = c.req.param('source');

  if (!source) {
    return c.json({ error: "Missing 'source' query parameter" }, 400);
  }

  // Basic sanitization: prevent directory traversal. 
  // S3 keys don't have the same filesystem risks, but good practice.
  if (source.includes("..") || source.startsWith("/")) {
    return c.json({ error: "Invalid source filename" }, 400);
  }

  const getObjectParams = {
    Bucket: bucketName,
    Key: source,
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const s3Response = await s3Client.send(command);

    // Check if Body is a readable stream (expected for successful GetObject)
    if (!s3Response.Body) { // Simplified check: just ensure Body exists
        throw new Error('S3 response body is not a readable stream.');
    }

    // Determine Content-Type from S3 metadata or mime-types fallback
    const contentType = s3Response.ContentType || mime.lookup(source) || 'application/octet-stream';
    c.header("Content-Type", contentType);

    // Set Content-Disposition to suggest filename to browser
    c.header("Content-Disposition", `inline; filename="${source}"`); 

    // Use the imported stream helper
    return stream(c, async (streamInstance) => { 
        // Ensure the body is a Node Readable before converting
        if (s3Response.Body instanceof NodeReadable) {
            // Manually pipe data from Node stream to Hono stream
            for await (const chunk of s3Response.Body) {
                await streamInstance.write(chunk);
            }
            // Note: Hono's stream helper might automatically close the streamInstance
            // when this async function completes. If issues arise, explicitly call
            // await streamInstance.close(); here.
        } else {
            // Handle cases where Body might not be a Node Readable (e.g., error or unexpected type)
            console.error("S3 response body is not a Node.js Readable stream");
            // Optionally, close the stream with an error or provide a fallback
            await streamInstance.close(); 
        }
    });

  } catch (error: any) {
    if (error instanceof NoSuchKey || error.name === 'NoSuchKey') { // Check error type for S3
      console.error(`File not found in S3: ${bucketName}/${source}`);
      return c.json({ error: "File not found" }, 404);
    } else {
      console.error(`Error fetching file ${source} from S3:`, error);
      return c.json({ error: "Failed to retrieve file" }, 500);
    }
  }
});

filesRouter.delete("/:source", async (c) => {
  try {
    const source = c.req.param("source");
    const validation = DeleteSchema.safeParse({ source });
    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return c.json({ error: `Invalid delete input: ${errorMessages}` }, 400);
    }

    const validatedSource = validation.data.source;
    const result = await deleteDocumentBySource(validatedSource);
    return c.json(result);
  } catch (error) {
    console.error("[DELETE /api/files/:source] Error:", error);
    const message = error instanceof Error ? error.message : "Deletion failed";
    return c.json({ error: message }, 500);
  }
});

export default filesRouter;
