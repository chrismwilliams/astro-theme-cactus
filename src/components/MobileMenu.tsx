import { useStore } from "@nanostores/solid";
import { menuOpen, toggleMenuOpen } from "@/stores/menu";

export default function Header() {
	const menuIsOpen = useStore(menuOpen);

	return (
		<button
			classList={{ "text-accent": menuIsOpen() }}
			aria-pressed={menuIsOpen()}
			onClick={toggleMenuOpen}
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
