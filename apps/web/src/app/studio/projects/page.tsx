'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/utils'

import { FileUploadCard } from './components/FileUploadCard'
import { SearchCard } from './components/SearchCard'
import { DocumentListCard } from './components/DocumentListCard'
import { trpc } from '@/utils/trpc'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { redirect } from 'next/navigation'

interface DocumentInfo {
	id: string
	metadata: {
		source?: string
	}
}

export default function AdminPage() {
	const { data: session, isPending } = authClient.useSession()
	useEffect(() => {
		if (!isPending && !session) {
			redirect('/login')
		}
	}, [session, isPending])

	const [documentList, setDocumentList] = useState<DocumentInfo[]>([])
	const [isLoadingList, setIsLoadingList] = useState(true)
	const [errorList, setErrorList] = useState<string | null>(null)

	const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const fetchDocumentList = useCallback(async () => {
		setIsLoadingList(true)
		setErrorList(null)
		try {
			const response = await apiFetch('/api/files')

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			setDocumentList(data.documents ?? [])
		} catch (error) {
			setErrorList(error instanceof Error ? error.message : 'Failed to load documents.')
			setDocumentList([])
		} finally {
			setIsLoadingList(false)
		}
	}, [])

	useEffect(() => {
		fetchDocumentList()
	}, [fetchDocumentList])

	const handleDeleteDocument = async (docToDelete: DocumentInfo) => {
		setIsDeleting(true)
		setDeletingDocId(docToDelete.id)
		try {
			const response = await apiFetch(
				`/api/files/${encodeURIComponent(docToDelete.metadata.source ?? '')}`,
				{
					method: 'DELETE',
				},
			)

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || `HTTP error! status: ${response.status}`)
			}

			toast.success(result.message || `Successfully deleted ${docToDelete.metadata.source}.`)
			fetchDocumentList()
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'File deletion failed.'
			toast.error(errorMessage)
		} finally {
			setIsDeleting(false)
			setDeletingDocId(null)
		}
	}

	const healthCheck = useQuery(trpc.healthCheck.queryOptions())

	return (
		<div className="container mx-auto grid max-w-4xl grid-cols-1 gap-6 pt-24">
			<section className="rounded-lg border p-4">
				<h2 className="mb-2 font-medium">API Status</h2>
				<div className="flex items-center gap-2">
					<div
						className={`h-2 w-2 rounded-full ${healthCheck.data ? 'bg-green-500' : 'bg-red-500'}`}
					/>
					<span className="text-muted-foreground text-sm">
						{healthCheck.isLoading
							? 'Checking...'
							: healthCheck.data
								? 'Connected'
								: 'Disconnected'}
					</span>
				</div>
			</section>

			<FileUploadCard onUploadSuccess={fetchDocumentList} />

			<SearchCard />

			<DocumentListCard
				documents={documentList}
				isLoading={isLoadingList}
				error={errorList}
				onDeleteClick={handleDeleteDocument}
				isDeleting={isDeleting}
				docBeingDeletedId={deletingDocId}
			/>
		</div>
	)
}
