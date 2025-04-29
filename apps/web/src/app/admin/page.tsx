'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { env } from '@/env'

import { FileUploadCard } from './components/FileUploadCard'
import { SearchCard } from './components/SearchCard'
import { DocumentListCard } from './components/DocumentListCard'

interface DocumentInfo {
	id: string
	metadata: {
		source?: string
	}
}

export default function AdminPage() {
	const [documentList, setDocumentList] = useState<DocumentInfo[]>([])
	const [isLoadingList, setIsLoadingList] = useState(true)
	const [errorList, setErrorList] = useState<string | null>(null)

	// We'll track which doc is actively being deleted for UI feedback
	const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const fetchDocumentList = useCallback(async () => {
		setIsLoadingList(true)
		setErrorList(null)
		try {
			const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/files`)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			setDocumentList(data.documents ?? [])
		} catch (error) {
			console.error('Failed to fetch documents:', error)
			setErrorList(error instanceof Error ? error.message : 'Failed to load documents.')
			setDocumentList([])
		} finally {
			setIsLoadingList(false)
		}
	}, [])

	useEffect(() => {
		fetchDocumentList()
	}, [fetchDocumentList])

	// Renamed and modified to accept doc directly
	const handleDeleteDocument = async (docToDelete: DocumentInfo) => {
		setIsDeleting(true)
		setDeletingDocId(docToDelete.id) // Track which doc is being deleted
		try {
			const response = await fetch(
				`${env.NEXT_PUBLIC_SERVER_URL}/api/files/${encodeURIComponent(
					docToDelete.metadata.source ?? '',
				)}`,
				{
					method: 'DELETE',
				},
			)

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || `HTTP error! status: ${response.status}`)
			}

			toast.success(result.message || `Successfully deleted ${docToDelete.metadata.source}.`)
			fetchDocumentList() // Refresh list after delete
		} catch (error) {
			console.error('Delete failed:', error)
			const errorMessage = error instanceof Error ? error.message : 'File deletion failed.'
			toast.error(errorMessage)
		} finally {
			setIsDeleting(false)
			setDeletingDocId(null) // Clear deleting state
		}
	}

	return (
		<div className="container mx-auto grid max-w-4xl grid-cols-1 gap-6 pt-24">
			<FileUploadCard onUploadSuccess={fetchDocumentList} />

			<SearchCard />

			<DocumentListCard
				documents={documentList}
				isLoading={isLoadingList}
				error={errorList}
				onDeleteClick={handleDeleteDocument} // Pass the direct delete handler
				isDeleting={isDeleting}
				docBeingDeletedId={deletingDocId} // Pass the ID being deleted
			/>
		</div>
	)
}
