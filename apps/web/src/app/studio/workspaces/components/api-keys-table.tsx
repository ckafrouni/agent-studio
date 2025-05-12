'use client'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Trash } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'

interface ApiKeyInfo {
	id: string
	name: string
	createdAt: string
	lastUsedAt?: string | null
	keyPrefix?: string
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyInfo[]
}

export const API_KEYS_QUERY_KEY = ['apiKeys']

export const ApiKeysTable = () => {
	const { data: session } = authClient.useSession()
	useEffect(() => {
		if (!session) {
			redirect('/login')
		}
	}, [session])

	const {
		data: apiKeys,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: API_KEYS_QUERY_KEY,
		queryFn: async () => {
			const { data, error } = await authClient.apiKey.list()
			if (!data || !Array.isArray(data)) {
				console.error(error)
				throw new Error('Invalid response format from API')
			}
			return data
		},
	})

	const deleteApiKey = useCallback(async (keyId: string) => {
		try {
			const { data, error } = await authClient.apiKey.delete({ keyId })
			if (error) {
				console.error(error)
				throw new Error('Failed to delete API key')
			}
			refetch()
		} catch (error) {
			console.error(error)
			toast.error('Failed to delete API key')
		}
	}, [])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center space-x-2 rounded-lg border p-4">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span>Loading API Keys...</span>
			</div>
		)
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error Loading API Keys</AlertTitle>
				<AlertDescription>{error.message}</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Key Prefix</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead>Last Used</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{apiKeys?.map((apiKey) => (
						<TableRow key={apiKey.id}>
							<TableCell>{apiKey.name}</TableCell>
							<TableCell className="font-mono">{apiKey.prefix ?? 'N/A'}</TableCell>
							<TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
							<TableCell>
								{apiKey.lastRequest ? new Date(apiKey.lastRequest).toLocaleDateString() : 'Never'}
							</TableCell>
							<TableCell>
								<Button variant="destructive" size="icon" onClick={() => deleteApiKey(apiKey.id)}>
									<Trash className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
