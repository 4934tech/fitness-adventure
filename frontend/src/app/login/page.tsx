"use client";

import { Suspense, useState } from "react";
import LoginInner from "@/app/login/inner-page";

export default function LoginPage() {
	return (
		<Suspense
			fallback={<div className="mx-auto max-w-md px-4 py-12">Loading…</div>}
		>
			<LoginInner />
		</Suspense>
	);
}
