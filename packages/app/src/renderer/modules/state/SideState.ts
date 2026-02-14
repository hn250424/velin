export default class SideState {
	private _isTreeOpen = true
	private _treeWidth = 150

	isTreeOpen(): boolean {
		return this._isTreeOpen
	}

	setTreeOpenState(state: boolean) {
		this._isTreeOpen = state
	}

	getTreeWidth() {
		return this._treeWidth
	}

	setTreeWidth(width: number) {
		this._treeWidth = width
	}
}
