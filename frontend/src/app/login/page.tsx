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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useApi } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
	return (
		<Suspense
			fallback={<div className="mx-auto max-w-md px-4 py-12">Loading…</div>}
		>
			<LoginForm />
		</Suspense>
	);
}

function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { login } = useApi();
	const searchParams = useSearchParams();
	const router = useRouter();

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await login(email, password);

			if (res.requires_onboarding) {
				router.replace("/onboarding");
				return;
			}

			const nextParam = searchParams.get("next") || "/dashboard";
			const next = nextParam.startsWith("/") ? nextParam : "/dashboard";
			router.replace(next);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message || "Invalid credentials"
					: "Invalid credentials"
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-md px-4 py-12 flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
					<CardDescription>Enter your credentials to sign in.</CardDescription>
				</CardHeader>
				<CardContent>
			<form onSubmit={onSubmit}>
    <div className="flex flex-col gap-6">
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
						placeholder="Enter your password"
					/>
				</div>
      </div>
				<Button type="submit" disabled={loading} className="w-full mt-4">
					{loading ? "Signing in…" : "Sign in"}
				</Button>
			</form>
      {!!error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Make a new account?{" "}
				<Link href="/signup" className="text-primary hover:underline">
					Sign up
				</Link>
			</p>

      </CardContent>
      </Card>
		</div>
	);
}
