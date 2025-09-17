import { LandingHero } from "@/components/landing/hero";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
import { AppNav } from "@/components/app/nav";
import Image from "next/image";
import LiquidEther from "@/components/landing/liquidether";




export default function Home() {
	return (
		<div className="relative min-h-screen">
			{/* Background LiquidEther */}
			<div className="fixed inset-0 z-0">
				<LiquidEther
					colors={[ '#1C2A33', '#2E3F4A', '#D9DDE1' ]}
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
			
			{/* Content */}
			<div className="relative z-10">
				<header className="sticky top-0 z-50 fa-glass border-b border-border/50 backdrop-blur-xl">
					<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
						<Image src="/logo.png" alt="Logo" height={75} width={75} />
						<AppNav />
					</div>
				</header>
				<LandingHero />
				<LandingCta />
				<LandingFooter />
			</div>
		</div>
	);
}
