export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="w-full bg-white py-12 md:py-24 lg:py-32 dark:bg-black">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<div className="inline-block rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/70">
							How It Works
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Simple Workflow for <span className="vercel-gradient">Complex Agents</span>
						</h2>
						<p className="text-muted-foreground max-w-[700px] md:text-xl">
							Agent Studio makes it easy to deploy and manage your LangGraph workflows.
						</p>
					</div>
				</div>
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
					<StepCard
						number={1}
						title="Upload"
						description="Upload your LangGraph workflow to Agent Studio using our simple interface or CLI."
					/>
					<StepCard
						number={2}
						title="Configure"
						description="Set up your environment variables, API keys, and deployment settings."
					/>
					<StepCard
						number={3}
						title="Deploy"
						description="Deploy your workflow with a single click and get an API endpoint instantly."
					/>
				</div>
				<div className="mx-auto max-w-3xl rounded-lg border border-black/10 bg-white/50 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
					<div className="space-y-4">
						<h3 className="text-xl font-bold">Integration Example</h3>
						<div className="code-window rounded-md">
							<div className="code-window-header">
								<div className="code-window-dot bg-red-500"></div>
								<div className="code-window-dot bg-yellow-500"></div>
								<div className="code-window-dot bg-green-500"></div>
								<div className="ml-4 text-xs text-gray-400">integration.js</div>
							</div>
							<div className="code-window-body">
								<pre>
									<code>
										<span className="code-purple">import</span> {'{ LangGraphClient }'}{' '}
										<span className="code-purple">from</span>{' '}
										<span className="code-green">"@langchain/langgraph-sdk"</span>;
										<br />
										<br />
										<span className="code-comment">// Connect to your Agent Studio workflow</span>
										<br />
										<span className="code-blue">const</span>{' '}
										<span className="code-yellow">client</span> ={' '}
										<span className="code-blue">new</span>{' '}
										<span className="code-yellow">LangGraphClient</span>({'{'}
										<br />
										{'  '}
										<span className="code-yellow">apiUrl</span>:{' '}
										<span className="code-green">"https://api.agentstudio.dev/v1"</span>,
										<br />
										{'  '}
										<span className="code-yellow">apiKey</span>:{' '}
										<span className="code-green">"your_api_key"</span>
										<br />
										{'}'});
										<br />
										<br />
										<span className="code-comment">// Use the workflow in your application</span>
										<br />
										<span className="code-blue">const</span>{' '}
										<span className="code-yellow">response</span> ={' '}
										<span className="code-purple">await</span>{' '}
										<span className="code-yellow">client</span>.
										<span className="code-blue">invokeGraph</span>({'{'}
										<br />
										{'  '}
										<span className="code-yellow">graphName</span>:{' '}
										<span className="code-green">"my-workflow"</span>,
										<br />
										{'  '}
										<span className="code-yellow">inputs</span>:{' '}
										{'{ query: "What is the weather today?" }'}
										<br />
										{'}'});
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

interface StepCardProps {
	number: number
	title: string
	description: string
}

function StepCard({ number, title, description }: StepCardProps) {
	return (
		<div className="group flex flex-col items-center space-y-2 rounded-lg border border-black/10 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-black/20 hover:bg-white/80 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20 dark:hover:bg-black/30">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-xl font-bold transition-colors group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
				{number}
			</div>
			<h3 className="text-xl font-bold">{title}</h3>
			<p className="text-muted-foreground text-center">{description}</p>
		</div>
	)
}
