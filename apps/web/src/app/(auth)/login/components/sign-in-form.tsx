'use client'
import { authClient } from '@/lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function SignInForm({
	onSuccess,
	onError,
}: {
	onSuccess: () => void
	onError: (error: unknown) => void
}) {
	const { isPending } = authClient.useSession()

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					callbackURL: '/playground',
				},
				{
					onSuccess,
					onError,
				},
			)
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email('Invalid email address'),
				password: z.string().min(8, 'Password must be at least 8 characters'),
			}),
		},
	})

	if (isPending) {
		return (
			<div className="flex h-full items-center justify-center pt-8">
				<Loader2 className="animate-spin" />
			</div>
		)
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				void form.handleSubmit()
			}}
			className="space-y-4"
		>
			<div>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
			</div>

			<div>
				<form.Field name="password">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Password</Label>
							<Input
								id={field.name}
								name={field.name}
								type="password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
			</div>

			<form.Subscribe>
				{(state) => (
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={!state.canSubmit || state.isSubmitting}
					>
						{state.isSubmitting ? 'Submitting...' : 'Sign In'}
					</Button>
				)}
			</form.Subscribe>
		</form>
	)
}
