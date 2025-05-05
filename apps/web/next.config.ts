import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'http://localhost:3030/api/:path*',
			},
		]
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
		],
	},
	// disable linting
	linting: false,
}

export default nextConfig
