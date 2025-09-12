"use client";

import { motion } from "framer-motion";

const metrics = [
	{ label: "Avg. weekly XP", value: "1.2k" },
	{ label: "Active streaks", value: "3.4k" },
	{ label: "Quests completed", value: "1.8M" },
	{ label: "Countries", value: "60+" },
];

export function LandingMetricsStrip() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-8">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{metrics.map((m, i) => (
					<motion.div
						key={m.label}
						initial={{ opacity: 0, y: 6 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.04, duration: 0.35 }}
						viewport={{ once: true }}
						className="fa-gradient-border rounded-lg p-[1px]"
					>
						<div className="fa-glass rounded-[inherit] px-4 py-3 text-center">
							<div className="text-lg font-semibold">{m.value}</div>
							<div className="text-xs text-muted-foreground">{m.label}</div>
						</div>
					</motion.div>
				))}
			</div>
		</section>
	);
}
