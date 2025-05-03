import type React from 'react'
import { Server, Key, Globe, Zap, Database, Code } from 'lucide-react'

export function FeaturesSection() {
	return (
		<section
			id="features"
			className="bg-grid-pattern w-full bg-white py-12 md:py-24 lg:py-32 dark:bg-black"
		>
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<div className="inline-block rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/70">
							Features
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Everything You Need for <span className="vercel-gradient">LangGraph Development</span>
						</h2>
						<p className="text-muted-foreground max-w-[700px] md:text-xl">
							Agent Studio provides a complete platform for developing, hosting, and testing your
							LangGraph workflows.
						</p>
					</div>
				</div>
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
					<FeatureCard
						icon={<Server className="h-6 w-6 text-[oklch(0.546_0.245_262.881)]" />}
						title="Full Hosting"
						description="Deploy your LangGraph workflows with zero infrastructure management."
					/>
					<FeatureCard
						icon={<Key className="h-6 w-6 text-[oklch(0.546_0.245_262.881)]" />}
						title="API Keys"
						description="Generate API keys to easily integrate your workflows into any application."
					/>
					<FeatureCard
						icon={<Globe className="h-6 w-6 text-[oklch(0.546_0.245_262.881)]" />}
						title="Compatible API"
						description="Same outputs as LangGraph's server API for seamless integration."
					/>
					<FeatureCard
						icon={<Zap className="h-6 w-6 text-[oklch(0.546_0.245_262.881)]" />}
						title="Instant Testing"
						description="Test your workflows directly in the platform with real-time feedback."
					/>
					<FeatureCard
						icon={<Database className="h-6 w-6 text-[oklch(0.546_0.245_262.881)]" />}
						title="Version Control"
						description="Track changes and manage different versions of your workflows."
					/>
					<FeatureCard
						icon={<Code className="h-6 w-6 text-[oklch(0.546_0.245_262.881)]" />}
						title="SDK Support"
						description="Full support for @langchain/langgraph-sdk and @langchain/core."
					/>
				</div>
			</div>
		</section>
	)
}

interface FeatureCardProps {
	icon: React.ReactNode
	title: string
	description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
	return (
		<div className="group flex flex-col items-center space-y-2 rounded-lg border border-black/10 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-black/20 hover:bg-white/80 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20 dark:hover:bg-black/30">
			<div className="rounded-full bg-black/5 p-3 transition-colors group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
				{icon}
			</div>
			<h3 className="text-xl font-bold">{title}</h3>
			<p className="text-muted-foreground text-center">{description}</p>
		</div>
	)
}
