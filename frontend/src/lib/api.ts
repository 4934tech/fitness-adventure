"use client";

import { useAuth } from "@/lib/auth";

export type AuthResponse = {
	id: string;
	name: string;
	email: string;
	token: string;
	token_expiry: string;
};

export const API_BASE = process.env.API_URL || "http://localhost:8000";

async function postJSON<T>(
	path: string,
	body: unknown,
	init?: RequestInit
): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
		body: JSON.stringify(body),
		credentials: "include",
		...init,
	});

	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			const json = await res.json();
			message = json.detail || json.message || message;
		} catch {
			message = await res.text();
		}
		throw new Error(message);
	}
	return res.status === 204 ? (undefined as unknown as T) : res.json();
}

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: "GET",
		headers: { ...(init?.headers || {}) },
		credentials: "include",
		...init,
	});

	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			const json = await res.json();
			message = json.detail || json.message || message;
		} catch {
			message = await res.text();
		}
		throw new Error(message);
	}
	return res.json();
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
	// TODO: Should probably be deleted
	return postJSON<AuthResponse>("/auth/login", { email, password });
}

export function useApi() {
	const { token, setAuth, clearAuth } = useAuth();

	function withAuthHeaders(init?: RequestInit): RequestInit {
		const headers = new Headers(init?.headers || {});
		if (token) headers.set("Authorization", `Bearer ${token}`);
		return { ...init, headers };
	}

	async function authedGet<T>(path: string, init?: RequestInit): Promise<T> {
		try {
			return await getJSON<T>(path, withAuthHeaders(init));
		} catch (e: unknown) {
			if (e instanceof Error && /401|403/i.test(e.message)) clearAuth();
			throw e;
		}
	}

	async function authedPost<T>(
		path: string,
		body?: unknown,
		init?: RequestInit
	): Promise<T> {
		try {
			return await postJSON<T>(path, body, withAuthHeaders(init));
		} catch (e: unknown) {
			if (e instanceof Error && /401|403/i.test(e.message)) {
				clearAuth();
			}
			throw e;
		}
	}

	async function login(email: string, password: string) {
		const data = await loginDirect(email, password);
		setAuth({
			token: data.token,
			user: { id: data.id, name: data.name, email: data.email },
		});
		return data;
	}

	function logout() {
		clearAuth();
	}

	function getMe() {
		return authedGet<{ id: string; name: string; email: string }>("/me");
	}

	return {
		// public
		signup,
		verifyEmail,
		resendVerification,
		// auth-bound
		login,
		logout,
		authedGet,
		authedPost,
		getMe,
	};
}
