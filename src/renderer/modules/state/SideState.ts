export default class SideState {
    private _isTreeOpen = true
    private _treeWidth = 150

    private _isSettingsOpen = false
    
    constructor() {}

    isTreeOpen(): boolean {
        return this._isTreeOpen
    }

    setTreeOpenState(state: boolean) {
        this._isTreeOpen = state
    }

    getTreeWidth() {
        return this._treeWidth
    }

    setTreeSidth(width: number) {
        this._treeWidth = width
    }

    getSettingsOpen() {
        return this._isSettingsOpen
    }

    setSettingsOpenState(state: boolean) {
        this._isSettingsOpen = state
    }
}