"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signup } from "@/lib/api";
import VerifyEmailCard from "@/components/ui/verify-email-card";
import { PasswordInput } from "@/components/ui/password-input";

export default function SignUpPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingVerification, setPendingVerification] = useState(false);

	async function onSubmit(e: React.FormEvent) {
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
			if (res.status === "pending_verification") {
				setPendingVerification(true);
			}
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message || "Something went wrong");
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-md px-4 py-12">
			<h1 className="text-2xl font-semibold">Create account</h1>
			<p className="text-sm text-muted-foreground">
				Get started on your fitness adventure.
			</p>

			{!pendingVerification ? (
				<form onSubmit={onSubmit} className="mt-6 space-y-3">
					{!!error && <p className="text-sm text-red-600">{error}</p>}

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
							placeholder="Enter your email"
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

					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Creating account…" : "Create account"}
					</Button>
				</form>
			) : (
				<div className="mt-6">
					<VerifyEmailCard email={email} />
				</div>
			)}

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link href="/login" className="text-primary hover:underline">
					Login
				</Link>
			</p>
		</div>
	);
}
