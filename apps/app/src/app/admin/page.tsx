"use client";

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { env } from "@/env";

import { FileUploadCard } from "./components/FileUploadCard";
import { SearchCard } from "./components/SearchCard";
import { DocumentListCard } from "./components/DocumentListCard";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";

interface DocumentInfo {
  id: string;
  metadata: {
    source?: string;
  };
}

export default function AdminPage() {
  const [documentList, setDocumentList] = useState<DocumentInfo[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocumentList = useCallback(async () => {
    setIsLoadingList(true);
    setErrorList(null);
    try {
      const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/files`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDocumentList(data.documents ?? []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setErrorList(
        error instanceof Error ? error.message : "Failed to load documents."
      );
      setDocumentList([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentList();
  }, [fetchDocumentList]);

  const handleDeleteClick = (doc: DocumentInfo) => {
    setDocToDelete(doc);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_SERVER_URL}/api/files/${encodeURIComponent(
          docToDelete.metadata.source ?? ""
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      toast.success(
        result.message || `Successfully deleted ${docToDelete.metadata.source}.`
      );
      setDocToDelete(null);
      setShowDeleteConfirm(false);
      fetchDocumentList(); // Refresh list after delete
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "File deletion failed.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-24 container mx-auto grid max-w-4xl grid-cols-1 gap-6">
      <FileUploadCard onUploadSuccess={fetchDocumentList} />

      <SearchCard />

      <DocumentListCard
        documents={documentList}
        isLoading={isLoadingList}
        error={errorList}
        onDeleteClick={handleDeleteClick}
        isDeleting={isDeleting}
        docBeingDeletedId={docToDelete ? docToDelete.id : null}
      />

      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        docToDelete={docToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
