"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput(props: PasswordInputProps) {
	const [show, setShow] = useState(false);

	return (
		<div className="relative">
			<Input type={show ? "text" : "password"} {...props} className="pr-10" />
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
				onClick={() => setShow((s) => !s)}
				tabIndex={-1}
			>
				{show ? (
					<Eye className="h-4 w-4 text-muted-foreground" />
				) : (
					<EyeOff className="h-4 w-4 text-muted-foreground" />
				)}
				<span className="sr-only">
					{show ? "Hide password" : "Show password"}
				</span>
			</Button>
		</div>
	);
}
