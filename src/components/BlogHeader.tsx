import { createSignal } from "solid-js";
import styles from "./blogHeader.module.css";

export default function BlogHeader(props) {
	const [open, setOpen] = createSignal(true);

	const toggle = () => {
		setOpen(!open());
	};

	return (
		<header class={styles.header}>
			<nav
				role="navigation"
				class={`${styles.nav} ${open() ? "visible" : "invisible"}`}
			>
				<div class={styles.nav_pages}>
					<a href="/" class={styles.nav_pages__a}>
						Home
					</a>
					<a href="/about" class={styles.nav_pages__a}>
						About
					</a>
					<a href="/posts" class={styles.nav_pages__a}>
						Writings
					</a>
				</div>
				<div class={styles.nav_blog}>
					{props.prev && (
						<a
							href={props.prev}
							aria-label="Previous Post"
							class={styles.nav_blog__a}
							data-tooltip="Previous post"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class={styles.nav_blog__a__svg}
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<polyline points="15 6 9 12 15 18" />
							</svg>
						</a>
					)}
					{props.next && (
						<a
							href={props.next}
							aria-label="Next Post"
							class={styles.nav_blog__a}
							data-tooltip="Next post"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class={styles.nav_blog__a__svg}
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<polyline points="9 6 15 12 9 18" />
							</svg>
						</a>
					)}
				</div>
				{props.headers?.length && (
					<ul class={styles.nav_toc}>
						{props.headers.map(({ depth, slug, text }) => (
							<li>
								<a href={`#${slug}`} class={styles.nav_toc__a}>
									&#35; {text}
								</a>
							</li>
						))}
					</ul>
				)}
			</nav>
			<button
				type="button"
				onClick={toggle}
				class={`${styles.header__button} ${open() && "text-accent"}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-6 h-6"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<line x1="4" y1="6" x2="20" y2="6"></line>
					<line x1="4" y1="12" x2="20" y2="12"></line>
					<line x1="4" y1="18" x2="20" y2="18"></line>
				</svg>
			</button>
		</header>
	);
}
