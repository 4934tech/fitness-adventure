'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote:
      'I finally stayed consistent. The quests and streaks kept me coming back, and the plan adapted to my busy weeks.',
    name: 'Alex M.',
  },
  {
    quote: 'The XP system is weirdly motivating. I lost 8kg and hit new PRs in 3 months.',
    name: 'Priya S.',
  },
  {
    quote: 'Best-looking fitness app I’ve used. Charts and insights are actually useful.',
    name: 'Dan R.',
  },
]

export function LandingTestimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loved by busy humans</h2>
        <p className="mt-2 text-muted-foreground">Results come from consistency. We help you stick with it.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            viewport={{ once: true }}
            className="rounded-lg border p-5"
          >
            <p className="text-sm">“{t.quote}”</p>
            <footer className="mt-3 text-xs text-muted-foreground">— {t.name}</footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  )
}


