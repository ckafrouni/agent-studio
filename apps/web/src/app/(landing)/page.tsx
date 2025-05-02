import { AlphaBanner } from './components/alpha-banner'
import { Header } from './components/header'
import { HeroSection } from './components/hero-section'
import { FeaturesSection } from './components/features-section'
import { HowItWorksSection } from './components/how-it-works-section'
import { PricingSection } from './components/pricing-section'
import { FAQSection } from './components/faq-section'
import { CTASection } from './components/cta-section'
import { Footer } from './components/footer'

export default function LandingPage() {
	return (
		<>
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
			<PricingSection />
			<FAQSection />
			<CTASection />
		</>
	)
}
