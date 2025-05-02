import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
	return (
		<section className="bg-grid-pattern bg-grid-sm w-full py-12 md:py-24 lg:py-32">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
							Ready to <span className="vercel-gradient">Get Started?</span>
						</h2>
						<p className="max-w-[700px] text-white/70 md:text-xl">
							Join the growing community of LangGraph developers using Agent Studio.
						</p>
					</div>
					<div className="flex flex-col gap-2 min-[400px]:flex-row">
						<Button size="lg" className="bg-white text-black hover:bg-white/90">
							<Link href="/signup" className="flex items-center">
								Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button variant="outline" size="lg" className="border-white/20 hover:bg-white/10">
							<Link href="/contact">Contact Sales</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
