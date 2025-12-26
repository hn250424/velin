import { inject, injectable } from "inversify";
import FocusManager from "../state/FocusManager";
import DI_KEYS from "../../constants/di_keys";

@injectable()
export default class ShortcutRegistry {
	private shortcutMap = new Map<string, (e: KeyboardEvent) => any>();

	constructor(@inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager) {}

	register(key: string, handler: (e: KeyboardEvent) => any) {
		this.shortcutMap.set(key, handler);
	}

	handleKeyEvent(e: KeyboardEvent) {
		const key = this.getKeyString(e);
		// console.log(key)
		const handler = this.shortcutMap.get(key);
		if (handler) {
			// Prevent the default browser behavior only when the focus is NOT inside the editor.
			// This avoids interfering with native editor shortcuts (like copy/paste),
			// while ensuring custom shortcuts work properly in other UI areas (e.g., sidebar, tree view).
			if (this.focusManager.getFocus() !== "editor") e.preventDefault();

			handler(e);
		}
	}

	getKeyString(e: KeyboardEvent): string {
		const parts = [];
		if (e.ctrlKey) parts.push("Ctrl");
		if (e.shiftKey) parts.push("Shift");
		if (e.altKey) parts.push("Alt");

		let key = e.key;

		if (key === "=") key = "+";
		if (key === "Escape") key = "Esc";
		if (key === " ") key = "Space";

		parts.push(key.toUpperCase());
		return parts.join("+");
	}
}
