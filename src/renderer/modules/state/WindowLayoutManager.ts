export default class WindowLayoutManager {
    private windowMaxStatus = false
    
    constructor() {}

    isWindowMax(): boolean {
        return this.windowMaxStatus
    }

    setWindowMax(status: boolean) {
        this.windowMaxStatus = status
    }
}