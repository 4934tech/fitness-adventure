"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type User = { id: string; name: string; email: string };

type AuthState = {
	token: string | null;
	user: User | null;
	requires_onboarding: boolean;
};

type AuthContextType = {
	token: string | null;
	user: User | null;
	requires_onboarding: boolean;
	setAuth: (next: Partial<AuthState>) => void;
	clearAuth: () => void;
	isAuthed: boolean;
	hydrated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "authToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [requiresOnboarding, setRequiresOnboarding] = useState<boolean>(false);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) setToken(stored);
		} catch {}
		setHydrated(true);
	}, []);

	useEffect(() => {
		try {
			if (token) localStorage.setItem(STORAGE_KEY, token);
			else localStorage.removeItem(STORAGE_KEY);
		} catch {}
	}, [token]);

	const value = useMemo<AuthContextType>(
		() => ({
			token,
			user,
			requires_onboarding: requiresOnboarding,
			setAuth: (next) => {
				if (next.token !== undefined) setToken(next.token);
				if (next.user !== undefined) setUser(next.user ?? null);
				if (next.requires_onboarding !== undefined)
					setRequiresOnboarding(next.requires_onboarding);
			},
			clearAuth: () => {
				setToken(null);
				setUser(null);
				setRequiresOnboarding(false);
				localStorage.removeItem(STORAGE_KEY);
			},
			isAuthed: !!token,
			hydrated,
		}),
		[token, user, requiresOnboarding, hydrated]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
	return ctx;
}

export function useRequireAuth(loginPath = "/login") {
	const { isAuthed, hydrated } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!hydrated) return;
		if (!isAuthed) {
			const next = encodeURIComponent(pathname || "/");
			router.replace(`${loginPath}?next=${next}`);
		}
	}, [hydrated, isAuthed, router, pathname, loginPath]);

	return { isAuthed, hydrated };
}
