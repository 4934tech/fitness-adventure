"use client";

import { motion } from "framer-motion";

export function LandingShowcase() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-14">
			<div className="fa-gradient-border rounded-2xl p-[1px]">
				<div className="fa-glass rounded-[inherit] p-6 sm:p-10">
					<div className="grid items-center gap-6 sm:grid-cols-2">
						<div>
							<motion.h3
								initial={{ opacity: 0, y: 8 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.45 }}
								viewport={{ once: true }}
								className="text-2xl font-semibold"
							>
								Your plan, rendered in neon
							</motion.h3>
							<motion.p
								initial={{ opacity: 0, y: 8 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.08, duration: 0.45 }}
								viewport={{ once: true }}
								className="mt-2 text-muted-foreground"
							>
								We generate adaptive workouts and quests. When life shifts, your
								plan shifts—keeping streaks alive.
							</motion.p>
						</div>
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.98 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ delay: 0.15, duration: 0.45 }}
							viewport={{ once: true }}
							className="relative h-56 w-full overflow-hidden rounded-xl border"
						>
							<div className="absolute inset-0 bg-[radial-gradient(800px_180px_at_60%_0%,oklch(0.77_0.22_316)_0%,transparent_60%)] opacity-50" />
							<div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,.08))]" />
							<div className="absolute inset-0 grid grid-cols-6 gap-[1px] p-4">
								{Array.from({ length: 12 }).map((_, i) => (
									<div key={i} className="rounded bg-black/5 dark:bg-white/5" />
								))}
							</div>
							<div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
								{["XP +200", "Streak +1", "Coins +15"].map((t) => (
									<div
										key={t}
										className="fa-gradient-border rounded-lg p-[1px]"
									>
										<div className="fa-glass rounded-[inherit] px-3 py-2 text-center text-xs font-medium">
											{t}
										</div>
									</div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
