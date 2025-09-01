'use client'

import { motion } from 'framer-motion'

const steps = [
  { title: 'Onboard', description: 'Tell us your goals, experience, and schedule.' },
  { title: 'Get your plan', description: 'We build a personalized plan and quests.' },
  { title: 'Level up', description: 'Train, track, and earn XP to reach your goals.' },
]

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <p className="mt-2 text-muted-foreground">Three steps to get going.</p>
      </div>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            viewport={{ once: true }}
            className="rounded-lg border p-5"
          >
            <div className="text-xs text-muted-foreground">Step {i + 1}</div>
            <div className="mt-1 text-base font-medium">{s.title}</div>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}


