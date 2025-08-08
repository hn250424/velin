export default class SideState {
    private _isOpen = false
    
    constructor() {}

    isOpen(): boolean {
        return this._isOpen
    }

    setOpenState(state: boolean) {
        this._isOpen = state
    }
}