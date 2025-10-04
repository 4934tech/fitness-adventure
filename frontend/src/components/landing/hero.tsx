"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TextType from "@/components/TextType";
import ShinyText from "@/components/ShinyText";

export function LandingHero() {
	return (
		<section className="relative overflow-hidden">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
					className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground"
				>
					<span className="h-2 w-2 rounded-full bg-primary" />
					AI-customized fitness, gamified.
				</motion.div>

				{/*<motion.h1*/}
				{/*	initial={{ opacity: 0, y: 10 }}*/}
				{/*	whileInView={{ opacity: 1, y: 0 }}*/}
				{/*	transition={{ delay: 0.1, duration: 0.6 }}*/}
				{/*	viewport={{ once: true }}*/}
				{/*	className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl fa-gradient-text"*/}
				{/*>*/}
				{/*	Begin your fitness adventure*/}
				{/*</motion.h1>*/}
				<h1>
					<TextType
						className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl fa-gradient-text"
						text={["Begin your Fitness Adventure"]}
						showCursor={false}
					/>
				</h1>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
					viewport={{ once: true }}
					className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground"
				>
					Personalized plans adapt to you. Track progress, stay consistent with
					streaks and analytics, and more.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.6 }}
					viewport={{ once: true }}
					className="mt-8 flex items-center justify-center gap-3"
				>
					<Button asChild>
						<Link href="/onboarding">
							<ShinyText text={"Get Started"} className={"text-black"} />
						</Link>
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
