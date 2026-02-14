import DI_KEYS from "@renderer/constants/di_keys";
import { inject, injectable } from "inversify"
import type InfoElements from "./InfoElements";

@injectable()
export default class InfoFacade {
	constructor(@inject(DI_KEYS.SideState) public readonly elements: InfoElements) {}

	showInformation() {
		this.elements.overlay.style.display = "flex"
	}

	hideInformation() {
		this.elements.overlay.style.display = "none"
	}
}
