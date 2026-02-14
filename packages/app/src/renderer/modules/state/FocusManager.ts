import { injectable } from "inversify"

type Target = "editor" | "tree" | "find_replace" | null

@injectable()
export default class FocusManager {
	private focusedTarget: Target = null

	setFocus(focusedTarget: Target) {
		this.focusedTarget = focusedTarget
	}

	getFocus() {
		return this.focusedTarget
	}
}
