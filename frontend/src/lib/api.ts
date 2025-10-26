"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth";
import { useCallback, useMemo } from "react";

export type AuthResponse = {
	id: string;
	name: string;
	email: string;
	token: string;
	token_expiry: string;
	requires_onboarding: boolean;
};

export type Profile = { id: string; name: string; email: string };

export type OnboardingIn = {
  height_in: number;
  weight_lb: number;
  primary_goal: string;
  experience: "beginner" | "intermediate" | "advanced";
  equipment: "none" | "limited" | "full_gym";
  preferred_days_per_week: number;
  age?: number | null;
};

export type OnboardingResult = {
	ok: boolean;
	requires_onboarding: boolean;
};

export type ProgressOut = {
	level: number;
	xp_total: number;
	xp_to_next_level: number;
	quests_completed_count: number;
};

export type WalletOut = {
	coins_balance: number;
};

export type Rewards = { xp: number; coins: number };

export type ActiveQuest = {
	quest_id: string;
	title: string;
	type: string;
	started_at: string;
	rewards: Rewards;
};

export type QuestsLoadOut = {
	active: ActiveQuest[];
	needed: number;
	generation_started: boolean;
};

export type CompleteQuestOut = {
	ok: boolean;
	completed: boolean;
	xp_awarded: number;
	coins_awarded: number;
	level: number;
	xp_total: number;
	xp_to_next_level: number;
};

export type CheckinOut = {
	ok: boolean;
	streak_current: number;
	streak_best: number;
};

export const API_BASE =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class HttpError extends Error {
	status: number;
	detail: string;
	constructor(status: number, detail: string) {
		super(detail);
		this.status = status;
		this.detail = detail;
		this.name = "HttpError";
	}
}

function prepareBodyAndHeaders(body: unknown, init?: RequestInit) {
	const headers = new Headers(init?.headers || {});
	let finalBody: BodyInit | undefined;

	if (body == null) {
		headers.set("Content-Type", "application/json");
		finalBody = JSON.stringify({});
	} else if (
		body instanceof FormData ||
		body instanceof Blob ||
		ArrayBuffer.isView(body)
	) {
		finalBody = body as BodyInit;
	} else if (typeof body === "string") {
		finalBody = body;
	} else {
		headers.set("Content-Type", "application/json");
		finalBody = JSON.stringify(body);
	}

	return { headers, finalBody };
}

export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
	const headers = new Headers(init?.headers || {});
	const res = await fetch(`${API_BASE}${path}`, {
		method: "GET",
		headers,
		credentials: "include",
		...(init ? { ...init, headers } : {}),
	});

	if (!res.ok) {
		let msg = `Request failed (${res.status})`;
		try {
			const j = await res.json();
			msg = j.detail || j.message || msg;
		} catch {
			try {
				msg = await res.text();
			} catch {}
		}
		throw new HttpError(res.status, msg);
	}
	return res.json();
}

export async function postJSON<T>(
	path: string,
	body?: unknown,
	init?: RequestInit
): Promise<T> {
	const { headers, finalBody } = prepareBodyAndHeaders(body, init);

	const res = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers,
		body: finalBody,
		credentials: "include",
		...(init ? { ...init, headers, body: finalBody } : {}),
	});

	if (!res.ok) {
		let msg = `Request failed (${res.status})`;
		try {
			const j = await res.json();
			msg = j.detail || j.message || msg;
		} catch {
			try {
				msg = await res.text();
			} catch {}
		}
		throw new HttpError(res.status, msg);
	}
	return res.status === 204 ? (undefined as unknown as T) : res.json();
}

export async function putJSON<T>(
	path: string,
	body?: unknown,
	init?: RequestInit
): Promise<T> {
	const { headers, finalBody } = prepareBodyAndHeaders(body, init);

	const res = await fetch(`${API_BASE}${path}`, {
		method: "PUT",
		headers,
		body: finalBody,
		credentials: "include",
		...(init ? { ...init, headers, body: finalBody } : {}),
	});

	if (!res.ok) {
		let msg = `Request failed (${res.status})`;
		try {
			const j = await res.json();
			msg = j.detail || j.message || msg;
		} catch {
			try {
				msg = await res.text();
			} catch {}
		}
		throw new HttpError(res.status, msg);
	}
	return res.status === 204 ? (undefined as unknown as T) : res.json();
}

export function signup(name: string, email: string, password: string) {
	return postJSON<{ status: "pending_verification" | "ok" }>("/auth/signup", {
		name,
		email,
		password,
	});
}

export function verifyEmail(email: string, code: string) {
	return postJSON<{ status: "verified" | "ok" }>("/auth/verify-email", {
		email,
		code,
	});
}

export function resendVerification(email: string) {
	return postJSON<{ status: "ok" }>("/auth/resend-verification", { email });
}

export function loginDirect(email: string, password: string) {
	return postJSON<AuthResponse>("/auth/login", { email, password });
}

export function useApi() {
	const { token, setAuth, clearAuth } = useAuth();
	const router = useRouter();

	const withAuthHeaders = useCallback(
		(init?: RequestInit): RequestInit => {
			const headers = new Headers(init?.headers || {});
			if (token) headers.set("Authorization", `Bearer ${token}`);
			return { ...init, headers };
		},
		[token]
	);

	const handleAuthError = useCallback(
		(e: unknown) => {
			const err = e as { status?: number; detail?: string; message?: string };
			const detail = err.detail || err.message || "";
			if (err.status === 401) {
				clearAuth();
				router.replace("/login");
				return;
			}
			if (err.status === 403 && /onboarding required/i.test(detail)) {
				router.replace("/onboarding");
				return;
			}
		},
		[clearAuth, router]
	);

	const authedGet = useCallback(
		async <T>(path: string, init?: RequestInit) => {
			try {
				return await getJSON<T>(path, withAuthHeaders(init));
			} catch (e) {
				handleAuthError(e);
				throw e;
			}
		},
		[withAuthHeaders, handleAuthError]
	);

	const authedPost = useCallback(
		async <T>(path: string, body?: unknown, init?: RequestInit) => {
			try {
				return await postJSON<T>(path, body, withAuthHeaders(init));
			} catch (e) {
				handleAuthError(e);
				throw e;
			}
		},
		[withAuthHeaders, handleAuthError]
	);

	const authedPut = useCallback(
		async <T>(path: string, body?: unknown, init?: RequestInit) => {
			try {
				return await putJSON<T>(path, body, withAuthHeaders(init));
			} catch (e) {
				handleAuthError(e);
				throw e;
			}
		},
		[withAuthHeaders, handleAuthError]
	);

	const login = useCallback(
		async (email: string, password: string) => {
			const data = await loginDirect(email, password);
			setAuth({
				token: data.token,
				user: { id: data.id, name: data.name, email: data.email },
			});
			if (data.requires_onboarding) router.replace("/onboarding");
			return data;
		},
		[router, setAuth]
	);

	const logout = useCallback(() => {
		clearAuth();
		router.replace("/login");
	}, [clearAuth, router]);

	const getProfile = useCallback(
		() => authedGet<Profile>("/protected/profile"),
		[authedGet]
	);
	const updateOnboarding = useCallback(
		(input: OnboardingIn) =>
			authedPut<OnboardingResult>("/protected/onboarding", input),
		[authedPut]
	);
	const getProgress = useCallback(
		() => authedGet<ProgressOut>("/protected/progress"),
		[authedGet]
	);
	const getWallet = useCallback(
		() => authedGet<WalletOut>("/protected/wallet"),
		[authedGet]
	);
	const streakCheckin = useCallback(
		() => authedPost<CheckinOut>("/protected/streak/checkin", {}),
		[authedPost]
	);
	const loadQuests = useCallback(
		() => authedGet<QuestsLoadOut>("/protected/quests/load"),
		[authedGet]
	);
	const completeQuest = useCallback(
	  (quest_id: string) =>
		authedPost<CompleteQuestOut>("/protected/quests/complete", { quest_id }),
	  [authedPost]
	);

	return useMemo(
		() => ({
			signup,
			verifyEmail,
			resendVerification,
			login,
			logout,
			authedGet,
			authedPost,
			authedPut,
			getProfile,
			updateOnboarding,
			getProgress,
			getWallet,
			streakCheckin,
			loadQuests,
			completeQuest,
		}),
		[
			login,
			logout,
			authedGet,
			authedPost,
			authedPut,
			getProfile,
			updateOnboarding,
			getProgress,
			getWallet,
			streakCheckin,
			loadQuests,
			completeQuest,
		]
	);
}
