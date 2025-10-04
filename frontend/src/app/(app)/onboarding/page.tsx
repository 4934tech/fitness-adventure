"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import Stepper, { Step } from "@/components/ui/stepper";
import VerifyEmailCard from "@/components/ui/verify-email-card";
import { useApi } from "@/lib/api";

type FitnessGoal =
	| "muscle"
	| "fat_loss"
	| "endurance"
	| "mobility"
	| "general_health";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type EquipmentAccess = "none" | "limited" | "full_gym";

const onboardingSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters").max(64, "Password must be less than 64 characters"),
	confirmPassword: z.string(),
	name: z.string().min(1, "Please enter your name"),
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
	anythingElse: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
	const router = useRouter();
	const { signup, login } = useApi();
	
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [accountCreated, setAccountCreated] = useState(false);
	const [onboardingCompleted, setOnboardingCompleted] = useState(false);
	const [userEmail, setUserEmail] = useState("");

	const form = useForm<OnboardingValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			primaryGoal: "general_health" as FitnessGoal,
			preferredDaysPerWeek: 3,
		},
		mode: "onTouched",
	});

	async function submitAll(values: OnboardingValues) {
		setError(null);
		setLoading(true);
		
		try {
			if (!accountCreated) {
				// First create the account
				await signup(values.name, values.email, values.password);
				setAccountCreated(true);
			}
			
			// Save profile data (you might want to send this to your backend)
			const profilePayload = {
				name: values.name,
				age: values.age,
				heightCm: values.heightCm,
				weightKg: values.weightKg,
				primaryGoal: values.primaryGoal,
				experience: values.experience,
				equipment: values.equipment,
				preferredDaysPerWeek: values.preferredDaysPerWeek,
				anythingElse: values.anythingElse,
			};
			
			console.log("profile payload", profilePayload);
			
			// Set completion state and email for verification
			setUserEmail(values.email);
			setOnboardingCompleted(true);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (onboardingCompleted) {
		return (
			<div className="mx-auto max-w-md px-4 py-12 flex flex-col gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Verify your email</CardTitle>
						<CardDescription>We sent a verification link to your inbox.</CardDescription>
					</CardHeader>
					<CardContent>
						<VerifyEmailCard email={userEmail} />
						<div className="mt-6 pt-4 border-t">
							<p className="text-sm text-muted-foreground mb-3">
								Already verified your email?
							</p>
							<Link href="/login">
								<Button className="w-full">
									Continue to Login
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto pt-8">
			<header>
				<h1 className="text-3xl font-bold">Tell us about you</h1>
				<p className="mt-2 text-5sm text-muted-foreground">
					We will create a profile for you and help you get started with this
					info.
				</p>
			</header>
			<div className="mt-20">
				<Form {...form}>
					<Stepper
						initialStep={1}
						onStepChange={() => {}}
						onFinalStepCompleted={form.handleSubmit(submitAll)}
						contentClassName="pb-4"
						footerClassName=""
						validateStep={(step) => {
							// Validate each step's required fields
							const values = form.getValues();
							switch (step) {
								case 1: // Account creation step
									return !!(values.email && values.password && values.confirmPassword && 
										values.password === values.confirmPassword && 
										values.email.includes('@') && 
										values.password.length >= 8);
								case 2: // Basics step
									return !!(values.name && values.age && values.age >= 13 && values.age <= 100);
								case 3: // Body metrics step
									return !!(values.heightCm && values.weightKg && 
										values.heightCm >= 100 && values.heightCm <= 250 &&
										values.weightKg >= 30 && values.weightKg <= 300);
								case 4: // Goals and experience step
									return !!(values.primaryGoal && values.experience && values.equipment);
								case 5: // Final step
									return !!(values.preferredDaysPerWeek && 
										values.preferredDaysPerWeek >= 1 && values.preferredDaysPerWeek <= 7);
								default:
									return true;
							}
						}}
					>
						<Step>
							<div className="grid gap-4">
								<h2 className="text-lg font-medium">Create Account</h2>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input type="email" placeholder="you@example.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<PasswordInput placeholder="Create a password" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<PasswordInput placeholder="Confirm your password" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</Step>

						<Step>
							<div className="grid gap-4">
								<h2 className="text-lg font-medium">Basics</h2>
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
														<SelectItem value="intermediate">
															Intermediate
														</SelectItem>
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
												<FormLabel>Equipment Availability</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select equipment" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="none">No equipment</SelectItem>
														<SelectItem value="limited">Limited equipment</SelectItem>
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
								<FormField
									control={form.control}
									name={"anythingElse"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Anything else?</FormLabel>
											<FormControl>
												<Input
													type="text"
													placeholder={"E.g. injuries, preferences, etc"}
													{...field}
												></Input>
											</FormControl>
										</FormItem>
									)}
								/>

								{error && <p className="text-sm text-red-600 mt-2">{error}</p>}
							</div>
						</Step>
					</Stepper>
				</Form>
			</div>
		</div>
	);
}
