export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<div className="bg-primary text-primary-foreground inline-block rounded-lg px-3 py-1 text-sm">
							How It Works
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Simple Workflow for Complex Agents
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
				<div className="bg-background mx-auto max-w-3xl rounded-lg border p-6 shadow-sm">
					<div className="space-y-4">
						<h3 className="text-xl font-bold">Integration Example</h3>
						<div className="bg-muted rounded-md p-4">
							<pre className="text-muted-foreground text-sm">
								<code>{`import { LangGraphClient } from "@langchain/langgraph-sdk";

// Connect to your Agent Studio workflow
const client = new LangGraphClient({
  apiUrl: "https://api.agentstudio.dev/v1",
  apiKey: "your_api_key"
});

// Use the workflow in your application
const response = await client.invokeGraph({
  graphName: "my-workflow",
  inputs: { query: "What is the weather today?" }
});`}</code>
							</pre>
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
		<div className="bg-background flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
			<div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
				{number}
			</div>
			<h3 className="text-xl font-bold">{title}</h3>
			<p className="text-muted-foreground text-center">{description}</p>
		</div>
	)
}
