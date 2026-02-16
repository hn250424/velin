import { injectable } from "inversify"
import type { Focus } from "./types/Focus"

@injectable()
export default class FocusManager {
	private focusedTarget: Focus = "none"

	setFocus(focusedTarget: Focus) {
		this.focusedTarget = focusedTarget
	}

	getFocus() {
		return this.focusedTarget
	}
}
