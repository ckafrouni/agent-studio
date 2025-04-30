import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
	return (
		<section className="bg-muted w-full py-12 md:py-24 lg:py-32">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Ready to Get Started?
						</h2>
						<p className="text-muted-foreground max-w-[700px] md:text-xl">
							Join the growing community of LangGraph developers using Agent Studio.
						</p>
					</div>
					<div className="flex flex-col gap-4 min-[400px]:flex-row">
						<Button asChild size="lg">
							<Link href="/login">
								Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<Link href="#">Contact Sales</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
