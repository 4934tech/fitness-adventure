import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FitnessGoal = 'muscle' | 'fat_loss' | 'endurance' | 'mobility' | 'general_health'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type EquipmentAccess = 'none' | 'limited' | 'full_gym'

export interface OnboardingData {
  name: string
  age: number
  heightCm: number
  weightKg: number
  primaryGoal: FitnessGoal
  experience: ExperienceLevel
  equipment: EquipmentAccess
  preferredDaysPerWeek: number
}

export interface UserProfile extends OnboardingData {
  id: string
  createdAt: string
}

export interface GamificationState {
  level: number
  xp: number
  streakDays: number
  coins: number
  questsCompleted: number
}

export interface AppState {
  profile: UserProfile | null
  gamification: GamificationState
  hasCompletedOnboarding: boolean
  setProfile: (profile: UserProfile) => void
  completeOnboarding: (profile: UserProfile) => void
  addXp: (amount: number) => void
  addCoins: (amount: number) => void
  incrementStreak: () => void
  completeQuest: (xpReward: number, coinReward: number) => void
}

function calculateLevelFromXp(totalXp: number): number {
  // Simple level curve: level up every 1000 XP
  return Math.max(1, Math.floor(totalXp / 1000) + 1)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      hasCompletedOnboarding: false,
      gamification: {
        level: 1,
        xp: 0,
        coins: 0,
        streakDays: 0,
        questsCompleted: 0,
      },
      setProfile: (profile) => set({ profile }),
      completeOnboarding: (profile) =>
        set({ profile, hasCompletedOnboarding: true }),
      addXp: (amount) =>
        set((state) => {
          const xp = Math.max(0, state.gamification.xp + amount)
          const level = calculateLevelFromXp(xp)
          return { gamification: { ...state.gamification, xp, level } }
        }),
      addCoins: (amount) =>
        set((state) => ({
          gamification: {
            ...state.gamification,
            coins: Math.max(0, state.gamification.coins + amount),
          },
        })),
      incrementStreak: () =>
        set((state) => ({
          gamification: {
            ...state.gamification,
            streakDays: state.gamification.streakDays + 1,
          },
        })),
      completeQuest: (xpReward, coinReward) =>
        set((state) => ({
          gamification: {
            ...state.gamification,
            xp: state.gamification.xp + xpReward,
            coins: state.gamification.coins + coinReward,
            level: calculateLevelFromXp(state.gamification.xp + xpReward),
            questsCompleted: state.gamification.questsCompleted + 1,
          },
        })),
    }),
    { name: 'fa-app-state' }
  )
)


