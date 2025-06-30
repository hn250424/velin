export default class ZoomManager {
    private static instance: ZoomManager | null = null
    private zoomLevel = 1
    private contentContainer: HTMLElement
    
    private constructor() {
        this.contentContainer = document.getElementById('content')
    }

    static getInstance(): ZoomManager {
        if (this.instance === null) {
            this.instance = new ZoomManager()
        }

        return this.instance
    }

    zoomIn() {
        this.setZoom(this.zoomLevel + 0.1)
    }

    zoomOut() {
        this.setZoom(this.zoomLevel - 0.1)
    }

    resetZoom() {
        this.setZoom(1)
    }

    private setZoom(level: number) {
        this.zoomLevel = Math.max(0.1, Math.min(level, 3))
        this.contentContainer.style.transform = `scale(${this.zoomLevel})`
        this.contentContainer.style.width = `${100 / this.zoomLevel}%`
        this.contentContainer.style.height = `${100 / this.zoomLevel}%`

        // document.querySelectorAll('.editorBox').forEach(box => {
        //     const el = box as HTMLElement
        //     el.style.transform = `scale(${this.zoomLevel})`
        //     el.style.width = `${100 / this.zoomLevel}%`
        //     el.style.height = `${100 / this.zoomLevel}%`
        // })
    }
}