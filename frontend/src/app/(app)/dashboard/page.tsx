"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as UiProgress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useRequireAuth } from "@/components/providers/auth";
import {
	useApi,
	type Profile,
	type ProgressOut,
	type WalletOut,
	type QuestsLoadOut,
} from "@/lib/api";

const mockWeeklyXp = [
	{ day: "Mon", xp: 120 },
	{ day: "Tue", xp: 200 },
	{ day: "Wed", xp: 80 },
	{ day: "Thu", xp: 300 },
	{ day: "Fri", xp: 150 },
	{ day: "Sat", xp: 420 },
	{ day: "Sun", xp: 240 },
];

export default function DashboardPage() {
	const { isAuthed } = useRequireAuth();
	const { getProfile, getProgress, getWallet, loadQuests } = useApi();

	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [progress, setProgress] = useState<ProgressOut | null>(null);
	const [wallet, setWallet] = useState<WalletOut | null>(null);
	const [quests, setQuests] = useState<QuestsLoadOut | null>(null);
	const [error, setError] = useState<string | null>(null);

	const xpSegment = useMemo(() => {
		if (!progress) return { current: 0, required: 1000, percent: 0 };
		const required = 1000;
		const current = required - progress.xp_to_next_level;
		const percent = Math.max(0, Math.min(100, (current / required) * 100));
		return { current, required, percent };
	}, [progress]);

	useEffect(() => {
		if (!isAuthed) return;

		let cancelled = false;
		setLoading(true);
		setError(null);

		Promise.all([getProfile(), getProgress(), getWallet(), loadQuests()])
			.then(([p, prog, wal, q]) => {
				if (cancelled) return;
				setProfile(p);
				setProgress(prog);
				setWallet(wal);
				setQuests(q);
			})
			.catch((e: unknown) => {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "Failed to load dashboard");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isAuthed, getProfile, getProgress, getWallet, loadQuests]);

	if (!isAuthed) return null;

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<div className="h-6 w-64 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-4 w-80 animate-pulse rounded bg-muted" />
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<div className="h-5 w-32 animate-pulse rounded bg-muted" />
							</CardHeader>
							<CardContent>
								<div className="h-6 w-full animate-pulse rounded bg-muted" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<p className="text-destructive">Error: {error}</p>
			</div>
		);
	}

	const level = progress?.level ?? 1;
	const xpTotal = progress?.xp_total ?? 0;
	const coins = wallet?.coins_balance ?? 0;
	const questsCompleted = progress?.quests_completed_count ?? 0;

	const streakDays = "—"; // TODO: Add streak route and connect it here

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">
					{profile ? `Welcome back, ${profile.name}` : "Welcome"}
				</h1>
				<p className="text-muted-foreground">
					Level {level} • {xpTotal} XP • {coins} Coins • Streak {streakDays}
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
								<UiProgress value={xpSegment.percent} />
								<p className="mt-2 text-sm text-muted-foreground">
									{xpSegment.current} / {xpSegment.required} to next level
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Quests Completed</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-semibold">{questsCompleted}</p>
								<p className="mt-2 text-sm text-muted-foreground">
									Active quests: {quests?.active.length ?? 0}
									{quests && quests.needed > 0
										? ` (topping up ${quests.needed})`
										: ""}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Coins</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-semibold">{coins}</p>
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
										<XAxis
											dataKey="day"
											stroke="var(--foreground)"
											tickLine={false}
											axisLine={false}
										/>
										<YAxis
											stroke="var(--foreground)"
											tickLine={false}
											axisLine={false}
										/>
										<Bar dataKey="xp" fill="var(--primary)" radius={4} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
