import DI_KEYS from "@renderer/constants/di_keys"
import { inject, injectable } from "inversify"
import { SideElements } from "./SideElements"

@injectable()
export class SideRenderer {
	constructor(@inject(DI_KEYS.SideElements) readonly elements: SideElements) {}

	updateSideWidth(width: number) {
		this.elements.tree.style.width = `${width}px`;
	}

	setResizingCursor(isResizing: boolean) {
		document.body.style.cursor = isResizing ? "ew-resize" : "";
    document.body.style.userSelect = isResizing ? "none" : "";
	}
}
