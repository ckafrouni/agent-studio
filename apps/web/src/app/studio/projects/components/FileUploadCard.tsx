'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { apiFetch } from '@/lib/utils'

interface FileUploadCardProps {
	onUploadSuccess: () => void
}

export function FileUploadCard({ onUploadSuccess }: FileUploadCardProps) {
	const [uploadError, setUploadError] = useState<string | null>(null)
	const [isUploading, setIsUploading] = useState(false)

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) {
				const msg = 'No valid files selected or dropped.'
				toast.warning(msg)
				setUploadError(msg)
				return
			}

			setIsUploading(true)
			setUploadError(null)
			let overallSuccess = true
			let lastError = null

			toast.info(`Starting upload for ${acceptedFiles.length} file(s)...`)

			for (const file of acceptedFiles) {
				const formData = new FormData()
				formData.append('file', file)

				try {
					const response = await apiFetch(`/api/files/upload`, {
						method: 'POST',
						body: formData,
					})

					const result = await response.json()

					if (!response.ok) {
						throw new Error(
							result.message || `Upload failed for ${file.name} (Status: ${response.status})`,
						)
					}

					toast.success(result.message ?? `Successfully processed ${file.name}.`)
					onUploadSuccess()
				} catch (error) {
					overallSuccess = false
					const errorMessage =
						error instanceof Error ? error.message : `Upload failed for ${file.name}.`
					toast.error(errorMessage)
					lastError = errorMessage
				}
			}

			setIsUploading(false)
			if (!overallSuccess && lastError) {
				setUploadError(lastError)
			} else if (overallSuccess) {
				setUploadError(null)
			}
		},
		[onUploadSuccess],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
			'text/plain': ['.txt'],
			'text/markdown': ['.md'],
		},
		multiple: true,
		maxSize: 10 * 1024 * 1024,
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload Document</CardTitle>
				<CardDescription>Upload PDF, DOCX, TXT, or MD files (max 10MB).</CardDescription>
			</CardHeader>
			<CardContent>
				<div
					{...getRootProps()}
					className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50 hover:bg-muted/50'} ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
				>
					<input {...getInputProps()} disabled={isUploading} />
					{isUploading ? (
						<>
							<Loader2 className="text-primary mb-2 h-8 w-8 animate-spin" />
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
	)
}
