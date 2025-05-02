import type React from 'react'
import { Server, Key, Globe, Zap, Database, Code } from 'lucide-react'

export function FeaturesSection() {
	return (
		<section id="features" className="bg-grid-pattern bg-grid-sm w-full py-12 md:py-24 lg:py-32">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<div className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
							Features
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Everything You Need for <span className="vercel-gradient">LangGraph Development</span>
						</h2>
						<p className="max-w-[700px] text-white/70 md:text-xl">
							Agent Studio provides a complete platform for developing, hosting, and testing your
							LangGraph workflows.
						</p>
					</div>
				</div>
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
					<FeatureCard
						icon={<Server className="h-6 w-6 text-[#7928ca]" />}
						title="Full Hosting"
						description="Deploy your LangGraph workflows with zero infrastructure management."
					/>
					<FeatureCard
						icon={<Key className="h-6 w-6 text-[#7928ca]" />}
						title="API Keys"
						description="Generate API keys to easily integrate your workflows into any application."
					/>
					<FeatureCard
						icon={<Globe className="h-6 w-6 text-[#7928ca]" />}
						title="Compatible API"
						description="Same outputs as LangGraph's server API for seamless integration."
					/>
					<FeatureCard
						icon={<Zap className="h-6 w-6 text-[#7928ca]" />}
						title="Instant Testing"
						description="Test your workflows directly in the platform with real-time feedback."
					/>
					<FeatureCard
						icon={<Database className="h-6 w-6 text-[#7928ca]" />}
						title="Version Control"
						description="Track changes and manage different versions of your workflows."
					/>
					<FeatureCard
						icon={<Code className="h-6 w-6 text-[#7928ca]" />}
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
		<div className="group flex flex-col items-center space-y-2 rounded-lg border border-white/10 bg-black/20 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-black/30">
			<div className="rounded-full bg-white/5 p-3 transition-colors group-hover:bg-white/10">
				{icon}
			</div>
			<h3 className="text-xl font-bold">{title}</h3>
			<p className="text-center text-white/70">{description}</p>
		</div>
	)
}
