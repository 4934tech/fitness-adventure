"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const links = [
	{ href: "/dashboard", label: "Dashboard" }, // primary
	{ href: "/workouts", label: "Workouts" },
	{ href: "/quests", label: "Quests" },
	{ href: "/progress", label: "Progress" },
];

export function AppNav() {
	const pathname = usePathname();
	const router = useRouter();
	const { isAuthed, user, clearAuth } = useAuth();

	const handleLogout = () => {
		clearAuth();
		router.push("/login");
	};

	return (
		<nav className="flex items-center gap-4 sm:gap-6">
			{isAuthed ? (
				<>
					<Link
						key="/dashboard"
						href="/dashboard"
						className={cn(
							"text-sm font-medium transition-colors hover:text-primary",
							pathname === "/dashboard"
								? "text-primary"
								: "text-muted-foreground"
						)}
					>
						Dashboard
					</Link>
					<div className="hidden md:flex items-center gap-6">
						{links
							.filter((l) => l.href !== "/dashboard")
							.map((l) => (
								<Link
									key={l.href}
									href={l.href}
									className={cn(
										"text-sm font-medium transition-colors hover:text-primary",
										pathname === l.href
											? "text-primary"
											: "text-muted-foreground"
									)}
								>
									{l.label}
								</Link>
							))}
					</div>
					<div className="ml-auto flex items-center gap-3">
						<span className="hidden sm:inline text-sm text-muted-foreground">
							{user?.name || "Account"}
						</span>
						<Button
							size="sm"
							variant="outline"
							onClick={handleLogout}
							className="h-8 px-3"
						>
							Logout
						</Button>
					</div>
				</>
			) : (
				<div className="ml-auto flex items-center gap-3">
					<Link
						href="/login"
						className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Login
					</Link>
					<Link href="/signup">
						<Button size="sm" className="h-8 px-4">
							Sign up
						</Button>
					</Link>
				</div>
			)}
		</nav>
	);
}
