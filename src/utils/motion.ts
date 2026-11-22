/** Small motion helpers shared by the site and the CMS (see src/styles/motion.css). */

export const reducedMotion = () =>
	typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const SPRING_POP =
	"linear(0, 0.0532, 0.1779, 0.334, 0.4941, 0.641, 0.7655, 0.8635, 0.9371, 0.9881, 1.0203, 1.038, 1.045, 1.0449, 1.0406, 1.0339, 1.0266, 1.0195, 1.0133, 1.0082, 1.0043, 1.0015, 0.9997, 0.9986, 0.998, 0.9979, 0.998, 0.9983, 1)";
const SPRING_SOFT =
	"linear(0, 0.0473, 0.1557, 0.2892, 0.4246, 0.5507, 0.6603, 0.7507, 0.8233, 0.8794, 0.9213, 0.9515, 0.9728, 0.9871, 0.9963, 1.0018, 1.0047, 1.006, 1.0062, 1.0057, 1.005, 1.0042, 1.0034, 1.0026, 1.0019, 1.0014, 1.001, 1.0007, 1)";
export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
export const EASE_IN = "cubic-bezier(0.55, 0, 1, 0.45)";

/**
 * "Pop on yes": the icon pops with a bouncy spring and six dots burst out.
 * Only call it for the positive action (adding a reaction), never on undo.
 */
export function celebrate(target: HTMLElement) {
	if (reducedMotion()) return;
	target.animate([{ transform: "scale(0.6)" }, { transform: "scale(1)" }], {
		duration: 550,
		easing: SPRING_POP,
	});
	const host = target.parentElement ?? target;
	const rect = target.getBoundingClientRect();
	const hostRect = host.getBoundingClientRect();
	const cx = rect.left - hostRect.left + rect.width / 2;
	const cy = rect.top - hostRect.top + rect.height / 2;
	if (getComputedStyle(host).position === "static") host.style.position = "relative";
	for (let i = 0; i < 6; i++) {
		const dot = document.createElement("span");
		const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
		dot.setAttribute("aria-hidden", "true");
		Object.assign(dot.style, {
			background: i % 2 ? "var(--color-accent)" : "oklch(70% 0.19 30)",
			borderRadius: "50%",
			height: "5px",
			left: `${cx - 2.5}px`,
			pointerEvents: "none",
			position: "absolute",
			top: `${cy - 2.5}px`,
			width: "5px",
		});
		host.append(dot);
		const dx = Math.cos(angle) * 20;
		const dy = Math.sin(angle) * 20;
		dot
			.animate(
				[
					{ opacity: 1, transform: "translate(0, 0) scale(1)" },
					{ opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(0.4)` },
				],
				{ duration: 400, easing: EASE_OUT },
			)
			.finished.finally(() => dot.remove());
	}
}

/** Rolls a number to its new value in the direction it moved (up when it grows). */
export function rollNumber(el: HTMLElement, next: string) {
	const prev = el.textContent ?? "";
	if (prev === next) return;
	el.textContent = next;
	if (reducedMotion() || !prev) return;
	const up = Number.parseFloat(next) >= Number.parseFloat(prev);
	el.animate(
		[
			{ opacity: 0, transform: `translateY(${up ? 60 : -60}%)` },
			{ opacity: 1, transform: "translateY(0)" },
		],
		{ duration: 750, easing: SPRING_SOFT },
	);
}

/** Horizontal "no" shake on the field that failed. */
export function shake(el: Element | null) {
	if (!el) return;
	el.classList.remove("motion-shake");
	void (el as HTMLElement).offsetWidth; // restart the animation
	el.classList.add("motion-shake");
	el.addEventListener("animationend", () => el.classList.remove("motion-shake"), { once: true });
}

/** Opens an element with the "grow from the trigger" motion. */
export function popIn(el: HTMLElement, origin = "top center") {
	if (reducedMotion()) return;
	el.style.transformOrigin = origin;
	el.animate(
		[
			{ opacity: 0, transform: "scale(0.9)" },
			{ opacity: 1, transform: "scale(1)" },
		],
		{
			duration: 220,
			easing: EASE_OUT,
		},
	);
}

/** Closes with a shorter exit, then runs `done`. */
export function popOut(el: HTMLElement, done: () => void) {
	if (reducedMotion()) return done();
	el.animate(
		[
			{ opacity: 1, transform: "scale(1)" },
			{ opacity: 0, transform: "scale(0.9)" },
		],
		{
			duration: 150,
			easing: EASE_IN,
		},
	).finished.then(done, done);
}

/** Bottom sheet enter: up from 100% on a soft spring. */
export function sheetIn(el: HTMLElement) {
	if (reducedMotion()) return;
	el.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], {
		duration: 750,
		easing: SPRING_SOFT,
	});
}

export function sheetOut(el: HTMLElement, from: number, done: () => void) {
	if (reducedMotion()) return done();
	el.animate([{ transform: `translateY(${from}px)` }, { transform: "translateY(100%)" }], {
		duration: 250,
		easing: EASE_IN,
	}).finished.then(done, done);
}

export function springBack(el: HTMLElement, from: number) {
	el.animate([{ transform: `translateY(${from}px)` }, { transform: "translateY(0)" }], {
		duration: 750,
		easing: SPRING_SOFT,
	});
}

/**
 * Reveal-on-scroll with a short stagger. Elements already visible at load are
 * left alone (never hide above-the-fold content). Children of
 * [data-reveal-stagger] arrive 50 ms apart, capped at 400 ms.
 */
export function initReveal(root: ParentNode = document) {
	if (reducedMotion() || !("IntersectionObserver" in window)) return;
	const targets: HTMLElement[] = [];
	targets.push(...root.querySelectorAll<HTMLElement>("[data-reveal]"));
	root.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((list) => {
		[...list.children].forEach((child, i) => {
			const c = child as HTMLElement;
			c.style.setProperty("--reveal-delay", `${Math.min(i * 50, 400)}ms`);
			targets.push(c);
		});
	});
	const fold = window.innerHeight;
	const pending = targets.filter((el) => el.getBoundingClientRect().top > fold);
	if (!pending.length) return;
	for (const el of pending) el.setAttribute("data-reveal-pending", "");
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				const el = e.target as HTMLElement;
				io.unobserve(el);
				el.removeAttribute("data-reveal-pending");
				el.setAttribute("data-revealed", "");
				el.addEventListener("animationend", () => el.removeAttribute("data-revealed"), {
					once: true,
				});
			}
		},
		{ rootMargin: "0px 0px -8% 0px" },
	);
	for (const el of pending) io.observe(el);
}

/** Small animated check mark for success messages. */
export const CHECK_SVG =
	'<svg class="motion-check" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>';
