import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	/* config options here */
	redirects: async () => {
		return [
			{
				source: '/',
				destination: '/chat',
				permanent: true,
			},
		]
	},
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
}

export default nextConfig
