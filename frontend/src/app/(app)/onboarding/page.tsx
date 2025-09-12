"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
	useAppStore,
	EquipmentAccess,
	ExperienceLevel,
	FitnessGoal,
} from "@/store/user-store";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const onboardingSchema = z.object({
	name: z.string().min(1),
	age: z.coerce.number().int().min(13).max(100),
	heightCm: z.coerce.number().min(100).max(250),
	weightKg: z.coerce.number().min(30).max(300),
	primaryGoal: z.enum([
		"muscle",
		"fat_loss",
		"endurance",
		"mobility",
		"general_health",
	]),
	experience: z.enum(["beginner", "intermediate", "advanced"]),
	equipment: z.enum(["none", "limited", "full_gym"]),
	preferredDaysPerWeek: z.coerce.number().int().min(1).max(7),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
	const router = useRouter();
	const completeOnboarding = useAppStore((s) => s.completeOnboarding);

	const form = useForm<OnboardingValues, unknown>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			name: "",
			age: 25,
			heightCm: 175,
			weightKg: 75,
			primaryGoal: "general_health" as FitnessGoal,
			experience: "beginner" as ExperienceLevel,
			equipment: "limited" as EquipmentAccess,
			preferredDaysPerWeek: 3,
		},
	});

	function onSubmit(values: OnboardingValues) {
		const profile = {
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			...values,
		};
		completeOnboarding(profile);
		router.push("/dashboard");
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Tell us about you</h1>
				<p className="text-muted-foreground">
					We will customize your plan and quests.
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Your name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="age"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Age</FormLabel>
									<FormControl>
										<Input type="number" min={13} max={100} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="preferredDaysPerWeek"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Days per week</FormLabel>
									<FormControl>
										<Input type="number" min={1} max={7} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="heightCm"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Height (cm)</FormLabel>
									<FormControl>
										<Input type="number" min={100} max={250} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="weightKg"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Weight (kg)</FormLabel>
									<FormControl>
										<Input type="number" min={30} max={300} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<FormField
							control={form.control}
							name="primaryGoal"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Primary Goal</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select goal" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="muscle">Build muscle</SelectItem>
											<SelectItem value="fat_loss">Lose fat</SelectItem>
											<SelectItem value="endurance">Endurance</SelectItem>
											<SelectItem value="mobility">Mobility</SelectItem>
											<SelectItem value="general_health">
												General health
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="experience"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Experience</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select level" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="beginner">Beginner</SelectItem>
											<SelectItem value="intermediate">Intermediate</SelectItem>
											<SelectItem value="advanced">Advanced</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="equipment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Equipment</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select access" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											<SelectItem value="limited">Limited</SelectItem>
											<SelectItem value="full_gym">Full gym</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button type="submit" className="mt-2">
						Continue
					</Button>
				</form>
			</Form>
		</div>
	);
}
