import Link from 'next/link'
import { ArrowRight, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
	return (
		<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
			<div className="container px-4 md:px-6">
				<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
					<div className="flex flex-col justify-center space-y-4">
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
								Build, Host & Manage Your LangGraph Workflows
							</h1>
							<p className="text-muted-foreground max-w-[600px] md:text-xl">
								Agent Studio is the complete platform for LangGraph agent developers to upload,
								test, and serve their agentic langgraph workflows with ease.
							</p>
						</div>
						<div className="flex flex-col gap-4 min-[400px]:flex-row">
							<Button asChild size="lg">
								<Link href="/login">
									Get Started <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<Link href="#">View Documentation</Link>
							</Button>
						</div>
					</div>
					<div className="flex items-center justify-center">
						<div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-slate-100 to-slate-200 p-2 dark:from-slate-900 dark:to-slate-800">
							<div className="absolute inset-0 flex items-center justify-center">
								<Code className="text-muted-foreground/30 h-24 w-24" />
							</div>
							<div className="from-background absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
							<div className="bg-background/90 absolute right-4 bottom-4 left-4 rounded-lg p-4 backdrop-blur">
								<div className="text-sm font-medium">LangGraph Workflow</div>
								<div className="text-muted-foreground mt-2 text-xs">
									<code>{`import { createGraph } from "@langchain/langgraph-sdk"`}</code>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
