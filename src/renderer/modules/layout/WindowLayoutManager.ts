export default class WindowLayoutManager {
    private static instance: WindowLayoutManager | null = null
    private windowMaxStatus = false
    
    private constructor() {}

    static getInstance(): WindowLayoutManager {
        if (this.instance === null) {
            this.instance = new WindowLayoutManager()
        }

        return this.instance
    }

    isWindowMax(): boolean {
        return this.windowMaxStatus
    }

    setWindowMax(status: boolean) {
        this.windowMaxStatus = status
    }
}