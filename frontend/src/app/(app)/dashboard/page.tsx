'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/user-store'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useRequireAuth } from '@/lib/auth'

const mockWeeklyXp = [
  { day: 'Mon', xp: 120 },
  { day: 'Tue', xp: 200 },
  { day: 'Wed', xp: 80 },
  { day: 'Thu', xp: 300 },
  { day: 'Fri', xp: 150 },
  { day: 'Sat', xp: 420 },
  { day: 'Sun', xp: 240 },
]

export default function DashboardPage() {
  const { profile, gamification } = useAppStore()
  const { isAuthed } = useRequireAuth()

  if (!isAuthed) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {profile ? `Welcome back, ${profile.name}` : 'Welcome to Fitness Adventure'}
        </h1>
        <p className="text-muted-foreground">
          Level {gamification.level} • {gamification.xp} XP • {gamification.coins} Coins • Streak {gamification.streakDays}d
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>XP Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(gamification.xp % 1000) / 10} />
                <p className="mt-2 text-sm text-muted-foreground">
                  {gamification.xp % 1000} / 1000 to next level
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quests Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{gamification.questsCompleted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{gamification.streakDays} days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Weekly XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockWeeklyXp}>
                    <XAxis dataKey="day" stroke="var(--foreground)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--foreground)" tickLine={false} axisLine={false} />
                    <Bar dataKey="xp" fill="var(--primary)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
