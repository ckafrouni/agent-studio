'use client'

import React from 'react'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface DocumentInfo {
	id: string
	metadata: {
		source?: string
	}
}

interface DocumentListCardProps {
	documents: DocumentInfo[]
	isLoading: boolean
	error: string | null
	onDeleteClick: (doc: DocumentInfo) => void
	isDeleting: boolean
	docBeingDeletedId: string | null
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
					<div className="text-muted-foreground flex items-center justify-center p-4">
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
							<li key={doc.id} className="flex items-center justify-between rounded-md border p-3">
								<a
									href={`/api/files/content/${encodeURIComponent(doc.metadata?.source ?? '')}`}
									target="_blank"
									rel="noopener noreferrer"
									className="truncate text-sm font-medium hover:underline"
									title={doc.metadata?.source ?? 'Unknown Source'}
								>
									{doc.metadata?.source ?? 'Unknown Source'}
								</a>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDeleteClick(doc)}
									disabled={isDeleting && docBeingDeletedId === doc.id}
									aria-label={`Delete ${doc.metadata?.source ?? 'document'}`}
									className="hover:cursor-pointer"
								>
									{isDeleting && docBeingDeletedId === doc.id ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="text-destructive hover:text-destructive/80 h-4 w-4" />
									)}
								</Button>
							</li>
						))}
					</ul>
				) : (
					<p className="text-muted-foreground p-4 text-center text-sm">No documents found.</p>
				)}
			</CardContent>
		</Card>
	)
}
