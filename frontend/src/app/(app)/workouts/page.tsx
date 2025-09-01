'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/user-store'

const recommendedWorkouts = [
  { id: 'w1', title: 'Full Body Beginner', xp: 300 },
  { id: 'w2', title: 'Upper Body Strength', xp: 350 },
  { id: 'w3', title: 'Lower Body Power', xp: 350 },
]

export default function WorkoutsPage() {
  const addXp = useAppStore((s) => s.addXp)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recommendedWorkouts.map((w) => (
        <Card key={w.id}>
          <CardHeader>
            <CardTitle>{w.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{w.xp} XP</div>
            <Button onClick={() => addXp(w.xp)}>Start</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


