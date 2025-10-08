"use client";

import { Suspense, useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useApi } from "@/lib/api";
import VerifyEmailCard from "@/components/ui/verify-email-card";

export default function SignUpPage() {
	return (
		<Suspense
			fallback={<div className="mx-auto max-w-md px-4 py-12">Loading…</div>}
		>
			<SignUpForm />
		</Suspense>
	);
}

function SignUpForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingVerification, setPendingVerification] = useState(false);

	const { signup } = useApi();

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);

		if (name.length < 3 || name.length > 50) {
			setError("Name must be between 3 and 50 characters");
			return;
		}
		if (password.length < 8 || password.length > 64) {
			setError("Password must be between 8 and 64 characters");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			setLoading(true);
			const res = await signup(name, email, password);
			if (res?.status === "pending_verification") {
				setPendingVerification(true);
			}
		} catch (e) {
			setError(
				e instanceof Error
					? e.message || "Something went wrong"
					: "Something went wrong"
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-md px-4 py-12 flex flex-col gap-6">
			{!pendingVerification ? (
				<Card>
					<CardHeader>
						<CardTitle>Create account</CardTitle>
						<CardDescription>
							Get started on your fitness adventure.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col gap-6">
								<div>
									<label className="text-sm">Full name</label>
									<Input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										minLength={3}
										maxLength={50}
										placeholder="Enter your full name"
									/>
								</div>

								<div>
									<label className="text-sm">Email</label>
									<Input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										placeholder="you@example.com"
									/>
								</div>

								<div>
									<label className="text-sm">Password</label>
									<PasswordInput
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={8}
										maxLength={64}
										placeholder="Create a password"
									/>
								</div>

								<div>
									<label className="text-sm">Confirm password</label>
									<PasswordInput
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										minLength={8}
										maxLength={64}
										placeholder="Confirm your password"
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={loading}
								className="w-full mt-4 cursor-pointer"
							>
								{loading ? "Creating account…" : "Create account"}
							</Button>
						</form>

						{!!error && (
							<p className="text-sm text-red-600 mt-2 text-center">{error}</p>
						)}

						<p className="mt-6 text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="text-primary hover:underline">
								Login
							</Link>
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Verify your email</CardTitle>
						<CardDescription>
							We sent a verification link to your inbox.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<VerifyEmailCard email={email} />
					</CardContent>
				</Card>
			)}
		</div>
	);
}
