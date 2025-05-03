export function FAQSection() {
	return (
		<section id="faq" className="w-full bg-white py-12 md:py-24 lg:py-32 dark:bg-black">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<div className="inline-block rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/70">
							FAQ
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Frequently <span className="vercel-gradient">Asked Questions</span>
						</h2>
						<p className="text-muted-foreground max-w-[700px] md:text-xl">
							Answers to common questions about Agent Studio.
						</p>
					</div>
				</div>
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
					<FAQCard
						question="What is LangGraph?"
						answer="LangGraph is a framework for building stateful, multi-actor applications with LLMs. It extends LangChain with a graph-based architecture for creating complex agent workflows."
					/>
					<FAQCard
						question="How does Agent Studio work with LangGraph?"
						answer="Agent Studio provides hosting and management for your LangGraph workflows. You can upload your workflows, and we'll handle the infrastructure, scaling, and API endpoints."
					/>
					<FAQCard
						question="Can I use my existing LangGraph code?"
						answer="Yes! Agent Studio is designed to be compatible with existing LangGraph code. You can use @langchain/langgraph-sdk and @langchain/core just as you would with LangGraph's server API."
					/>
					<FAQCard
						question="Do you support custom tools and models?"
						answer="Absolutely. Agent Studio supports all the tools and models that LangGraph supports, including custom tools and integrations with various LLM providers."
					/>
					<FAQCard
						question="How do I get started?"
						answer="Sign up for an account, upload your LangGraph workflow, and you'll get an API endpoint that you can use in your applications. It's that simple!"
					/>
					<FAQCard
						question="What about security and privacy?"
						answer="We take security seriously. Your workflows are isolated, and we provide secure API keys for access. We also offer enterprise-grade security features for larger organizations."
					/>
				</div>
			</div>
		</section>
	)
}

interface FAQCardProps {
	question: string
	answer: string
}

function FAQCard({ question, answer }: FAQCardProps) {
	return (
		<div className="group rounded-lg border border-black/10 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-black/20 hover:bg-white/80 dark:border-white/10 dark:bg-black/30 dark:hover:border-white/20 dark:hover:bg-black/40">
			<h3 className="text-xl font-bold">{question}</h3>
			<p className="text-muted-foreground mt-2">{answer}</p>
		</div>
	)
}
