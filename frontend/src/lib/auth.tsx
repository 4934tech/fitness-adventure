"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type AuthState = {
	token: string | null;
	user: { id: string; name: string; email: string } | null;
};

type AuthContextType = {
	token: string | null;
	user: AuthState["user"];
	setAuth: (next: Partial<AuthState>) => void;
	clearAuth: () => void;
	isAuthed: boolean;
	hydrated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "authState";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<AuthState["user"]>(null);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as AuthState;
				setToken(parsed.token || null);
				setUser(parsed.user || null);
			}
		} catch {}
		setHydrated(true);
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
		} catch {}
	}, [token, user]);

	const value = useMemo<AuthContextType>(
		() => ({
			token,
			user,
			setAuth: (next) => {
				if (next.token !== undefined) setToken(next.token);
				if (next.user !== undefined) setUser(next.user);
			},
			clearAuth: () => {
				setToken(null);
				setUser(null);
				localStorage.removeItem(STORAGE_KEY);
			},
			isAuthed: !!token,
			hydrated,
		}),
		[token, user, hydrated]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
	return ctx;
}

export function useRequireAuth(to: string = "/login") {
	const { isAuthed, hydrated } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!hydrated) return;
		if (!isAuthed) {
			const next = encodeURIComponent(pathname || "/");
			router.replace(`${to}?next=${next}`);
		}
	}, [hydrated, isAuthed, router, pathname, to]);

	return { isAuthed, hydrated };
}
