import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export function PricingSection() {
	return (
		<section
			id="pricing"
			className="bg-grid-pattern w-full bg-white py-12 md:py-24 lg:py-32 dark:bg-black"
		>
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<div className="inline-block rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/70">
							Pricing
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Simple, <span className="vercel-gradient">Transparent Pricing</span>
						</h2>
						<p className="text-muted-foreground max-w-[700px] md:text-xl">
							Choose the plan that's right for your development needs.
						</p>
					</div>
				</div>
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
					<PricingCard
						title="Free"
						description="Perfect for testing and small projects"
						price="$0"
						features={['3 workflows', '1,000 API calls/month', 'Community support']}
						buttonText="Get Started"
						buttonVariant="outline"
					/>
					<PricingCard
						title="Pro"
						description="For professional developers and teams"
						price="$49"
						features={[
							'Unlimited workflows',
							'50,000 API calls/month',
							'Priority support',
							'Advanced analytics',
						]}
						buttonText="Get Started"
						buttonVariant="default"
						popular
					/>
					<PricingCard
						title="Enterprise"
						description="For large organizations with custom needs"
						price="Custom"
						features={[
							'Unlimited everything',
							'Dedicated support',
							'Custom integrations',
							'SLA guarantees',
						]}
						buttonText="Contact Sales"
						buttonVariant="outline"
					/>
				</div>
			</div>
		</section>
	)
}

interface PricingCardProps {
	title: string
	description: string
	price: string
	features: string[]
	buttonText: string
	buttonVariant: 'default' | 'outline'
	popular?: boolean
}

function PricingCard({
	title,
	description,
	price,
	features,
	buttonText,
	buttonVariant,
	popular,
}: PricingCardProps) {
	return (
		<div
			className={`relative flex flex-col rounded-lg border ${
				popular
					? 'border-black/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:border-white/20 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
					: 'border-black/10 dark:border-white/10'
			} bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-black/20 dark:bg-black/30 dark:hover:border-white/20`}
		>
			{popular && (
				<div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
					Popular
				</div>
			)}
			<div className="space-y-2">
				<h3 className="text-2xl font-bold">{title}</h3>
				<p className="text-muted-foreground">{description}</p>
			</div>
			<div className="mt-4 flex items-baseline text-3xl font-bold">
				{price}
				<span className="text-muted-foreground ml-1 text-base font-medium">/month</span>
			</div>
			<ul className="mt-6 space-y-3">
				{features.map((feature, index) => (
					<li key={index} className="flex items-center">
						<Check className="mr-2 h-4 w-4 text-[oklch(0.546_0.245_262.881)]" />
						<span className="text-foreground/90">{feature}</span>
					</li>
				))}
			</ul>
			<Button
				className={`mt-6 ${
					buttonVariant === 'default'
						? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90'
						: 'border-black/20 bg-transparent hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10'
				}`}
				variant={buttonVariant}
			>
				{buttonText}
			</Button>
		</div>
	)
}
