'use client'

import React, { useState } from 'react'
import { Loader2, AlertTriangle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/utils'

interface SearchResultItem {
	id: string
	document: string
	metadata: {
		source?: string
		distance: number
		[key: string]: unknown
	}
}

export function SearchCard() {
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [searchError, setSearchError] = useState<string | null>(null)

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			toast.warning('Please enter a search query.')
			return
		}

		setIsSearching(true)
		setSearchError(null)
		setSearchResults([])

		try {
			const response = await apiFetch(`/api/files/search`, {
				method: 'POST',
				body: JSON.stringify({ query: searchQuery }),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || `Search failed: ${response.statusText}`)
			}

			setSearchResults(result.results ?? [])
			if ((result.results ?? []).length === 0) {
				toast.info('No results found for your query.')
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
			toast.error(`Search failed: ${errorMessage}`)
			setSearchError(errorMessage)
		} finally {
			setIsSearching(false)
		}
	}

	const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			handleSearch()
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Search Documents</CardTitle>
				<CardDescription>
					Enter a query to search the content of uploaded documents.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex w-full items-center space-x-2">
					<Input
						type="search"
						placeholder="Search document content..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleSearchKeyDown}
						disabled={isSearching}
						className="flex-grow"
					/>
					<Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
						{isSearching ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Search className="mr-2 h-4 w-4" />
						)}
						Search
					</Button>
				</div>

				{searchError && (
					<Alert variant="destructive" className="mt-4">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Search Error</AlertTitle>
						<AlertDescription>{searchError}</AlertDescription>
					</Alert>
				)}

				{isSearching && searchResults.length === 0 && (
					<div className="text-muted-foreground mt-4 flex items-center justify-center p-4">
						<Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
					</div>
				)}

				{searchResults.length > 0 && (
					<div className="mt-4 space-y-4">
						<h4 className="text-lg font-semibold">Search Results:</h4>
						{searchResults.map((result) => (
							<Card key={result.id} className="bg-muted/50">
								<CardHeader className="pt-4 pb-2">
									<CardDescription>
										Source: <strong>{result.metadata?.source ?? 'Unknown'}</strong> (Score:{' '}
										{result.metadata?.distance?.toFixed(4) ?? 'N/A'})
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm">{result.document}</p>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
