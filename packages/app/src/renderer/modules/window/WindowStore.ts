import { injectable } from "inversify"

@injectable()
export default class WindowStore {
	private _maximize = false

	isWindowMaximize(): boolean {
		return this._maximize
	}

	setWindowMaximizeState(state: boolean) {
		this._maximize = state
	}
}
