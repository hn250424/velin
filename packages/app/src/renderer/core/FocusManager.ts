import { injectable } from "inversify"
import type { Focus } from "./types/Focus"
import { SELECTOR_EDITOR_CONTAINER, SELECTOR_FIND_REPLACE_CONTAINER, SELECTOR_TREE } from "@renderer/constants/dom"

@injectable()
export class FocusManager {
	private focusedTarget: Focus = "none"

	setFocus(focusedTarget: Focus) {
		this.focusedTarget = focusedTarget
	}

	getFocus() {
		return this.focusedTarget
	}

	trackRelevantFocus(target: HTMLElement) {
		if (target.closest(SELECTOR_EDITOR_CONTAINER)) {
			this.setFocus("editor")
		} else if (target.closest(SELECTOR_TREE)) {
			this.setFocus("tree")
		} else if (target.closest(SELECTOR_FIND_REPLACE_CONTAINER)) {
			this.setFocus("find-replace")
		}
	}
}
