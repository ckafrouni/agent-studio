import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'

const formSchema = z.object({
	name: z.string().min(1, 'API Key name cannot be empty').max(50, 'Name is too long'),
})

type CreateApiKeyFormValues = z.infer<typeof formSchema>

interface CreateApiKeyModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onKeyCreated: () => void
}

export function CreateApiKeyModal({ open, onOpenChange, onKeyCreated }: CreateApiKeyModalProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [generatedKey, setGeneratedKey] = useState<string | null>(null)

	const form = useForm<CreateApiKeyFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
		},
	})

	const handleCopyToClipboard = () => {
		if (!generatedKey) return
		navigator.clipboard.writeText(generatedKey)
		toast.success('API Key copied to clipboard!')
	}

	const onSubmit = async (values: CreateApiKeyFormValues) => {
		setIsLoading(true)
		setGeneratedKey(null)
		try {
			const { data } = await authClient.apiKey.create({ name: values.name })
			console.log(data)

			if (data.key) {
				setGeneratedKey(data.key)
				toast.success('API Key created successfully!')
				onKeyCreated()
				form.reset()
			} else {
				toast.error('Failed to create API key. No key returned.')
			}
		} catch (error: any) {
			console.error('Failed to create API key:', error)
			const errorMessage = error.data?.error || 'An unexpected error occurred.'
			toast.error(`Error: ${errorMessage}`)
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = () => {
		if (generatedKey) {
			setGeneratedKey(null)
			form.reset()
		}
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New API Key</DialogTitle>
					{!generatedKey && (
						<DialogDescription>Give your API key a descriptive name.</DialogDescription>
					)}
				</DialogHeader>

				{generatedKey ? (
					<div className="space-y-4 py-4">
						<p className="text-muted-foreground text-sm">
							Your new API key has been generated. Please copy it now. You won't be able to see it
							again!
						</p>
						<div className="flex items-center space-x-2">
							<Input id="apiKey" value={generatedKey} readOnly className="font-mono" />
							<Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
								<Copy className="h-4 w-4" />
							</Button>
						</div>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>API Key Name</FormLabel>
										<FormControl>
											<Input placeholder="e.g., My Production Key" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={isLoading}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? 'Creating...' : 'Create API Key'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}

				{generatedKey && (
					<DialogFooter>
						<Button onClick={handleClose}>Close</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	)
}
