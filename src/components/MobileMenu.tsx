import { createSignal, createEffect } from "solid-js";

export default function Header() {
	const [menuOpen, setMenuOpen] = createSignal(true);

	createEffect(() => {
		const body = document.getElementsByTagName("body")[0];
		if (menuOpen()) {
			body.classList.add("mobile-toggle");
		} else {
			body.classList.remove("mobile-toggle");
		}
	});

	const toggle = () => setMenuOpen(!menuOpen());

	return (
		<button
			class={`sm:hidden sm:invisible ml-6`}
			classList={{ "text-accent": menuOpen() }}
			aria-pressed={menuOpen() ? "true" : "false"}
			onClick={toggle}
		>
			<svg
				class="w-6 h-6"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
					clip-rule="evenodd"
				></path>
			</svg>
			<span class="sr-only">Toggle Mobile Menu</span>
		</button>
	);
}
