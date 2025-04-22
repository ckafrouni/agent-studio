import { Hono } from "hono";
import { z } from "zod";
import { collection } from "~/lib/vector-database/chroma";
import { processAndStoreFile } from "~/lib/services/file-processing.service";
import { IncludeEnum, ChromaNotFoundError } from "chromadb";

// --- Zod Schemas (keep these for validation within functions) ---
const SearchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty."),
  k: z.number().int().positive().optional().default(5), // Default k=5
});

const DeleteSchema = z.object({
  source: z.string().min(1, "Source filename cannot be empty."),
});

// --- Standalone Functions (keep these as they contain the core logic) ---

/**
 * Retrieves a list of unique document sources from the vector store.
 * @returns A promise that resolves with an object containing a list of documents,
 *          each with an id and source metadata.
 * @throws {Error} If fetching from ChromaDB fails.
 */
export async function listDocuments() {
  try {
    console.log("[listDocuments] Fetching all documents to find unique sources...");
    // Fetch a large number of documents to likely get all sources
    // Adjust 'limit' as needed, or use ChromaDB's get with filtering if available
    const results = await collection.get({
      limit: 1000, // Adjust as needed, might need pagination for very large sets
      include: [IncludeEnum.Metadatas],
    });

    // Basic deduplication based on 'source' metadata
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

    console.log(`[listDocuments] Found ${uniqueSources.size} unique sources.`);
    return { documents: Array.from(uniqueSources.values()) };
  } catch (error) {
    console.error("[listDocuments] Error fetching documents:", error);
    // Throw a generic error; specific handling can occur in the route handler
    throw new Error("Failed to retrieve document list.");
  }
}

/**
 * Processes and stores an uploaded file.
 * @param fileBuffer The content of the file as a Buffer.
 * @param originalFilename The original name of the file.
 * @param fileType The MIME type of the file.
 * @param fileSize The size of the file in bytes.
 * @throws {Error} If processing or storing fails.
 */
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

  console.log(
    `[uploadDocument] Received file: ${originalFilename}, type: ${fileType}, size: ${fileSize} bytes`
  );

  try {
    // Call processAndStoreFile with all required arguments
    const result = await processAndStoreFile(
      fileBuffer,
      originalFilename,
      fileType,
      fileSize
    );
    console.log(
      `[uploadDocument] Processed ${originalFilename}: ${result.chunksAdded} chunks added.`
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

/**
 * Searches for documents matching a query in the vector store.
 * @param query The search query string.
 * @param k The number of results to return (optional, default 5).
 * @returns A promise that resolves with an object containing the search results.
 * @throws {Error} If input validation fails or the search operation fails.
 */
export async function searchDocuments(query: string, k?: number) {
  // Validate input using Zod schema
  const validation = SearchSchema.safeParse({ query, k });
  if (!validation.success) {
    // Combine Zod errors into a single message
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid search input: ${errorMessages}`);
  }

  const validatedQuery = validation.data.query;
  const validatedK = validation.data.k;

  console.log(
    `[searchDocuments] Searching for: "${validatedQuery}", k=${validatedK}`
  );

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

    // Ensure all arrays have the same length (should be guaranteed by Chroma client)
    const resultCount = results.ids?.[0]?.length ?? 0;
    if (
      resultCount === 0 ||
      !results.documents?.[0] ||
      !results.metadatas?.[0] ||
      !results.distances?.[0]
    ) {
      console.log(`[searchDocuments] No results found for query "${validatedQuery}".`);
      return { results: [] };
    }

    // Format results
    const formattedResults = results.ids[0].map((id, index) => ({
      id,
      document: results.documents![0][index] ?? "",
      metadata: results.metadatas![0][index] ?? {},
      distance: results.distances![0][index] ?? null,
    }));

    console.log(
      `[searchDocuments] Found ${resultCount} results for query "${validatedQuery}".`
    );
    return { results: formattedResults };
  } catch (error) {
    console.error(
      `[searchDocuments] Error during search for "${validatedQuery}":`,
      error
    );
    throw new Error("Search operation failed.");
  }
}

/**
 * Deletes documents associated with a specific source filename from the vector store.
 * @param source The source filename to delete documents for.
 * @returns A promise that resolves with a success message.
 * @throws {Error} If input validation fails, the document source is not found, or deletion fails.
 */
export async function deleteDocumentBySource(source: string) {
  // Validate input using Zod schema
  const validation = DeleteSchema.safeParse({ source });
  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid delete input: ${errorMessages}`);
  }

  const validatedSource = validation.data.source;
  console.log(
    `[deleteDocumentBySource] Attempting to delete documents with source: ${validatedSource}`
  );

  try {
    // Note: ChromaDB delete might not return the count of deleted items directly
    await collection.delete({
      where: { source: validatedSource }, // Filter by metadata source
    });

    // Since Chroma's delete doesn't always confirm what was deleted,
    // we log the action and assume success if no error is thrown.
    // A subsequent 'get' could be used for verification if needed.
    console.log(
      `[deleteDocumentBySource] Delete operation completed for source: ${validatedSource}.`
    );
    return {
      success: true,
      message: `Documents associated with source '${validatedSource}' deleted successfully.`,
    };
  } catch (error) {
    console.error(
      `[deleteDocumentBySource] Error deleting source ${validatedSource}:`,
      error
    );
    // Note: Chroma's delete doesn't throw ChromaNotFoundError currently
    // We rely on the generic error message, but could add a pre-check 'get' if needed.
    // Example check (uncomment if needed, adds overhead):
    // try {
    //   const existing = await collection.get({ where: { source: validatedSource }, limit: 1 });
    //   if (existing.ids.length === 0) {
    //      throw new Error(`Document source '${validatedSource}' not found or already deleted.`);
    //   }
    // } catch (getError) { /* Handle get error */ }

    throw new Error(
      `Failed to delete documents for source '${validatedSource}'.`
    );
  }
}

// --- Hono Router Definition ---
const filesRouter = new Hono();

// GET /api/files - List unique document sources
filesRouter.get("/", async (c) => {
  try {
    const result = await listDocuments();
    return c.json(result);
  } catch (error) {
    console.error("[GET /api/files] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to list documents";
    return c.json({ error: message }, 500);
  }
});

// POST /api/files/upload - Upload and process a file
filesRouter.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file"); // Assuming the file input name is 'file'

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

    const result = await uploadDocument(fileBuffer, originalFilename, fileType, fileSize);
    return c.json(result, 201); // 201 Created status

  } catch (error) {
    console.error("[POST /api/files/upload] Error:", error);
    const message = error instanceof Error ? error.message : "File upload failed";
    // Check for specific user-facing errors from uploadDocument/processAndStoreFile
     if (message.startsWith("Unsupported file type") || message.startsWith("No content could be extracted")) {
        return c.json({ error: message }, 400); // Bad request for unsupported types/empty content
     }
    return c.json({ error: `Upload failed: ${message}` }, 500);
  }
});

// POST /api/files/search - Search documents
filesRouter.post("/search", async (c) => {
  try {
    const body = await c.req.json();
    // Use the SearchSchema directly here for route-level validation
    const validation = SearchSchema.safeParse(body);
    if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
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

// DELETE /api/files/:source - Delete documents by source
filesRouter.delete("/:source", async (c) => {
    try {
        const source = c.req.param('source');
         // Use the DeleteSchema directly here for route-level validation
        const validation = DeleteSchema.safeParse({ source });
         if (!validation.success) {
            const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return c.json({ error: `Invalid delete input: ${errorMessages}` }, 400);
        }

        const validatedSource = validation.data.source;
        const result = await deleteDocumentBySource(validatedSource);
        return c.json(result);

    } catch (error) {
        console.error("[DELETE /api/files/:source] Error:", error);
        const message = error instanceof Error ? error.message : "Deletion failed";
         // Check error message for specific conditions if needed
        // For example, if deleteDocumentBySource throws specific error types or messages
        // if (message.includes("not found")) { // Or check error instance
        //     return c.json({ error: message }, 404); // Not Found
        // }
        return c.json({ error: message }, 500);
    }
});


export default filesRouter; // Export the Hono router instance
