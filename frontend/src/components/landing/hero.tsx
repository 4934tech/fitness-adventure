"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

				<motion.h1
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.6 }}
					viewport={{ once: true }}
					className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl fa-gradient-text"
				>
					Begin your fitness adventure
				</motion.h1>


				<motion.p
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
					viewport={{ once: true }}
					className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground"
				>
					Personalized plans adapt to you. Complete quests, earn XP and coins,
					and stay consistent with streaks and analytics.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.6 }}
					viewport={{ once: true }}
					className="mt-8 flex items-center justify-center gap-3"
				>
					<Button asChild>
						<Link href="/onboarding">Get Started</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/dashboard">See Dashboard</Link>
					</Button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
					viewport={{ once: true }}
					className="mt-10 grid grid-cols-2 gap-4 text-left sm:grid-cols-4"
				>
					{[
						{ label: "Members leveled up", value: "25k+" },
						{ label: "Avg. weekly XP", value: "1.2k" },
						{ label: "Daily quests", value: "500+" },
						{ label: "Countries", value: "60+" },
					].map((s) => (
						<div
							key={s.label}
							className="fa-gradient-border rounded-lg p-[1px]"
						>
							<div className="fa-glass rounded-[inherit] p-4">
								<div className="text-2xl font-semibold">{s.value}</div>
								<div className="text-xs text-muted-foreground">{s.label}</div>
							</div>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
