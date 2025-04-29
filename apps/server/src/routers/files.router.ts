import { Hono } from "hono";
import { fileStorageService } from "~/lib/services/file-storage.service";
import { documentService } from "~/lib/services/document.service";
import { fileManagementService } from "~/lib/services/file-management.service";
import { NoSuchKey } from "@aws-sdk/client-s3";

const filesRouter = new Hono()
  .post("/upload", async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return c.json({ error: "No file uploaded." }, 400);
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const result = await fileManagementService.uploadAndProcessDocument(
        fileBuffer,
        file.name,
        file.type,
        file.size
      );

      return c.json(result, 201);
    } catch (error: any) {
      return c.json(
        {
          error: "Failed to upload or process file.",
          message: error.message,
        },
        500
      );
    }
  })

  .get("/", async (c) => {
    try {
      const result = await documentService.listDocuments();
      return c.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to list documents.";
      return c.json({ error: message }, 500);
    }
  })

  .post("/search", async (c) => {
    try {
      const body = await c.req.json();
      const { query, k } = body;
      const results = await documentService.searchDocuments(query, k);
      return c.json(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed.";
      return c.json({ error: message }, 500);
    }
  })

  .get("/content/:source", async (c) => {
    const source = c.req.param("source");
    if (!source) {
      return c.json({ error: "Source parameter is required." }, 400);
    }
    try {
      const fileData = await fileStorageService.getFileFromS3(source);

      if (!fileData || !fileData.buffer) {
        return c.notFound();
      }

      const contentType = fileData.contentType;

      c.header("Content-Type", contentType || "application/octet-stream");
      c.header("Content-Disposition", `inline; filename="${source}"`);

      return c.body(fileData.buffer);
    } catch (error: any) {
      if (error instanceof NoSuchKey) {
        return c.notFound();
      }
      return c.json(
        { error: "Failed to retrieve file", message: error.message },
        500
      );
    }
  })

  .delete("/:source", async (c) => {
    try {
      const source = c.req.param("source");
      const result = await fileManagementService.deleteDocument(source);
      return c.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete document.";
      return c.json({ error: message }, 500);
    }
  });

export { filesRouter };
