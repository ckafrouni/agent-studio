'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DocumentInfo {
	id: string
	metadata: {
		source?: string
	}
}

interface DeleteConfirmationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	docToDelete: DocumentInfo | null
	onConfirm: () => void
	isDeleting: boolean
}

export function DeleteConfirmationDialog({
	open,
	onOpenChange,
	docToDelete,
	onConfirm,
	isDeleting,
}: DeleteConfirmationDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						Delete <strong>{docToDelete?.metadata?.source ?? 'this document'}</strong>? This action
						cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isDeleting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
