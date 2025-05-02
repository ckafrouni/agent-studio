import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
	return (
		<section className="bg-dots-pattern bg-dots-sm w-full bg-black py-12 md:py-24 lg:py-32 xl:py-48">
			<div className="container px-4 md:px-6">
				<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
					<div className="flex flex-col justify-center space-y-4">
						<div className="space-y-2">
							<div className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
								Next-Gen Agent Platform
							</div>
							<h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
								Build, Host & Test Your <span className="vercel-gradient">LangGraph Workflows</span>
							</h1>
							<p className="max-w-[600px] text-white/70 md:text-xl">
								Agent Studio is the complete platform for LangGraph agent developers to upload, run,
								and test their graph workflows with ease.
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row">
							<Button size="lg" className="bg-white text-black hover:bg-white/90">
								<Link href="/signup" className="flex items-center">
									Get Started <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<Button variant="outline" size="lg" className="border-white/20 hover:bg-white/10">
								<Link href="/docs">View Documentation</Link>
							</Button>
						</div>
					</div>
					<div className="flex items-center justify-center">
						<div className="code-window animate-float relative h-[350px] w-full">
							<div className="code-window-header">
								<div className="code-window-dot bg-red-500"></div>
								<div className="code-window-dot bg-yellow-500"></div>
								<div className="code-window-dot bg-green-500"></div>
								<div className="ml-4 text-xs text-gray-400">langgraph_workflow.py</div>
							</div>
							<div className="code-window-body">
								<pre>
									<code>
										<span className="code-purple">from</span>{' '}
										<span className="code-blue">langchain.langgraph</span>{' '}
										<span className="code-purple">import</span>{' '}
										<span className="code-yellow">Graph</span>
										<br />
										<span className="code-purple">from</span>{' '}
										<span className="code-blue">langchain.agents</span>{' '}
										<span className="code-purple">import</span>{' '}
										<span className="code-yellow">AgentExecutor</span>
										<br />
										<span className="code-purple">from</span>{' '}
										<span className="code-blue">langchain.chat_models</span>{' '}
										<span className="code-purple">import</span>{' '}
										<span className="code-yellow">ChatOpenAI</span>
										<br />
										<br />
										<span className="code-comment"># Define your agent workflow</span>
										<br />
										<span className="code-blue">def</span>{' '}
										<span className="code-yellow">create_workflow</span>():
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-blue">llm</span> ={' '}
										<span className="code-yellow">ChatOpenAI</span>(temperature=
										<span className="code-orange">0</span>)
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-blue">tools</span> = [...]
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-blue">agent</span> ={' '}
										<span className="code-yellow">AgentExecutor</span>.from_llm_and_tools(
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;llm=
										<span className="code-blue">llm</span>,
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tools=
										<span className="code-blue">tools</span>
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;)
										<br />
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-blue">workflow</span> ={' '}
										<span className="code-yellow">Graph</span>()
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-blue">workflow</span>.add_node(
										<span className="code-orange">"agent"</span>,{' '}
										<span className="code-blue">agent</span>)
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;
										<span className="code-comment"># Add more nodes and edges...</span>
										<br />
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-purple">return</span>{' '}
										<span className="code-blue">workflow</span>
									</code>
								</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
