"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/user-store";

const quests = [
	{ id: "q1", title: "Complete 30 minutes of cardio", xp: 200, coins: 20 },
	{ id: "q2", title: "Do 3 sets of push-ups", xp: 150, coins: 15 },
	{ id: "q3", title: "Stretch for 10 minutes", xp: 100, coins: 10 },
];

export default function QuestsPage() {
	const completeQuest = useAppStore((s) => s.completeQuest);

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{quests.map((q) => (
				<Card key={q.id}>
					<CardHeader>
						<CardTitle>{q.title}</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							{q.xp} XP • {q.coins} Coins
						</div>
						<Button onClick={() => completeQuest(q.xp, q.coins)}>
							Complete
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
