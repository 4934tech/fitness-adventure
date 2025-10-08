"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/components/providers/auth";
import { useApi, type ActiveQuest, type QuestsLoadOut } from "@/lib/api";

export default function QuestsPage() {
	const { isAuthed } = useRequireAuth();
	const { loadQuests, completeQuest } = useApi();

	const [quests, setQuests] = useState<ActiveQuest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isAuthed) return;

		let cancelled = false;
		setLoading(true);
		setError(null);

		loadQuests()
			.then((data: QuestsLoadOut) => {
				if (cancelled) return;
				setQuests(data.active);
			})
			.catch((e: unknown) => {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "Failed to load quests");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isAuthed, loadQuests]);

	if (!isAuthed) return null;

	if (loading) {
		return <p>Loading quests…</p>;
	}

	if (error) {
		return <p className="text-destructive">Error: {error}</p>;
	}

	async function handleComplete(quest: ActiveQuest) {
		try {
			const result = await completeQuest(quest.quest_id);
			if (result.completed) {
				setQuests((prev) => prev.filter((q) => q.quest_id !== quest.quest_id));
			}
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message ?? "Failed to complete quest");
			}
		}
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{quests.map((q) => (
				<Card key={q.quest_id}>
					<CardHeader>
						<CardTitle>{q.title}</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							{q.rewards.xp} XP • {q.rewards.coins} Coins
						</div>
						<Button
							className="cursor-pointer"
							onClick={() => handleComplete(q)}
						>
							Complete
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
