import { setMenuOpen } from "@/stores/menu";

interface Props {
	slug: string;
	text: string;
}

export default function TOCLink(props: Props) {
	return (
		<a href={`#${props.slug}`} onClick={() => setMenuOpen(false)}>
			&#35; {props.text}
		</a>
	);
}
