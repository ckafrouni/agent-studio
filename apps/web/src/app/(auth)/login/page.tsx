'use client'
import SignInForm from './components/sign-in-form'
import SignUpForm from './components/sign-up-form'
import { useState } from 'react'

export default function SignIn() {
	const [showSignIn, setShowSignIn] = useState(true)

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	)
}
