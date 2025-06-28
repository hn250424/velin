export default class WindowManager {
    private static instance: WindowManager | null = null
    private windowMaxStatus = false
    
    private constructor() {}

    static getInstance(): WindowManager {
        if (this.instance === null) {
            this.instance = new WindowManager()
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