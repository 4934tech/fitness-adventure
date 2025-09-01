'use client'

import { motion } from 'framer-motion'
import { Trophy, LineChart, Sparkles, Target } from 'lucide-react'

const features = [
  {
    title: 'AI-customized plans',
    description: 'Plans adapt to your goals, schedule, and equipment in real-time.',
    icon: Sparkles,
  },
  {
    title: 'Gameified motivation',
    description: 'Earn XP and coins, complete quests, and unlock achievements.',
    icon: Trophy,
  },
  {
    title: 'Track what matters',
    description: 'Weight, PRs, streaks, and habits—visualized beautifully.',
    icon: LineChart,
  },
  {
    title: 'Clear goals',
    description: 'Set targets and crush them with adaptive guidance.',
    icon: Target,
  },
]

export function LandingFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Everything you need to stay consistent</h2>
        <p className="mt-2 text-muted-foreground">Built to make fitness fun and effective.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            viewport={{ once: true }}
            className="fa-gradient-border rounded-xl p-[1px]"
          >
            <div className="fa-glass rounded-[inherit] p-5">
              <f.icon className="h-6 w-6 text-primary" />
              <div className="mt-3 text-base font-medium">{f.title}</div>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}


