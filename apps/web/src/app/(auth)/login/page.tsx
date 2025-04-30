'use client'
import { Button } from '@/components/ui/button'
import { SignInForm } from './components/sign-in-form'
import { SignUpForm } from './components/sign-up-form'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const CALLBACK_URL = 'http://localhost:3000/playground'

export default function SignIn() {
	const router = useRouter()
	const [showSignIn, setShowSignIn] = useState(true)

	const handleGoogleSignIn = async () => {
		try {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: CALLBACK_URL,
			})
		} catch {
			toast.error('Failed to initiate Google Sign-in')
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md">
				<h1 className="mb-6 text-center text-3xl font-bold">
					{showSignIn ? 'Welcome Back' : 'Create Account'}
				</h1>

				<Button
					type="button"
					variant="outline"
					className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2"
					onClick={handleGoogleSignIn}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
						<path
							fill="#FFC107"
							d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
						/>
						<path
							fill="#FF3D00"
							d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
						/>
						<path
							fill="#4CAF50"
							d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
						/>
						<path
							fill="#1976D2"
							d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
						/>
					</svg>
					Sign in with Google
				</Button>

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-300"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="bg-white px-2 text-gray-500">Or continue with</span>
					</div>
				</div>

				{showSignIn ? (
					<SignInForm
						onSuccess={() => {
							router.push(CALLBACK_URL)
							toast.success('Sign in successful')
						}}
						onError={(error) => {
							toast.error((error as { error: { message: string } }).error.message)
						}}
					/>
				) : (
					<SignUpForm
						onSuccess={() => {
							router.push(CALLBACK_URL)
							toast.success('Sign up successful')
						}}
						onError={(error) => {
							toast.error((error as { error: { message: string } }).error.message)
						}}
					/>
				)}

				<div className="mt-4 text-center">
					<Button
						variant="link"
						onClick={() => setShowSignIn(!showSignIn)}
						className="cursor-pointer text-indigo-600 hover:text-indigo-800"
					>
						{showSignIn ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
					</Button>
				</div>
			</div>
		</div>
	)
}
