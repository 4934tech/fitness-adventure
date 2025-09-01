'use client'

import { motion } from 'framer-motion'

const cards = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  title: ['Quest Complete', 'Level Up', 'Workout Plan', 'Progress Chart', 'Daily Streak', 'AI Tips'][i % 6],
  subtitle: ['+200 XP', 'Level 3 → 4', 'Upper/Lower Split', 'Down 1.2kg', '7 days', 'Form cues'][i % 6],
}))

export function LandingGallery() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12, rotateX: -8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            viewport={{ once: true }}
            className="fa-gradient-border rounded-xl p-[1px]"
          >
            <div className="fa-glass rounded-[inherit] p-5">
              <div className="text-sm text-muted-foreground">{c.title}</div>
              <div className="text-xl font-semibold">{c.subtitle}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}


