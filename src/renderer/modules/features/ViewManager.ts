export default class ViewManager {
    private static instance: ViewManager | null = null
    private windowMaxStatus = false
    
    private constructor() {}

    static getInstance(): ViewManager {
        if (this.instance === null) {
            this.instance = new ViewManager()
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