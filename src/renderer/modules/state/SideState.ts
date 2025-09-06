export default class SideState {
    private _isOpen = true
    private _width = 150
    
    constructor() {}

    isOpen(): boolean {
        return this._isOpen
    }

    setOpenState(state: boolean) {
        this._isOpen = state
    }

    getWidth() {
        return this._width
    }

    setSidth(width: number) {
        this._width = width
    }
}