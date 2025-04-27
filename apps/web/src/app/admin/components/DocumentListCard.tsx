"use client";

import React from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definition from the original page
interface DocumentInfo {
  id: string;
  metadata: {
    source?: string;
  };
}

interface DocumentListCardProps {
  documents: DocumentInfo[];
  isLoading: boolean;
  error: string | null;
  onDeleteClick: (doc: DocumentInfo) => void;
  isDeleting: boolean; // Is *any* deletion in progress?
  docBeingDeletedId: string | null; // Which specific doc is being deleted?
}

export function DocumentListCard({
  documents,
  isLoading,
  error,
  onDeleteClick,
  isDeleting,
  docBeingDeletedId,
}: DocumentListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
        <CardDescription>
          List of processed documents stored in the vector database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading List</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : documents.length > 0 ? (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <span
                  className="truncate text-sm font-medium"
                  title={doc.metadata?.source ?? "Unknown Source"}
                >
                  {doc.metadata?.source ?? "Unknown Source"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteClick(doc)}
                  disabled={isDeleting && docBeingDeletedId === doc.id}
                  aria-label={`Delete ${doc.metadata?.source ?? "document"}`}
                >
                  {isDeleting && docBeingDeletedId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No documents found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
