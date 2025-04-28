"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { env } from "@/env";

interface FileUploadCardProps {
  onUploadSuccess: () => void; // Callback to refresh list after successful upload
}

export function FileUploadCard({ onUploadSuccess }: FileUploadCardProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        const msg = "No valid files selected or dropped.";
        toast.warning(msg);
        setUploadError(msg);
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      let overallSuccess = true;
      let lastError = null;

      // Inform user that multiple uploads are starting
      toast.info(`Starting upload for ${acceptedFiles.length} file(s)...`);

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          // Optional: Show toast for each file starting
          // toast.info(`Uploading ${file.name}...`);

          const response = await fetch(
            `${env.NEXT_PUBLIC_SERVER_URL}/api/files/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const result = await response.json();

          if (!response.ok) {
            // Use specific message from backend if available
            throw new Error(
              result.message || `Upload failed for ${file.name} (Status: ${response.status})`
            );
          }

          // Success toast for each file
          toast.success(
            result.message ?? `Successfully processed ${file.name}.`
          );
          onUploadSuccess(); // Refresh list after each successful upload

        } catch (error) {
          overallSuccess = false;
          console.error(`Upload failed for ${file.name}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : `Upload failed for ${file.name}.`;
          toast.error(errorMessage); // Error toast for the specific file
          lastError = errorMessage; // Keep track of the last error message
        }
      } // End of loop

      // After all uploads are attempted
      setIsUploading(false);
      if (!overallSuccess && lastError) {
        // Optionally set a general error state if needed, using the last error
        setUploadError(lastError);
      } else if (overallSuccess) {
        // Clear any previous error message if all were successful
        setUploadError(null);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
          ".docx",
        ],
        "text/plain": [".txt"],
        "text/markdown": [".md"],
      },
      multiple: true, // Allow multiple files
      maxSize: 10 * 1024 * 1024, // 10MB limit
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload PDF, DOCX, TXT, or MD files (max 10MB).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50 hover:bg-muted/50"} ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <input {...getInputProps()} disabled={isUploading} />
          {isUploading ? (
            <>
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
              <p>Uploading...</p>
            </>
          ) : isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drag &apos;n&apos; drop file(s) here, or click to select file(s)</p>
          )}
        </div>
        {uploadError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
