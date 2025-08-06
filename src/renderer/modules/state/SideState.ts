export default class SideState {
    private static instance: SideState | null = null
    private _isOpen = false
    
    private constructor() {}

    static getInstance(): SideState {
        if (this.instance === null) {
            this.instance = new SideState()
        }

        return this.instance
    }

    isOpen(): boolean {
        return this._isOpen
    }

    setOpenState(state: boolean) {
        this._isOpen = state
    }
}