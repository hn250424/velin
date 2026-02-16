import { injectable } from "inversify"

export type Focus = "editor" | "tree" | "find-replace" | null

@injectable()
export default class FocusManager {
	private focusedTarget: Focus = null

	setFocus(focusedTarget: Focus) {
		this.focusedTarget = focusedTarget
	}

	getFocus() {
		return this.focusedTarget
	}
}
