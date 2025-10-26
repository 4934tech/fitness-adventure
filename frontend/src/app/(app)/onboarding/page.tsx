"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import Stepper, { Step } from "@/components/ui/stepper";
import { useApi } from "@/lib/api";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type EquipmentAccess = "none" | "limited" | "full_gym";

const onboardingSchema = z.object({
	age: z.coerce.number().int().min(13).max(100),
	heightCm: z.coerce.number().min(100).max(250),
	weightKg: z.coerce.number().min(30).max(300),
	primaryGoal: z.string().min(1, "Please enter your goal"),
	experience: z.enum(["beginner", "intermediate", "advanced"]),
	equipment: z.enum(["none", "limited", "full_gym"]),
	experience1to5: z.coerce.number().int().min(1).max(5),
	preferredDaysPerWeek: z.coerce.number().int().min(1).max(7),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
	const router = useRouter();
	const { updateOnboarding } = useApi();

	const form = useForm<OnboardingValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			age: 25,
			heightCm: 175,
			weightKg: 75,
			primaryGoal: "general_health",
			experience: "beginner" as ExperienceLevel,
			equipment: "limited" as EquipmentAccess,
			experience1to5: 3,
			preferredDaysPerWeek: 3,
		},
		mode: "onTouched",
	});

	async function submitAll(values: OnboardingValues) {
		const height_in = Math.round((values.heightCm / 2.54) * 10) / 10;
		const weight_lb = Math.round(values.weightKg * 2.20462);
		const payload = {
			height_in,
			weight_lb,
			primary_goal: values.primaryGoal,
			experience: values.experience,
			equipment: values.equipment,
			preferred_days_per_week: values.preferredDaysPerWeek,
			age: values.age,
		};
		await updateOnboarding(payload);
		router.push("/dashboard");
	}

	return (
		<div className="max-w-3xl mx-auto pt-8">
			<header className="mb-6">
				<h1 className="text-2xl font-semibold">Tell us about you</h1>
				<p className="text-muted-foreground">
					We will customize your plan and quests.
				</p>
			</header>

			<Form {...form}>
				<Stepper
					initialStep={1}
					onStepChange={() => {}}
					onFinalStepCompleted={form.handleSubmit(submitAll)}
					contentClassName="pb-4"
					footerClassName=""
				>
					<Step>
						<div className="grid gap-4">
							<h2 className="text-lg font-medium">Basics</h2>
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
						</div>
					</Step>

					<Step>
						<div className="grid gap-4">
							<h2 className="text-lg font-medium">Body metrics</h2>
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
						</div>
					</Step>

					<Step>
						<div className="grid gap-4">
							<h2 className="text-lg font-medium">Goals and experience</h2>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="primaryGoal"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Primary Goal</FormLabel>
											<FormControl>
												<Input placeholder="e.g. build strength, improve flexibility..." {...field} />
											</FormControl>
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
						</div>
					</Step>

					<Step>
						<div className="grid gap-4">
							<h2 className="text-lg font-medium">Schedule</h2>
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
							<div className="pt-2">
								<Button
									type="button"
									onClick={form.handleSubmit(submitAll)}
									className="w-full sm:w-auto"
								>
									Save and continue
								</Button>
							</div>
						</div>
					</Step>
				</Stepper>
			</Form>
		</div>
	);
}
