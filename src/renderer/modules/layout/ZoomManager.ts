import { electronAPI } from "@shared/constants/electronAPI"

export default class ZoomManager {
    private static instance: ZoomManager | null = null
    private zoomLevel = 1
    
    private constructor() {}

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
        window[electronAPI.channel].setZoomFactor(this.zoomLevel)
    }
}