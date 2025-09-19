import { LandingHero } from "@/components/landing/hero";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
import LiquidEther from "@/components/landing/liquidether";

export default function Home() {
	return (
		<div className="relative min-h-screen">
			<div className="fixed inset-0 z-0">
				<LiquidEther
					colors={[ '#073559', '#073559', '#073559' ]}
					mouseForce={20}
					cursorSize={100}
					isViscous={false}
					viscous={30}
					iterationsViscous={32}
					iterationsPoisson={32}
					resolution={0.5}
					isBounce={false}
					autoDemo={true}
					autoSpeed={0.5}
					autoIntensity={2.2}
					takeoverDuration={0.25}
					autoResumeDelay={3000}
					autoRampDuration={0.6}
				/>
			</div>

			<div className="relative z-10">
				<LandingHero />
				<LandingCta />
				<LandingFooter />
			</div>
		</div>
	);
}
