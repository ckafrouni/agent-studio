import { HeroSection } from './components/hero-section'
import { FeaturesSection } from './components/features-section'
import { HowItWorksSection } from './components/how-it-works-section'
import { PricingSection } from './components/pricing-section'
import { FAQSection } from './components/faq-section'
import { CTASection } from './components/cta-section'
import { Footer } from './components/footer'

export default function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				<HeroSection />
				<FeaturesSection />
				<HowItWorksSection />
				<PricingSection />
				<FAQSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	)
}
