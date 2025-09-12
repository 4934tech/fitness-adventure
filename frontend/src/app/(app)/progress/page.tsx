"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

const mockWeightData = [
	{ week: "W1", kg: 80 },
	{ week: "W2", kg: 79.5 },
	{ week: "W3", kg: 79.2 },
	{ week: "W4", kg: 78.8 },
	{ week: "W5", kg: 78.4 },
];

export default function ProgressPage() {
	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Weight Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={mockWeightData}>
								<XAxis
									dataKey="week"
									stroke="var(--foreground)"
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke="var(--foreground)"
									tickLine={false}
									axisLine={false}
								/>
								<Line
									type="monotone"
									dataKey="kg"
									stroke="var(--primary)"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
