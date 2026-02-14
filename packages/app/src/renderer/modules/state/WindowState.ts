export default class WindowState {
	private _maximize = false

	isWindowMaximize(): boolean {
		return this._maximize
	}

	setWindowMaximizeState(state: boolean) {
		this._maximize = state
	}
}
