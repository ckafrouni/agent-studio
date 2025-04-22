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
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(
            `${env.NEXT_PUBLIC_SERVER_URL}/api/files/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || `HTTP error! status: ${response.status}`
            );
          }

          toast.success(
            result.message ?? `Successfully processed ${file.name}.`
          );
          onUploadSuccess(); // Call the callback to refresh the list in parent
        } catch (error) {
          console.error("Upload failed:", error);
          const errorMessage =
            error instanceof Error ? error.message : "File upload failed.";
          toast.error(errorMessage);
          setUploadError(errorMessage);
        } finally {
          setIsUploading(false);
        }
      } else {
        const msg =
          "Invalid file type or size. Please upload PDF, DOCX, or TXT files.";
        toast.warning(msg);
        setUploadError(msg);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "text/plain": [".txt"],
      },
      multiple: false,
      maxSize: 10 * 1024 * 1024, // 10MB limit
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload PDF, DOCX, or TXT files (max 10MB).
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
            <p>Drag &apos;n&apos; drop a file here, or click to select file</p>
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
