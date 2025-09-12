"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function LandingCta() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-14">
			<div className="rounded-2xl border p-8 text-center sm:p-12">
				<motion.h3
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
					className="text-2xl font-semibold"
				>
					Ready to start your adventure?
				</motion.h3>
				<p className="mt-2 text-muted-foreground">
					Onboard in less than a minute, for free. No commitment.
				</p>
				<div className="mt-6 flex justify-center gap-3">
					<Button asChild>
						<Link href="/onboarding">Get Started</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/dashboard">Preview Dashboard</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
