export default class LayoutManager {
    private static instance: LayoutManager | null = null
    private windowMaxStatus = false
    private treeOpenStatus = false
    
    private constructor() {}

    static getInstance(): LayoutManager {
        if (this.instance === null) {
            this.instance = new LayoutManager()
        }

        return this.instance
    }

    isWindowMax(): boolean {
        return this.windowMaxStatus
    }

    setWindowMax(status: boolean) {
        this.windowMaxStatus = status
    }

    isTreeOpen(): boolean {
        return this.treeOpenStatus
    }

    setTreeOpen(open: boolean) {
        this.treeOpenStatus = open
    }
}